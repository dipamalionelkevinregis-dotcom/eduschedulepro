<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

function handleClasses(string $method, ?string $id): void {
    $pdo = Database::getInstance()->getPdo();

    if ($method === 'GET') {
        if ($id) {
            $stmt = $pdo->prepare('SELECT *, libelle as nom FROM classes WHERE id = ?');
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'data' => $stmt->fetch(PDO::FETCH_ASSOC)]);
        } else {
            $stmt = $pdo->query('SELECT *, libelle as nom FROM classes ORDER BY libelle');
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }
        return;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        $libelle = $body['nom'] ?? $body['libelle'] ?? '';
        $stmt = $pdo->prepare('INSERT INTO classes (code, libelle, niveau, annee_academique) VALUES (?, ?, ?, ?)');
        $stmt->execute([
            $body['code'] ?? strtoupper(substr(str_replace(' ','',$libelle), 0, 8)),
            $libelle,
            $body['niveau'] ?? 'Licence 1',
            $body['annee_academique'] ?? '2025-2026'
        ]);
        echo json_encode(['success' => true, 'message' => 'Classe créée.', 'id' => $pdo->lastInsertId()]);
        return;
    }

    if ($method === 'DELETE' && $id) {
        $stmt = $pdo->prepare('DELETE FROM classes WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Classe supprimée.']);
        return;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
}