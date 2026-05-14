<?php
require_once __DIR__.'/../config/cors.php';
require_once __DIR__.'/../config/database.php';
require_once __DIR__.'/../middleware/auth.php';

requireAuth(['admin','surveillant']);
$db = getDB();
$where = '1=1'; $params = [];
if ($a = $_GET['action'] ?? '') { $where .= ' AND la.action=?'; $params[]=$a; }
if ($d = $_GET['date_debut'] ?? '') { $where .= ' AND DATE(la.date_heure)>=?'; $params[]=$d; }
if ($f = $_GET['date_fin'] ?? '') { $where .= ' AND DATE(la.date_heure)<=?'; $params[]=$f; }
$sql = "SELECT la.*, u.nom_complet, u.role FROM logs_activite la LEFT JOIN utilisateurs u ON la.id_utilisateur=u.id WHERE $where ORDER BY la.date_heure DESC LIMIT 100";
$rows = $db->prepare($sql); $rows->execute($params);
respond($rows->fetchAll());
