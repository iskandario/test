<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// =======================
// НАСТРОЙКИ
// =======================
$LOG = __DIR__ . '/payment_logs.txt';

$db_host = 'localhost';
$db_name = 'u2937043_u2754480_default';
$db_user = 'u2937043_u275448';
$db_pass = 'tGYGVCp7Is39n8Tc';

// =======================
// ЛОГ СТАРТА
// =======================
file_put_contents($LOG, date('Y-m-d H:i:s') . " === WEBHOOK START ===\n", FILE_APPEND);

// =======================
// ЧИТАЕМ PAYLOAD
// =======================
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['object'])) {
    file_put_contents($LOG, date('Y-m-d H:i:s') . " ERROR: invalid payload\n", FILE_APPEND);
    http_response_code(400);
    echo json_encode(['status' => 'error']);
    exit;
}

$payment = $data['object'];
$status  = $payment['status'] ?? '';
$metadata = $payment['metadata'] ?? [];

file_put_contents(
    $LOG,
    date('Y-m-d H:i:s') . " Payment status: $status | metadata: " . json_encode($metadata) . "\n",
    FILE_APPEND
);

// =======================
// ОБЯЗАТЕЛЬНО: order_id
// =======================
$orderId = $metadata['order_id'] ?? null;

if (!$orderId) {
    file_put_contents($LOG, date('Y-m-d H:i:s') . " ERROR: order_id missing\n", FILE_APPEND);
    echo json_encode(['status' => 'ok']);
    exit;
}

// =======================
// БАЗА
// =======================
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    file_put_contents($LOG, date('Y-m-d H:i:s') . " DB ERROR\n", FILE_APPEND);
    echo json_encode(['status' => 'error']);
    exit;
}
$conn->set_charset("utf8mb4");

// =======================
// ОБНОВЛЯЕМ СТАТУС
// =======================
$stmt = $conn->prepare("UPDATE orders SET payment_status = ? WHERE order_id = ?");
$stmt->bind_param('ss', $status, $orderId);
$stmt->execute();
$stmt->close();

file_put_contents(
    $LOG,
    date('Y-m-d H:i:s') . " Order $orderId updated to $status\n",
    FILE_APPEND
);

// =======================
// ЕСЛИ УСПЕХ — ПОСЛЕОПЛАТНЫЕ ШАГИ
// =======================
if ($status === 'succeeded') {
    // 🔻 списание склада ТОЛЬКО при успешной оплате
    $reduce_url = "https://vyacheslavnabrand.ru/reduce_stock.php?order_id=" . urlencode($orderId);
    $reduce_res = @file_get_contents($reduce_url);

    file_put_contents(
        $LOG,
        date('Y-m-d H:i:s') . " reduce_stock: $reduce_res\n",
        FILE_APPEND
    );

    // 📧 письмо админу + клиенту
    $mail_url = "https://vyacheslavnabrand.ru/admin_mail.php?order_id=" . urlencode($orderId);

    $ch = curl_init($mail_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $mail_res = curl_exec($ch);
    curl_close($ch);

    file_put_contents(
        $LOG,
        date('Y-m-d H:i:s') . " admin_mail response: $mail_res\n",
        FILE_APPEND
    );

    // 📲 Telegram админу (если нужен)
    sendTelegramNotification($conn, $orderId, $LOG);
}

$conn->close();

echo json_encode(['status' => 'ok']);
exit;


// =================================================================
// TELEGRAM (ТОЛЬКО ТОВАРЫ)
// =================================================================
function sendTelegramNotification($conn, $orderId, $LOG) {

    if (!defined('TELEGRAM_BOT_TOKEN') || !defined('ADMIN_CHAT_ID')) {
        file_put_contents($LOG, date('Y-m-d H:i:s') . " Telegram skipped\n", FILE_APPEND);
        return;
    }

    $stmt = $conn->prepare("
        SELECT o.*, 
        GROUP_CONCAT(CONCAT(op.product_name,' (',op.size,', ',op.quantity,'шт)') SEPARATOR '; ') products
        FROM orders o
        LEFT JOIN order_products op ON o.order_id = op.order_id
        WHERE o.order_id = ?
        GROUP BY o.order_id
    ");
    $stmt->bind_param('s', $orderId);
    $stmt->execute();
    $res = $stmt->get_result();
    $order = $res->fetch_assoc();
    $stmt->close();

    if (!$order) return;

    $msg =
        "🛍 *НОВЫЙ ОПЛАЧЕННЫЙ ЗАКАЗ*\n\n" .
        "🆔 $orderId\n" .
        "💰 {$order['total_price']} ₽\n" .
        "👤 {$order['customer_name']}\n" .
        "📞 {$order['customer_phone']}\n" .
        "📦 {$order['products']}";

    file_get_contents(
        "https://api.telegram.org/bot" . TELEGRAM_BOT_TOKEN . "/sendMessage?" .
        http_build_query([
            'chat_id' => ADMIN_CHAT_ID,
            'text' => $msg,
            'parse_mode' => 'Markdown'
        ])
    );

    file_put_contents($LOG, date('Y-m-d H:i:s') . " Telegram sent\n", FILE_APPEND);
}