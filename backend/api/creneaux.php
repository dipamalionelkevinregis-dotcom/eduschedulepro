<?php
require_once __DIR__.'/../config/cors.php';
require_once __DIR__.'/../config/database.php';
require_once __DIR__.'/../middleware/auth.php';
require_once __DIR__.'/../utils/qrcode.php';

$method = $_SERVER['REQUEST_METHOD'];
$id     = (int)($_GET['id'] ?? 0);
$action = $_GET['action'] ?? '';

// ── GET image QR — pas d'auth JWT (image chargée par <img src="...">)
if ($method === 'GET' && $id && $action === 'qr') {
    $db = getDB();
    $stmt = $db->prepare(
        "SELECT c.*, et.semaine_debut, m.libelle AS matiere, m.code AS mat_code,
                cl.libelle AS classe, s.libelle AS salle, s.code AS salle_code
         FROM creneaux c
         JOIN emploi_temps et ON c.id_emploi_temps = et.id
         JOIN matieres m      ON c.id_matiere = m.id
         JOIN classes cl      ON et.id_classe = cl.id
         JOIN salles s        ON c.id_salle = s.id
         WHERE c.id = ?"
    );
    $stmt->execute([$id]);
    $cr = $stmt->fetch();

    if (!$cr) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Creneau non trouve']);
        exit;
    }
    if (!$cr['qr_token']) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'QR non genere — publier l emploi du temps d abord']);
        exit;
    }

    // Données encodées dans le QR
    $qrData = json_encode([
        'token'       => $cr['qr_token'],
        'id_creneau'  => $id,
        'matiere'     => $cr['mat_code'] ?? $cr['matiere'],
        'classe'      => $cr['classe'],
        'jour'        => $cr['jour'],
        'heure'       => $cr['heure_debut'],
    ]);

    $qrImage = generateQR($qrData);

    // Supprimer tout output précédent (CORS headers)
    header_remove('Content-Type');
    header('Content-Type: image/png');
    header('Cache-Control: public, max-age=3600');
    header('Content-Length: ' . strlen($qrImage));
    echo $qrImage;
    exit;
}

// ── Toutes les autres routes nécessitent auth ──
$user = requireAuth();
$db   = getDB();

// GET liste créneaux
if ($method === 'GET' && !$id) {
    $where = '1=1'; $params = [];
    if ($et = $_GET['id_emploi_temps'] ?? '') { $where .= ' AND c.id_emploi_temps=?'; $params[] = $et; }
    if ($ens = $_GET['id_enseignant'] ?? '') { $where .= ' AND c.id_enseignant=?'; $params[] = $ens; }
    $sql = "SELECT c.*, m.libelle AS matiere, m.code AS mat_code,
                   e.nom, e.prenom, s.libelle AS salle, s.code AS salle_code,
                   cl.libelle AS classe
            FROM creneaux c
            JOIN matieres m      ON c.id_matiere = m.id
            JOIN enseignants e   ON c.id_enseignant = e.id
            JOIN salles s        ON c.id_salle = s.id
            JOIN emploi_temps et ON c.id_emploi_temps = et.id
            JOIN classes cl      ON et.id_classe = cl.id
            WHERE $where
            ORDER BY FIELD(c.jour,'lundi','mardi','mercredi','jeudi','vendredi','samedi'), c.heure_debut";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    respond($stmt->fetchAll());
}

// GET détail créneau
if ($method === 'GET' && $id) {
    $stmt = $db->prepare(
        "SELECT c.*, m.libelle AS matiere, m.code AS mat_code,
                e.nom, e.prenom, s.libelle AS salle, s.code AS salle_code,
                cl.libelle AS classe
         FROM creneaux c
         JOIN matieres m      ON c.id_matiere = m.id
         JOIN enseignants e   ON c.id_enseignant = e.id
         JOIN salles s        ON c.id_salle = s.id
         JOIN emploi_temps et ON c.id_emploi_temps = et.id
         JOIN classes cl      ON et.id_classe = cl.id
         WHERE c.id = ?"
    );
    $stmt->execute([$id]);
    $cr = $stmt->fetch();
    if (!$cr) respond(['error' => 'Non trouve'], 404);
    respond($cr);
}

// POST ajouter créneau
if ($method === 'POST') {
    requireAuth(['admin']);
    $b = jsonBody();
    $db->prepare(
        "INSERT INTO creneaux (id_emploi_temps,id_matiere,id_enseignant,id_salle,jour,heure_debut,heure_fin)
         VALUES (?,?,?,?,?,?,?)"
    )->execute([$b['id_emploi_temps'],$b['id_matiere'],$b['id_enseignant'],$b['id_salle'],$b['jour'],$b['heure_debut'],$b['heure_fin']]);
    respond(['id' => $db->lastInsertId(), 'message' => 'Creneau ajoute'], 201);
}

// DELETE créneau
if ($method === 'DELETE' && $id) {
    requireAuth(['admin']);
    $db->prepare("DELETE FROM creneaux WHERE id=?")->execute([$id]);
    respond(['message' => 'Creneau supprime']);
}

respond(['error' => 'Route inconnue'], 404);
