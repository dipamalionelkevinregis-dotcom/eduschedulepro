<?php
require_once __DIR__.'/../config/cors.php';
require_once __DIR__.'/../config/database.php';
require_once __DIR__.'/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$db = getDB();
$id = (int)($_GET['id'] ?? 0);
$action = $_GET['action'] ?? '';

// GET liste
if ($method === 'GET' && !$id) {
    $where = '1=1'; $params = [];
    if ($c = $_GET['id_classe'] ?? '') { $where .= ' AND et.id_classe=?'; $params[]=$c; }
    if ($s = $_GET['semaine'] ?? '') { $where .= ' AND et.semaine_debut=?'; $params[]=$s; }
    if ($user['role'] === 'etudiant') { $where .= ' AND et.statut_publication="publie"'; }
    $sql = "SELECT et.*, cl.libelle AS classe_libelle, cl.code AS classe_code
            FROM emploi_temps et JOIN classes cl ON et.id_classe=cl.id
            WHERE $where ORDER BY et.semaine_debut DESC";
    $rows = $db->prepare($sql); $rows->execute($params);
    $ets = $rows->fetchAll();
    foreach ($ets as &$et) {
        $cr = $db->prepare("SELECT c.*, m.libelle AS matiere, m.code AS mat_code, e.nom, e.prenom, s.libelle AS salle, s.code AS salle_code
                            FROM creneaux c
                            JOIN matieres m ON c.id_matiere=m.id
                            JOIN enseignants e ON c.id_enseignant=e.id
                            JOIN salles s ON c.id_salle=s.id
                            WHERE c.id_emploi_temps=? ORDER BY FIELD(c.jour,'lundi','mardi','mercredi','jeudi','vendredi','samedi'), c.heure_debut");
        $cr->execute([$et['id']]);
        $et['creneaux'] = $cr->fetchAll();
    }
    respond($ets);
}

// GET single
if ($method === 'GET' && $id && !$action) {
    $stmt = $db->prepare("SELECT et.*, cl.libelle AS classe_libelle FROM emploi_temps et JOIN classes cl ON et.id_classe=cl.id WHERE et.id=?");
    $stmt->execute([$id]); $et = $stmt->fetch();
    if (!$et) respond(['error'=>'Non trouvé'],404);
    $cr = $db->prepare("SELECT c.*, m.libelle AS matiere, m.code AS mat_code, e.nom, e.prenom, s.libelle AS salle, s.code AS salle_code FROM creneaux c JOIN matieres m ON c.id_matiere=m.id JOIN enseignants e ON c.id_enseignant=e.id JOIN salles s ON c.id_salle=s.id WHERE c.id_emploi_temps=? ORDER BY FIELD(c.jour,'lundi','mardi','mercredi','jeudi','vendredi','samedi'),c.heure_debut");
    $cr->execute([$id]); $et['creneaux'] = $cr->fetchAll();
    respond($et);
}

// POST créer
if ($method === 'POST' && !$action) {
    requireAuth(['admin']);
    $b = jsonBody();
    if (empty($b['id_classe']) || empty($b['semaine_debut'])) respond(['error'=>'id_classe et semaine_debut requis'],400);
    $b['id_classe'] = (int)$b['id_classe'];
    // Vérifier doublon
    $check = $db->prepare("SELECT id FROM emploi_temps WHERE id_classe=? AND semaine_debut=?");
    $check->execute([$b['id_classe'],$b['semaine_debut']]);
    if ($check->fetch()) respond(['error'=>'Un emploi du temps existe déjà pour cette classe et cette semaine'],409);
    $db->prepare("INSERT INTO emploi_temps (id_classe,semaine_debut,statut_publication,cree_par) VALUES (?,?,'brouillon',?)")
       ->execute([$b['id_classe'],$b['semaine_debut'],$user['id']]);
    $etId = $db->lastInsertId();
    // Créneaux
    if (!empty($b['creneaux'])) {
        foreach ($b['creneaux'] as $cr) {
            // Vérifier conflits
            $conflit = $db->prepare("SELECT c.id FROM creneaux c JOIN emploi_temps et ON c.id_emploi_temps=et.id WHERE et.semaine_debut=? AND c.jour=? AND c.id_enseignant=? AND ((c.heure_debut < ? AND c.heure_fin > ?) OR (c.heure_debut < ? AND c.heure_fin > ?))");
            $conflit->execute([$b['semaine_debut'],$cr['jour'],$cr['id_enseignant'],$cr['heure_fin'],$cr['heure_debut'],$cr['heure_fin'],$cr['heure_debut']]);
            if ($conflit->fetch()) respond(['error'=>"Conflit enseignant détecté pour le ".$cr['jour']],409);
            $db->prepare("INSERT INTO creneaux (id_emploi_temps,id_matiere,id_enseignant,id_salle,jour,heure_debut,heure_fin) VALUES (?,?,?,?,?,?,?)")
               ->execute([$etId,$cr['id_matiere'],$cr['id_enseignant'],$cr['id_salle'],$cr['jour'],$cr['heure_debut'],$cr['heure_fin']]);
        }
    }
    respond(['id'=>$etId,'message'=>'Emploi du temps créé'],201);
}

// PUT publier
if ($method === 'PUT' && $id && $action === 'publier') {
    requireAuth(['admin']);
    $db->prepare("UPDATE emploi_temps SET statut_publication='publie', date_publication=NOW() WHERE id=?")->execute([$id]);
    // Générer QR tokens
    $creneaux = $db->prepare("SELECT id, heure_debut, heure_fin FROM creneaux WHERE id_emploi_temps=?");
    $creneaux->execute([$id]);
    foreach ($creneaux->fetchAll() as $cr) {
        $token = bin2hex(random_bytes(32));
        $expire = date('Y-m-d H:i:s', strtotime($cr['heure_fin'].'+1 hour'));
        $db->prepare("UPDATE creneaux SET qr_token=?, qr_expire=? WHERE id=?")->execute([$token,$expire,$cr['id']]);
    }
    respond(['message'=>'Emploi du temps publié et QR générés']);
}

// PUT dépublier
if ($method === 'PUT' && $id && $action === 'depublier') {
    requireAuth(['admin']);
    $db->prepare("UPDATE emploi_temps SET statut_publication='brouillon' WHERE id=?")->execute([$id]);
    respond(['message'=>'Emploi du temps dépublié']);
}

// DELETE
if ($method === 'DELETE' && $id) {
    requireAuth(['admin']);
    $db->prepare("DELETE FROM emploi_temps WHERE id=?")->execute([$id]);
    respond(['message'=>'Emploi du temps supprimé']);
}

respond(['error'=>'Route inconnue'],404);
