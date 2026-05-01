<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

function handleSalles(string $method, ?string $id): void {
    $pdo = Database::getInstance()->getPdo();

    if ($method === 'GET') {
        if ($id) {
            $stmt = $pdo->prepare('SELECT * FROM salles WHERE id = ?');
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'data' => $stmt->fetch(PDO::FETCH_ASSOC)]);
        } else {
            $stmt = $pdo->query('SELECT * FROM salles ORDER BY nom');
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }
        return;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('INSERT INTO salles (nom, capacite, equipements) VALUES (?, ?, ?)');
        $stmt->execute([$body['nom'], $body['capacite'] ?? 30, $body['equipements'] ?? '']);
        echo json_encode(['success' => true, 'message' => 'Salle ajoutée.', 'id' => $pdo->lastInsertId()]);
        return;
    }

    if ($method === 'PUT' && $id) {
        $body = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('UPDATE salles SET nom=?, capacite=?, equipements=? WHERE id=?');
        $stmt->execute([$body['nom'], $body['capacite'], $body['equipements'], $id]);
        echo json_encode(['success' => true, 'message' => 'Salle modifiée.']);
        return;
    }

    if ($method === 'DELETE' && $id) {
        $stmt = $pdo->prepare('DELETE FROM salles WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Salle supprimée.']);
        return;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
}