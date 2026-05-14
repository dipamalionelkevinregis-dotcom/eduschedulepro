<?php
require_once __DIR__.'/../config/cors.php';
require_once __DIR__.'/../config/database.php';
require_once __DIR__.'/../middleware/auth.php';
require_once __DIR__.'/../config/constants.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$db = getDB();

// GET liste pointages
if ($method === 'GET') {
    $where = '1=1'; $params = [];
    if ($c = $_GET['id_creneau'] ?? '') { $where .= ' AND p.id_creneau=?'; $params[]=$c; }
    if ($e = $_GET['id_enseignant'] ?? '') { $where .= ' AND p.id_enseignant=?'; $params[]=$e; }
    $sql = "SELECT p.*, e.nom, e.prenom, m.libelle AS matiere, cl.libelle AS classe
            FROM pointages p JOIN enseignants e ON p.id_enseignant=e.id
            JOIN creneaux c ON p.id_creneau=c.id JOIN emploi_temps et ON c.id_emploi_temps=et.id
            JOIN matieres m ON c.id_matiere=m.id JOIN classes cl ON et.id_classe=cl.id
            WHERE $where ORDER BY p.heure_pointage_reelle DESC";
    $rows = $db->prepare($sql); $rows->execute($params);
    respond($rows->fetchAll());
}

// POST scanner QR
if ($method === 'POST') {
    requireAuth(['enseignant']);
    $b = jsonBody();
    $tokenQR = $b['token_qr'] ?? '';
    if (!$tokenQR) respond(['error'=>'token_qr requis'],400);

    // Trouver le créneau
    $stmt = $db->prepare("SELECT c.*, m.libelle AS matiere, cl.libelle AS classe, s.libelle AS salle, et.semaine_debut FROM creneaux c JOIN emploi_temps et ON c.id_emploi_temps=et.id JOIN matieres m ON c.id_matiere=m.id JOIN classes cl ON et.id_classe=cl.id JOIN salles s ON c.id_salle=s.id WHERE c.qr_token=?");
    $stmt->execute([$tokenQR]); $cr = $stmt->fetch();
    if (!$cr) respond(['error'=>'QR invalide ou créneau introuvable'],404);

    // Vérifier expiration
    if ($cr['qr_expire'] && strtotime($cr['qr_expire']) < time()) respond(['error'=>'QR expiré'],400);

    // Vérifier si l'enseignant a déjà pointé ce créneau aujourd'hui
    $already = $db->prepare("SELECT id FROM pointages WHERE id_creneau=? AND id_enseignant=? AND DATE(heure_pointage_reelle)=CURDATE()");
    $already->execute([$cr['id'], $user['id_lien']]);
    if ($already->fetch()) respond(['error'=>'Vous avez déjà pointé pour cette séance aujourd'hui'],409);

    // Vérifier que c'est le bon enseignant
    if ($cr['id_enseignant'] != $user['id_lien']) respond(['error'=>'Ce QR n\'est pas pour vous'],403);

    // Calculer statut
    $heurePrevu = strtotime(date('Y-m-d').' '.$cr['heure_debut']);
    $heureNow = time();
    $diffMin = ($heureNow - $heurePrevu) / 60;
    $statut = $diffMin > QR_LATE_ALERT_MINUTES ? 'retard' : 'ok';

    // Enregistrer
    $db->prepare("INSERT INTO pointages (id_creneau,id_enseignant,heure_pointage_reelle,ip_source,token_utilise,statut) VALUES (?,?,NOW(),?,?,?)")
       ->execute([$cr['id'],$user['id_lien'],$_SERVER['REMOTE_ADDR']??'',$tokenQR,$statut]);

    // Marquer le token comme utilisé mais ne pas l'effacer
    // (permet de vérifier le statut mais empêche le re-scan via le log)
    // Le token reste visible pour affichage QR

    respond([
        'message' => 'Pointage enregistré',
        'statut' => $statut,
        'creneau' => $cr,
        'heure_pointage' => date('H:i:s'),
        'retard_minutes' => max(0, round($diffMin)),
    ]);
}

respond(['error'=>'Route inconnue'],404);
