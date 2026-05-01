<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

function handleEnseignants(string $method, ?string $id): void {
    $pdo = Database::getInstance()->getPdo();

    if ($method === 'GET') {
        if ($id) {
            $stmt = $pdo->prepare('SELECT * FROM enseignants WHERE id = ?');
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'data' => $stmt->fetch(PDO::FETCH_ASSOC)]);
        } else {
            $stmt = $pdo->query('SELECT *, statut as type_enseignant FROM enseignants WHERE actif=1 ORDER BY nom');
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }
        return;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('INSERT INTO enseignants (matricule, nom, prenom, email, telephone, specialite, statut, taux_horaire) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $body['matricule'] ?? 'ENS'.rand(1000,9999),
            $body['nom'] ?? '',
            $body['prenom'] ?? '',
            $body['email'] ?? '',
            $body['telephone'] ?? '',
            $body['specialite'] ?? '',
            $body['type_enseignant'] ?? $body['statut'] ?? 'vacataire',
            $body['taux_horaire'] ?? 0
        ]);
        echo json_encode(['success' => true, 'message' => 'Enseignant ajouté.', 'id' => $pdo->lastInsertId()]);
        return;
    }

    if ($method === 'PUT' && $id) {
        $body = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('UPDATE enseignants SET nom=?, prenom=?, email=?, specialite=?, statut=?, taux_horaire=? WHERE id=?');
        $stmt->execute([$body['nom'], $body['prenom'], $body['email'], $body['specialite'], $body['statut'] ?? $body['type_enseignant'], $body['taux_horaire'], $id]);
        echo json_encode(['success' => true, 'message' => 'Enseignant modifié.']);
        return;
    }

    if ($method === 'DELETE' && $id) {
        $stmt = $pdo->prepare('UPDATE enseignants SET actif=0 WHERE id=?');
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Enseignant supprimé.']);
        return;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
}