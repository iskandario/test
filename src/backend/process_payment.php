<?php
session_start();
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);
ini_set('error_log', __DIR__ . '/error_log.txt');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require __DIR__ . '/yookassa/lib/autoload.php';
use YooKassa\Client;

function jsonOut(int $code, array $data) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function normalizePhoneForYooKassa(string $phone): string {
    $digits = preg_replace('/\D+/', '', $phone);
    if (strlen($digits) === 11 && $digits[0] === '8') {
        $digits = '7' . substr($digits, 1);
    }
    if (strlen($digits) === 11 && $digits[0] === '7') {
        return '+' . $digits;
    }
    if (strlen($digits) === 10) {
        return '+7' . $digits;
    }
    if (strlen($digits) >= 11 && strlen($digits) <= 15) {
        return '+' . $digits;
    }
    return $phone;
}

/* ==========================
   DB
========================== */
$conn = new mysqli(
    'localhost',
    'u2937043_u275448',
    'tGYGVCp7Is39n8Tc',
    'u2937043_u2754480_default'
);
$conn->set_charset('utf8mb4');

if ($conn->connect_error) {
    jsonOut(500, ['error' => 'DB connection failed']);
}

/* ==========================
   INPUT
========================== */
$data = json_decode(file_get_contents('php://input'), true);

if (
    json_last_error() !== JSON_ERROR_NONE ||
    empty($data['products']) ||
    empty($data['total']) ||
    empty($data['email']) ||
    empty($data['phoneNumber']) ||
    empty($data['city']) ||
    empty($data['address']) ||
    empty($data['lastName']) ||
    empty($data['firstName'])
) {
    jsonOut(400, ['error' => 'Invalid input']);
}

$total = (float)$data['total'];
if ($total <= 0) {
    jsonOut(400, ['error' => 'Invalid total']);
}

$isTestPay = isset($_COOKIE['vp_test_pay']) && $_COOKIE['vp_test_pay'] === '1';

/* ==========================
   ПРОВЕРКА НАЛИЧИЯ ТОВАРА И СОЗДАНИЕ ЗАКАЗА
========================== */
$conn->begin_transaction();

try {
    // 1. Проверяем наличие товара на складе и уменьшаем количество
    foreach ($data['products'] as $p) {
        $productId = (int)$p['id'];
        $size = (string)$p['sizeSelect'];
        $quantity = (int)$p['quantity'];
        $title = (string)$p['title'];
        
        // Определяем столбец в БД для этого размера
        $sizeColumn = null;
        if ($size === 'S') $sizeColumn = 'size_s_quantity';
        elseif ($size === 'M') $sizeColumn = 'size_m_quantity';
        elseif ($size === 'L') $sizeColumn = 'size_l_quantity';
        elseif ($size === 'C' || $size === 'Единый размер') $sizeColumn = 'size_c_quantity';
        elseif ($size === 'Индивидуальный пошив') $sizeColumn = 'size_i_quantity';
        
        if (!$sizeColumn) {
            throw new Exception("Неизвестный размер: $size");
        }
        
        // Проверяем наличие товара
        $checkStmt = $conn->prepare("SELECT $sizeColumn FROM products WHERE id = ? FOR UPDATE");
        if (!$checkStmt) throw new Exception("Не удалось проверить товар");
        $checkStmt->bind_param('i', $productId);
        $checkStmt->execute();
        $checkStmt->bind_result($availableQuantity);
        $checkStmt->fetch();
        $checkStmt->close();
        
        if ($availableQuantity === null) {
            throw new Exception("Товар не найден: " . $title);
        }
        
        if ($availableQuantity < $quantity) {
            throw new Exception("Недостаточно товара на складе: " . $title . " (размер: $size). Доступно: $availableQuantity шт.");
        }
        
        // Уменьшаем количество СРАЗУ
        $updateStmt = $conn->prepare("UPDATE products SET $sizeColumn = $sizeColumn - ? WHERE id = ?");
        $updateStmt->bind_param('ii', $quantity, $productId);
        if (!$updateStmt->execute()) {
            throw new Exception("Не удалось обновить склад товара: " . $title);
        }
        $updateStmt->close();
    }
    
    // 2. Создаем заказ
    $order_id = uniqid('order_', true);
    $customer_name = trim($data['lastName'] . ' ' . $data['firstName'] . ' ' . ($data['middleName'] ?? ''));
    $delivery_address = trim($data['city'] . ', ' . $data['address']);
    $comment = trim($data['comment'] ?? '');
    
    if ($isTestPay) {
        $comment = trim('[TEST_PAY_1RUB] ' . $comment);
    }
    
    $email = trim((string)$data['email']);
    $phone = normalizePhoneForYooKassa((string)$data['phoneNumber']);
    
    // Сохраняем заказ
    $stmt = $conn->prepare("
        INSERT INTO orders
        (order_id, customer_name, customer_email, customer_phone, delivery_address, total_price, payment_status, comment)
        VALUES (?, ?, ?, ?, ?, ?, 'waiting', ?)
    ");
    
    $stmt->bind_param(
        'sssssss',
        $order_id,
        $customer_name,
        $email,
        $phone,
        $delivery_address,
        $total,
        $comment
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Не удалось сохранить заказ");
    }
    $stmt->close();
    
    // Сохраняем товары в заказе
    foreach ($data['products'] as $p) {
        $productId = (int)$p['id'];
        $title = (string)$p['title'];
        $price = (float)$p['price'];
        $size = (string)$p['sizeSelect'];
        $qty = (int)$p['quantity'];
        
        $stmt = $conn->prepare("
            INSERT INTO order_products
            (order_id, product_id, product_name, product_price, size, quantity)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param('sisdsi', $order_id, $productId, $title, $price, $size, $qty);
        if (!$stmt->execute()) {
            throw new Exception("Не удалось сохранить товар в заказе");
        }
        $stmt->close();
    }
    
    $conn->commit();
    
} catch (Exception $e) {
    $conn->rollback();
    jsonOut(400, ['error' => $e->getMessage()]);
}

/* ==========================
   YOOKASSA
========================== */
$client = new Client();
$client->setAuth(
    '310730',
    'live_a-ORrIdlb29I1bRAYrOlcb-Psz-sTWKCY7hfy5uT19I'
);

/* ==========================
   RECEIPT
========================== */
$receipt = [
    'customer' => [
        'email' => $email,
        'phone' => $phone,
    ],
    'items' => []
];

if ($isTestPay) {
    $receipt['items'][] = [
        'description' => "Тестовая оплата (заказ $order_id)",
        'quantity' => number_format(1, 2, '.', ''),
        'amount' => [
            'value' => number_format(1.00, 2, '.', ''),
            'currency' => 'RUB'
        ],
        'vat_code' => 2,
        'payment_mode' => 'full_payment',
        'payment_subject' => 'commodity'
    ];
} else {
    foreach ($data['products'] as $p) {
        $receipt['items'][] = [
            'description' => (string)$p['title'],
            'quantity' => number_format((int)$p['quantity'], 2, '.', ''),
            'amount' => [
                'value' => number_format((float)$p['price'], 2, '.', ''),
                'currency' => 'RUB'
            ],
            'vat_code' => 2,
            'payment_mode' => 'full_payment',
            'payment_subject' => 'commodity'
        ];
    }
}

/* ==========================
   CREATE PAYMENT
========================== */
$chargeAmount = $isTestPay ? 1.00 : $total;
$description = ($isTestPay ? "TEST Order No. " : "Order No. ") . $order_id;

try {
    $payment = $client->createPayment([
        'amount' => [
            'value' => number_format($chargeAmount, 2, '.', ''),
            'currency' => 'RUB'
        ],
        'confirmation' => [
            'type' => 'redirect',
            'return_url' => "https://vyacheslavnabrand.ru/order/payment-status/$order_id"
        ],
        'capture' => true,
        'description' => $description,
        'receipt' => $receipt,
        'metadata' => [
            'order_id' => $order_id,
            'test_pay' => $isTestPay ? '1' : '0'
        ]
    ], $order_id);

    $arr = $payment->toArray();

    jsonOut(200, [
        'status' => 'success',
        'order_id' => $order_id,
        'confirmation_url' => $arr['confirmation']['confirmation_url'] ?? null,
        'test_pay' => $isTestPay ? 1 : 0
    ]);

} catch (Exception $e) {
    // Если платеж не прошел - удаляем заказ и ВОЗВРАЩАЕМ товар на склад
    $conn = new mysqli(
        'localhost',
        'u2937043_u275448',
        'tGYGVCp7Is39n8Tc',
        'u2937043_u2754480_default'
    );
    $conn->set_charset('utf8mb4');
    
    // Удаляем заказ
    $conn->query("DELETE FROM order_products WHERE order_id = '$order_id'");
    $conn->query("DELETE FROM orders WHERE order_id = '$order_id'");
    
    // ВОЗВРАЩАЕМ товар на склад
    foreach ($data['products'] as $p) {
        $productId = (int)$p['id'];
        $size = (string)$p['sizeSelect'];
        $quantity = (int)$p['quantity'];
        
        $sizeColumn = null;
        if ($size === 'S') $sizeColumn = 'size_s_quantity';
        elseif ($size === 'M') $sizeColumn = 'size_m_quantity';
        elseif ($size === 'L') $sizeColumn = 'size_l_quantity';
        elseif ($size === 'C' || $size === 'Единый размер') $sizeColumn = 'size_c_quantity';
        elseif ($size === 'Индивидуальный пошив') $sizeColumn = 'size_i_quantity';
        
        if ($sizeColumn) {
            $conn->query("UPDATE products SET $sizeColumn = $sizeColumn + $quantity WHERE id = $productId");
        }
    }
    $conn->close();
    
    jsonOut(500, [
        'error' => 'Платежная система временно недоступна. Попробуйте позже.',
        'debug' => $e->getMessage()
    ]);
}