<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Подключаем PHPMailer
require $_SERVER['DOCUMENT_ROOT'] . '/vendor/PHPMailer/src/PHPMailer.php';
require $_SERVER['DOCUMENT_ROOT'] . '/vendor/PHPMailer/src/SMTP.php';
require $_SERVER['DOCUMENT_ROOT'] . '/vendor/PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Подключение к БД
$host = 'localhost';
$database = 'u2937043_u2754480_default';
$user = 'u2937043_u275448';
$password = 'tGYGVCp7Is39n8Tc';
$conn = new mysqli($host, $user, $password, $database);
$conn->set_charset("utf8mb4");

$orderId = $_GET['order_id'] ?? '';
if (empty($orderId)) {
    echo json_encode(['status' => 'error', 'message' => 'Order ID is missing']);
    exit();
}

// Получаем данные заказа
$orderResult = $conn->query("SELECT * FROM orders WHERE order_id = '$orderId'");
if (!$orderResult || $orderResult->num_rows == 0) {
    echo json_encode(['status' => 'error', 'message' => 'Order not found']);
    exit();
}

$order = $orderResult->fetch_assoc();
$customer_name = $order['customer_name'];
$customer_email = $order['customer_email'];
$customer_phone = $order['customer_phone'];
$delivery_address = $order['delivery_address'];
$total_price = $order['total_price'];
$comment = !empty($order['comment']) ? $order['comment'] : 'Без комментариев';

// Получаем продукты
$products = [];
$productLines = [];
$orderProductsResult = $conn->query("SELECT * FROM order_products WHERE order_id = '$orderId'");
while ($orderProduct = $orderProductsResult->fetch_assoc()) {
    $line = $orderProduct['product_name'] . " (Размер: " . $orderProduct['size'] . ", Количество: " . $orderProduct['quantity'] . ")";
    $products[] = $line;
    $productLines[] = "🛍 $line";
}
$productListHTML = implode('<br>', $products);
$productListTelegram = implode("\n", $productLines);

// Сообщения
$adminMessage = "
    <h1>Платеж прошел успешно</h1>
    <p><strong>Заказ №:</strong> $orderId</p>
    <p><strong>Имя клиента:</strong> $customer_name</p>
    <p><strong>Email клиента:</strong> $customer_email</p>
    <p><strong>Телефон клиента:</strong> $customer_phone</p>
    <p><strong>Адрес доставки:</strong> $delivery_address</p>
    <p><strong>Сумма заказа:</strong> $total_price руб.</p>
    <p><strong>Комментарий:</strong> $comment</p>
    <p><strong>Продукты:</strong><br>$productListHTML</p>
    <img src=\"cid:mail_image\" alt=\"Изображение\">
";

$customerMessage = "
    <img src=\"cid:mail_image\" alt=\"Изображение\">
    <h1>Здравствуйте, $customer_name!</h1>
    <p>Ваш заказ успешно оформлен! Благодарим за покупку в нашем магазине.</p>
    <p>Скоро с вами свяжется наш администратор и вышлет трек-номер для отслеживания заказа!</p>
    <p><strong>Ваш заказ:</strong><br>$productListHTML</p>
    <p><strong>Общая сумма:</strong> $total_price руб.</p>
    <p>С уважением,<br>Команда VYACHESLAVNA</p>
";

// Путь к изображению
$imagePath = $_SERVER['DOCUMENT_ROOT'] . '/SOURCE/images/mail.jpg';

// Файл логов
$logFile = $_SERVER['DOCUMENT_ROOT'] . '/email_errors.log';

// Telegram настройки
$telegram_token = '7516582083:AAE2QpKSfQxI8FBxLzKr_HM8OzGpy2GZ9As';

// 👇 Здесь массив chat_id — добавь сюда нужные ID
$telegram_chat_ids = [
    '689667168',        // Твой основной аккаунт
    '7530036366',       // Второй пользователь
    // 'добавь ещё сюда, если нужно'
];

$telegramMessage = "📦 Новый заказ №$orderId\n"
    . "👤 $customer_name\n"
    . "📞 $customer_phone\n"
    . "📬 $delivery_address\n"
    . "$productListTelegram\n"
    . "💰 *Сумма:* $total_price руб.";


$telegramMessage = str_replace(['<br>', '<br/>', '<br />'], "\n", $telegramMessage);

// Функция отправки письма
function sendMail($mail, $to, $subject, $body, $imagePath, $logFile) {
    $attempts = 0;
    $maxAttempts = 3;
    $sent = false;
    while ($attempts < $maxAttempts && !$sent) {
        try {
            $mail->clearAddresses();
            $mail->clearAttachments();
            $mail->addAddress($to);
            $mail->Subject = $subject;
            $mail->Body = $body;
            $mail->addEmbeddedImage($imagePath, 'mail_image');
            if ($mail->send()) {
                $sent = true;
            }
        } catch (Exception $e) {
            file_put_contents($logFile, date("Y-m-d H:i:s") . " - Ошибка: " . $mail->ErrorInfo . PHP_EOL, FILE_APPEND);
            sleep(2);
        }
        $attempts++;
    }
    return $sent;
}

function escapeMarkdownV2($text) {
    $specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    foreach ($specialChars as $char) {
        $text = str_replace($char, '\\' . $char, $text);
    }
    return $text;
}

function sendTelegramMessage($token, $chat_id, $message, $logFile) {
    $url = "https://api.telegram.org/bot$token/sendMessage";

    $escapedMessage = escapeMarkdownV2($message);

    $post_fields = [
        'chat_id' => $chat_id,
        'text' => $escapedMessage,
        'parse_mode' => 'MarkdownV2'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_fields);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if (curl_errno($ch)) {
        file_put_contents($logFile, date("Y-m-d H:i:s") . " - Telegram cURL error: " . curl_error($ch) . PHP_EOL, FILE_APPEND);
    }

    curl_close($ch);

    $response_data = json_decode($response, true);

    return $httpcode === 200 && isset($response_data['ok']) && $response_data['ok'] === true;
}

// Отправка писем и Telegram
$mail = new PHPMailer(true);
try {
    // Настройки SMTP
    $mail->isSMTP();
    $mail->Host = 'mail.hosting.reg.ru';
    $mail->SMTPAuth = true;
    $mail->Username = 'admin@vyacheslavnabrand.ru';
    $mail->Password = 'zU3pC5zE7psP0aA8';
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;
    $mail->CharSet = 'UTF-8';
    $mail->setFrom('admin@vyacheslavnabrand.ru', 'VYACHESLAVNA');
    $mail->isHTML(true);

    $adminSent = sendMail($mail, 'vyacheslavnaorders@yandex.com', "Платеж прошел успешно: Заказ №$orderId", $adminMessage, $imagePath, $logFile);
    $customerSent = sendMail($mail, $customer_email, "Ваш заказ успешно оформлен", $customerMessage, $imagePath, $logFile);

    // Отправка Telegram-сообщений всем ID
    $allTelegramSent = true;
    foreach ($telegram_chat_ids as $chat_id) {
        if (!sendTelegramMessage($telegram_token, $chat_id, $telegramMessage, $logFile)) {
            $allTelegramSent = false;
        }
    }

    $mail->smtpClose();

    if ($adminSent && $customerSent && $allTelegramSent) {
        $updateStmt = $conn->prepare("UPDATE orders SET email_sent = 1 WHERE order_id = ?");
        $updateStmt->bind_param('s', $orderId);
        $updateStmt->execute();
        $updateStmt->close();

        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'partial_error']);
    }
} catch (Exception $e) {
    file_put_contents($logFile, date("Y-m-d H:i:s") . " - Фатальная ошибка PHPMailer: " . $mail->ErrorInfo . PHP_EOL, FILE_APPEND);
    echo json_encode(['status' => 'fatal_error']);
}

$conn->close();
?>