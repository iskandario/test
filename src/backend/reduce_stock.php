<?php
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

function logMessage($msg) {
  file_put_contents(__DIR__ . '/reduce_stock.log', date('Y-m-d H:i:s') . " - " . $msg . PHP_EOL, FILE_APPEND);
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

/* ==========================
   DB
========================== */
$conn = new mysqli('localhost', 'u2937043_u275448', 'tGYGVCp7Is39n8Tc', 'u2937043_u2754480_default');
$conn->set_charset("utf8mb4");
if ($conn->connect_error) {
  logMessage("DB connection failed: " . $conn->connect_error);
  http_response_code(500);
  echo json_encode(['error' => 'DB connection failed'], JSON_UNESCAPED_UNICODE);
  exit;
}

/* ==========================
   INPUT order_id
========================== */
$orderId = $_GET['order_id'] ?? null;

if (!$orderId) {
  $body = json_decode(file_get_contents('php://input'), true);
  if (is_array($body) && !empty($body['order_id'])) $orderId = $body['order_id'];
}

$orderId = trim((string)$orderId);
if ($orderId === '') {
  logMessage("Missing order_id");
  http_response_code(400);
  echo json_encode(['error' => 'Missing order_id'], JSON_UNESCAPED_UNICODE);
  exit;
}

logMessage("Reduce stock request for order_id=$orderId");

/* ==========================
   Transaction
========================== */
$conn->begin_transaction();

try {
  // 1) Check order exists + lock row + проверяем статус
  $q = $conn->prepare("SELECT payment_status, stock_reduced FROM orders WHERE order_id = ? FOR UPDATE");
  if (!$q) throw new Exception("Prepare orders select failed: " . $conn->error);
  $q->bind_param('s', $orderId);
  if (!$q->execute()) throw new Exception("Execute orders select failed: " . $q->error);
  $q->bind_result($paymentStatus, $stockReduced);
  $has = $q->fetch();
  $q->close();

  if (!$has) throw new Exception("Order not found: $orderId");

  // Проверяем статус оплаты
  if ($paymentStatus !== 'succeeded') {
    throw new Exception("Order $orderId payment_status is '$paymentStatus', not 'succeeded'. Cannot reduce stock.");
  }

  // Проверяем, не списан ли уже товар
  if ($stockReduced == 1) {
    logMessage("Order $orderId already reduced (stock_reduced=1). Skip.");
    $conn->commit();
    echo json_encode(['status' => 'ok', 'message' => 'Already reduced'], JSON_UNESCAPED_UNICODE);
    exit;
  }

  // 2) Read order products
  $items = [];
  $p = $conn->prepare("SELECT product_id, size, quantity FROM order_products WHERE order_id = ?");
  if (!$p) throw new Exception("Prepare order_products select failed: " . $conn->error);
  $p->bind_param('s', $orderId);
  if (!$p->execute()) throw new Exception("Execute order_products select failed: " . $p->error);
  $res = $p->get_result();
  while ($row = $res->fetch_assoc()) {
    $items[] = $row;
  }
  $p->close();

  if (count($items) === 0) throw new Exception("No order_products rows for order $orderId");

  // 3) Дополнительная проверка: товар все еще доступен?
  foreach ($items as $it) {
    $productId = (int)$it['product_id'];
    $size = trim((string)$it['size']);
    $qty = (int)$it['quantity'];
    
    // Определяем столбец
    $sizeColumn = null;
    if ($size === 'S') $sizeColumn = 'size_s_quantity';
    elseif ($size === 'M') $sizeColumn = 'size_m_quantity';
    elseif ($size === 'L') $sizeColumn = 'size_l_quantity';
    elseif ($size === 'C' || $size === 'Единый размер') $sizeColumn = 'size_c_quantity';
    elseif ($size === 'Индивидуальный пошив') $sizeColumn = 'size_i_quantity';
    
    if (!$sizeColumn) throw new Exception("Unknown size '$size' for product $productId");
    
    // Проверяем наличие
    $check = $conn->prepare("SELECT $sizeColumn FROM products WHERE id = ?");
    $check->bind_param('i', $productId);
    $check->execute();
    $check->bind_result($available);
    $check->fetch();
    $check->close();
    
    if ($available < $qty) {
        throw new Exception("Товар закончился: product_id=$productId, size=$size, need=$qty, available=$available");
    }
  }

  // 4) For each item: lock product row, check stock, reduce
  foreach ($items as $it) {
    $productId = (int)$it['product_id'];
    $size = trim((string)$it['size']);
    $qty = (int)$it['quantity'];

    if ($productId <= 0 || $qty <= 0) throw new Exception("Bad item in order_products for $orderId");

    // Определяем столбец для размера
    $sizeColumn = null;
    if ($size === 'S') $sizeColumn = 'size_s_quantity';
    elseif ($size === 'M') $sizeColumn = 'size_m_quantity';
    elseif ($size === 'L') $sizeColumn = 'size_l_quantity';
    elseif ($size === 'C' || $size === 'Единый размер') $sizeColumn = 'size_c_quantity';
    elseif ($size === 'Индивидуальный пошив') $sizeColumn = 'size_i_quantity';
    
    if (!$sizeColumn) throw new Exception("Unknown size '$size' for product $productId");

    // lock product row
    $s = $conn->prepare("SELECT `$sizeColumn` FROM products WHERE id = ? FOR UPDATE");
    if (!$s) throw new Exception("Prepare stock select failed: " . $conn->error);
    $s->bind_param('i', $productId);
    if (!$s->execute()) throw new Exception("Execute stock select failed: " . $s->error);
    $s->bind_result($cur);
    $s->fetch();
    $s->close();

    if ($cur === null) throw new Exception("Product not found or NULL stock: id=$productId col=$sizeColumn");
    if ((int)$cur < $qty) throw new Exception("Not enough stock: id=$productId size=$size have=$cur need=$qty");

    $newQty = (int)$cur - $qty;

    $u = $conn->prepare("UPDATE products SET `$sizeColumn` = ? WHERE id = ?");
    if (!$u) throw new Exception("Prepare stock update failed: " . $conn->error);
    $u->bind_param('ii', $newQty, $productId);
    if (!$u->execute()) throw new Exception("Execute stock update failed: " . $u->error);
    $u->close();

    logMessage("Reduced product $productId size='$size' ($sizeColumn): $cur -> $newQty (minus $qty)");
  }

  // 5) Mark order as reduced (idempotency flag)
  $m = $conn->prepare("UPDATE orders SET stock_reduced = 1 WHERE order_id = ?");
  if (!$m) throw new Exception("Prepare orders mark failed: " . $conn->error);
  $m->bind_param('s', $orderId);
  $m->execute();
  $m->close();

  $conn->commit();

  echo json_encode(['status' => 'success', 'order_id' => $orderId], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
  $conn->rollback();
  logMessage("ERROR: " . $e->getMessage());
  http_response_code(400);
  echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
} finally {
  $conn->close();
}
?>