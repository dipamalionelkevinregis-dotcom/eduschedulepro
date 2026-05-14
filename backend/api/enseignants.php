<?php
require_once __DIR__.'/../config/cors.php';
require_once __DIR__.'/../config/database.php';
require_once __DIR__.'/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$db = getDB();
$id = (int)($_GET['id'] ?? 0);

if ($method === 'GET') {
    $where = '1=1';
    $params = [];
    if ($s = $_GET['statut'] ?? '') { $where .= ' AND statut=?'; $params[] = $s; }
    if ($sp = $_GET['specialite'] ?? '') { $where .= ' AND specialite LIKE ?'; $params[] = "%$sp%"; }
    $rows = $db->prepare("SELECT * FROM enseignants WHERE $where ORDER BY nom,prenom");
    $rows->execute($params);
    respond($rows->fetchAll());
}

if ($method === 'POST') {
    requireAuth(['admin']);
    $b = jsonBody();
    $req = ['matricule','nom','prenom','email'];
    foreach ($req as $f) if (!($b[$f]??'')) respond(['error'=>"$f requis"],400);
    $s = $db->prepare("INSERT INTO enseignants (matricule,nom,prenom,email,telephone,specialite,statut,taux_horaire) VALUES (?,?,?,?,?,?,?,?)");
    $s->execute([$b['matricule'],$b['nom'],$b['prenom'],$b['email'],$b['telephone']??'',$b['specialite']??'',$b['statut']??'vacataire',$b['taux_horaire']??5000]);
    $newId = $db->lastInsertId();
    // Créer utilisateur associé
    $hash = password_hash('password', PASSWORD_BCRYPT);
    $db->prepare("INSERT INTO utilisateurs (email,mot_de_passe_hash,role,id_lien,nom_complet) VALUES (?,?,'enseignant',?,?)")
       ->execute([$b['email'],$hash,$newId,$b['prenom'].' '.$b['nom']]);
    respond(['id'=>$newId,'message'=>'Enseignant créé'],201);
}

if ($method === 'PUT' && $id) {
    requireAuth(['admin']);
    $b = jsonBody();
    $db->prepare("UPDATE enseignants SET nom=?,prenom=?,email=?,telephone=?,specialite=?,statut=?,taux_horaire=? WHERE id=?")
       ->execute([$b['nom'],$b['prenom'],$b['email'],$b['telephone']??'',$b['specialite']??'',$b['statut']??'vacataire',$b['taux_horaire']??5000,$id]);
    respond(['message'=>'Enseignant mis à jour']);
}

if ($method === 'DELETE' && $id) {
    requireAuth(['admin']);
    $db->prepare("DELETE FROM enseignants WHERE id=?")->execute([$id]);
    respond(['message'=>'Enseignant supprimé']);
}

respond(['error'=>'Route inconnue'],404);
