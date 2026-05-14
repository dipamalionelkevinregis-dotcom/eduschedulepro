<?php
require_once __DIR__.'/../config/cors.php';
require_once __DIR__.'/../config/database.php';
require_once __DIR__.'/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
requireAuth();
$db = getDB();
$id = (int)($_GET['id'] ?? 0);

if ($method === 'GET') respond($db->query("SELECT * FROM salles ORDER BY code")->fetchAll());
if ($method === 'POST') {
    requireAuth(['admin']);
    $b = jsonBody();
    $db->prepare("INSERT INTO salles (code,libelle,capacite,equipements,batiment) VALUES (?,?,?,?,?)")
       ->execute([$b['code'],$b['libelle'],$b['capacite']??30,$b['equipements']??'',$b['batiment']??'']);
    respond(['id'=>$db->lastInsertId(),'message'=>'Salle créée'],201);
}
if ($method === 'PUT' && $id) {
    requireAuth(['admin']);
    $b = jsonBody();
    $db->prepare("UPDATE salles SET code=?,libelle=?,capacite=?,equipements=?,batiment=? WHERE id=?")
       ->execute([$b['code'],$b['libelle'],$b['capacite'],$b['equipements']??'',$b['batiment']??'',$id]);
    respond(['message'=>'Salle mise à jour']);
}
if ($method === 'DELETE' && $id) {
    requireAuth(['admin']);
    $db->prepare("DELETE FROM salles WHERE id=?")->execute([$id]);
    respond(['message'=>'Salle supprimée']);
}
respond(['error'=>'Route inconnue'],404);
