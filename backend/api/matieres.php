<?php
require_once __DIR__.'/../config/cors.php';
require_once __DIR__.'/../config/database.php';
require_once __DIR__.'/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
requireAuth();
$db = getDB();
$id = (int)($_GET['id'] ?? 0);

if ($method === 'GET') {
    respond($db->query("SELECT * FROM matieres ORDER BY libelle")->fetchAll());
}
if ($method === 'POST') {
    requireAuth(['admin']);
    $b = jsonBody();
    $db->prepare("INSERT INTO matieres (code,libelle,volume_horaire_total,coefficient) VALUES (?,?,?,?)")
       ->execute([$b['code'],$b['libelle'],$b['volume_horaire_total']??0,$b['coefficient']??1]);
    respond(['id'=>$db->lastInsertId(),'message'=>'Matière créée'],201);
}
if ($method === 'PUT' && $id) {
    requireAuth(['admin']);
    $b = jsonBody();
    $db->prepare("UPDATE matieres SET code=?,libelle=?,volume_horaire_total=?,coefficient=? WHERE id=?")
       ->execute([$b['code'],$b['libelle'],$b['volume_horaire_total'],$b['coefficient'],$id]);
    respond(['message'=>'Matière mise à jour']);
}
if ($method === 'DELETE' && $id) {
    requireAuth(['admin']);
    $db->prepare("DELETE FROM matieres WHERE id=?")->execute([$id]);
    respond(['message'=>'Matière supprimée']);
}
respond(['error'=>'Route inconnue'],404);
