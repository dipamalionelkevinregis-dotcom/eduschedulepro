<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

function handleLogs(string $method): void {
    $pdo = Database::getInstance()->getPdo();

    if ($method === 'GET') {
        try {
            $stmt = $pdo->query('SELECT * FROM logs_activite ORDER BY created_at DESC LIMIT 100');
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        } catch (Exception $e) {
            echo json_encode(['success' => true, 'data' => []]);
        }
        return;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
}