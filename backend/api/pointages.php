<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

function handlePointages(string $method, ?string $id): void {
    $pdo = Database::getInstance()->getPdo();
    if ($method === 'GET') {
        $stmt = $pdo->query("
            SELECT p.*, p.heure_pointage_reelle as heure_pointage,
                   CONCAT(e.prenom,' ',e.nom) as enseignant_nom,
                   m.libelle as matiere_nom
            FROM pointages p
            LEFT JOIN creneaux cr ON p.id_creneau = cr.id
            LEFT JOIN enseignants e ON p.id_enseignant = e.id
            LEFT JOIN matieres m ON cr.id_matiere = m.id
            ORDER BY p.created_at DESC LIMIT 50
        ");
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        return;
    }
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
}

function handlePointageScan(): void {
    $pdo  = Database::getInstance()->getPdo();
    $body = json_decode(file_get_contents('php://input'), true);
    $token = $body['token_qr'] ?? '';
    if (empty($token)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Token manquant.']);
        return;
    }
    $stmt = $pdo->prepare("SELECT * FROM creneaux WHERE qr_token = ? AND qr_utilise = 0");
    $stmt->execute([$token]);
    $creneau = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$creneau) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Token invalide ou déjà utilisé.']);
        return;
    }
    if ($creneau['qr_expire'] && strtotime($creneau['qr_expire']) < time()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Token expiré.']);
        return;
    }
    $stmt2 = $pdo->prepare("INSERT INTO pointages (id_creneau, id_enseignant, heure_pointage_reelle, token_utilise, statut) VALUES (?, ?, NOW(), ?, 'à_l_heure')");
    $stmt2->execute([$creneau['id'], $creneau['id_enseignant'], $token]);
    $pdo->prepare("UPDATE creneaux SET qr_utilise=1, statut='en_cours' WHERE id=?")->execute([$creneau['id']]);
    echo json_encode(['success' => true, 'message' => 'Pointage enregistré avec succès !']);
}

function handlePointageStatut(string $id): void {
    $pdo  = Database::getInstance()->getPdo();
    $stmt = $pdo->prepare('SELECT statut FROM pointages WHERE id=?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'data' => $stmt->fetch(PDO::FETCH_ASSOC)]);
}