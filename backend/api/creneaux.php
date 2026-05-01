<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

function handleCreneaux(string $method, ?string $id): void {
    $pdo = Database::getInstance()->getPdo();

    if ($method === 'GET') {
        $where = ''; $params = [];
        if (!empty($_GET['id_emploi_temps'])) {
            $where = 'WHERE cr.id_emploi_temps=?';
            $params[] = $_GET['id_emploi_temps'];
        }
        $stmt = $pdo->prepare("
            SELECT cr.*,
                   cr.jour as jour_semaine,
                   m.libelle as matiere_nom, m.code as matiere_code,
                   CONCAT(e.prenom,' ',e.nom) as enseignant_nom,
                   s.nom as salle_nom
            FROM creneaux cr
            LEFT JOIN matieres m ON cr.id_matiere = m.id
            LEFT JOIN enseignants e ON cr.id_enseignant = e.id
            LEFT JOIN salles s ON cr.id_salle = s.id
            $where
            ORDER BY cr.jour, cr.heure_debut
        ");
        $stmt->execute($params);
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        return;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        // Générer QR token unique
        $qr_token  = bin2hex(random_bytes(16));
        $qr_expire = date('Y-m-d H:i:s', strtotime('+2 hours'));
        $stmt = $pdo->prepare("
            INSERT INTO creneaux (id_emploi_temps, id_matiere, id_enseignant, id_salle, jour, heure_debut, heure_fin, type_seance, qr_token, qr_expire)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $body['id_emploi_temps'],
            $body['id_matiere'],
            $body['id_enseignant'],
            $body['id_salle'] ?? null,
            $body['jour_semaine'] ?? $body['jour'],
            $body['heure_debut'],
            $body['heure_fin'],
            $body['type_seance'] ?? 'CM',
            $qr_token,
            $qr_expire
        ]);
        echo json_encode(['success' => true, 'message' => 'Créneau créé.', 'id' => $pdo->lastInsertId()]);
        return;
    }

    if ($method === 'DELETE' && $id) {
        $stmt = $pdo->prepare('DELETE FROM creneaux WHERE id=?');
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Créneau supprimé.']);
        return;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
}

function handleCreneauQR(string $id): void {
    $pdo = Database::getInstance()->getPdo();
    $stmt = $pdo->prepare("SELECT cr.*, m.libelle as matiere_nom FROM creneaux cr LEFT JOIN matieres m ON cr.id_matiere=m.id WHERE cr.id=?");
    $stmt->execute([$id]);
    $creneau = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$creneau) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Créneau introuvable.']);
        return;
    }
    // Générer nouveau token si besoin
    if (!$creneau['qr_token'] || $creneau['qr_utilise']) {
        $qr_token  = bin2hex(random_bytes(16));
        $qr_expire = date('Y-m-d H:i:s', strtotime('+2 hours'));
        $pdo->prepare("UPDATE creneaux SET qr_token=?, qr_expire=?, qr_utilise=0 WHERE id=?")->execute([$qr_token, $qr_expire, $id]);
        $creneau['qr_token'] = $qr_token;
    }
    $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' . urlencode($creneau['qr_token']);
    echo json_encode(['success' => true, 'data' => [
        'token'   => $creneau['qr_token'],
        'qr_url'  => $qrUrl,
        'creneau' => $creneau
    ]]);
}