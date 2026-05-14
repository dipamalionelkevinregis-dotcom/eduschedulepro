<?php
// backend/config/cors.php
// Accepter toutes les origines (réseau local + ngrok + localhost)

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';

// Autoriser toutes les origines connues
$allowed = ['http://localhost:3000', 'http://127.0.0.1:3000'];

// Accepter les IPs locales (192.168.x.x, 10.x.x.x)
$isLocal  = preg_match('/^https?:\/\/(192\.168\.|10\.|172\.16\.)/', $origin);
// Accepter ngrok
$isNgrok  = strpos($origin, 'ngrok') !== false || strpos($origin, 'ngrok-free') !== false;
// Accepter localhost sur n'importe quel port
$isLocalhost = preg_match('/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $origin);

if ($isLocal || $isNgrok || $isLocalhost || in_array($origin, $allowed)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Ne pas forcer JSON pour les images QR
$action = $_GET['action'] ?? '';
$uri    = $_SERVER['REQUEST_URI'] ?? '';
$isQR   = strpos($uri, 'creneaux') !== false && $action === 'qr';

if (!$isQR) {
    header('Content-Type: application/json; charset=utf-8');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
