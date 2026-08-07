<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Разрешаем CORS для любых доменов
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

header('Content-Type: application/json');

// ДОБАВЬ ЭТУ СТРОКУ ДЛЯ ОТКЛЮЧЕНИЯ КЕША
header("Cache-Control: no-cache, must-revalidate");

$host = 'localhost';
$database = 'u2937043_u2754480_default';
$user = 'u2937043_u275448';
$password = 'tGYGVCp7Is39n8Tc';

$conn = new mysqli($host, $user, $password, $database);
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    echo json_encode(['error' => "Connection failed: " . $conn->connect_error]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Обрабатываем preflight запросы для CORS
    http_response_code(200);
    exit;
}

// Fetch all the necessary fields, including size_chart
$result = $conn->query("SELECT id, title, compound, price, imgUrl, sizes, size_s_quantity, size_m_quantity, size_c_quantity, size_l_quantity, size_i_quantity, size_chart, modelUrl FROM products");

if (!$result) {
    echo json_encode(['error' => "Query failed: " . $conn->error]);
    exit;
}

$products = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $products[] = [
            'id' => (string) $row["id"],
            'title' => $row["title"],
            'compound' => $row["compound"],
            'price' => (float) $row["price"],
            'imgUrl' => $row["imgUrl"],
            'sizes' => explode(',', $row["sizes"]),
            'size_s_quantity' => (int) $row["size_s_quantity"],
            'size_m_quantity' => (int) $row["size_m_quantity"],
            'size_c_quantity' => (int) $row["size_c_quantity"],
            'size_l_quantity' => (int) $row["size_l_quantity"],
            'size_i_quantity' => (int) $row["size_i_quantity"],
            
'size_chart' => $row["size_chart"] ? json_decode($row["size_chart"], true) : null,
        ];
    }
    echo json_encode($products);
} else {
    echo json_encode([]);
}

$conn->close();
?>