<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

function handleMatieres(string $method, ?string $id): void {
    $pdo = Database::getInstance()->getPdo();

    if ($method === 'GET') {
        if ($id) {
            $stmt = $pdo->prepare('SELECT *, libelle as nom, volume_horaire_total as volume_horaire FROM matieres WHERE id = ?');
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'data' => $stmt->fetch(PDO::FETCH_ASSOC)]);
        } else {
            $stmt = $pdo->query('SELECT *, libelle as nom, volume_horaire_total as volume_horaire FROM matieres ORDER BY libelle');
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }
        return;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        $libelle = $body['nom'] ?? $body['libelle'] ?? '';
        $stmt = $pdo->prepare('INSERT INTO matieres (code, libelle, volume_horaire_total, coefficient) VALUES (?, ?, ?, ?)');
        $stmt->execute([
            $body['code'] ?? strtoupper(substr($libelle, 0, 6)),
            $libelle,
            $body['volume_horaire'] ?? $body['volume_horaire_total'] ?? 30,
            $body['coefficient'] ?? 1
        ]);
        echo json_encode(['success' => true, 'message' => 'Matière ajoutée.', 'id' => $pdo->lastInsertId()]);
        return;
    }

    if ($method === 'PUT' && $id) {
        $body = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('UPDATE matieres SET libelle=?, code=?, volume_horaire_total=?, coefficient=? WHERE id=?');
        $stmt->execute([$body['libelle'] ?? $body['nom'], $body['code'], $body['volume_horaire'] ?? $body['volume_horaire_total'], $body['coefficient'], $id]);
        echo json_encode(['success' => true, 'message' => 'Matière modifiée.']);
        return;
    }

    if ($method === 'DELETE' && $id) {
        $stmt = $pdo->prepare('DELETE FROM matieres WHERE id=?');
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Matière supprimée.']);
        return;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
}