<?php
require_once __DIR__.'/../config/cors.php';
require_once __DIR__.'/../config/database.php';
require_once __DIR__.'/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$db = getDB();
$id = (int)($_GET['id'] ?? 0);

if ($method === 'GET') {
    $annee = $_GET['annee'] ?? '2025-2026';
    $rows = $db->prepare("SELECT * FROM classes WHERE annee_academique=? ORDER BY niveau,code");
    $rows->execute([$annee]);
    respond($rows->fetchAll());
}

if ($method === 'POST') {
    requireAuth(['admin']);
    $b = jsonBody();
    if (!($b['code'] ?? '') || !($b['libelle'] ?? '')) respond(['error'=>'code et libelle requis'],400);
    $s = $db->prepare("INSERT INTO classes (code,libelle,niveau,annee_academique) VALUES (?,?,?,?)");
    $s->execute([$b['code'],$b['libelle'],$b['niveau']??'',$b['annee_academique']??'2025-2026']);
    respond(['id'=>$db->lastInsertId(),'message'=>'Classe créée'],201);
}

if ($method === 'PUT' && $id) {
    requireAuth(['admin']);
    $b = jsonBody();
    $db->prepare("UPDATE classes SET code=?,libelle=?,niveau=? WHERE id=?")
       ->execute([$b['code'],$b['libelle'],$b['niveau'],$id]);
    respond(['message'=>'Classe mise à jour']);
}

if ($method === 'DELETE' && $id) {
    requireAuth(['admin']);
    $db->prepare("DELETE FROM classes WHERE id=?")->execute([$id]);
    respond(['message'=>'Classe supprimée']);
}

respond(['error'=>'Route inconnue'],404);
