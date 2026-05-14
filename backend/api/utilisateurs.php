<?php
require_once __DIR__.'/../config/cors.php';
require_once __DIR__.'/../config/database.php';
require_once __DIR__.'/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();
$id     = (int)($_GET['id'] ?? 0);
$action = $_GET['action'] ?? '';

// ── Changer son propre mot de passe (tout utilisateur connecté) ──
if ($method === 'POST' && $action === 'changer-mdp') {
    $user = requireAuth();
    $b    = jsonBody();
    $ancienMdp  = $b['ancien_mdp']  ?? '';
    $nouveauMdp = $b['nouveau_mdp'] ?? '';
    if (!$ancienMdp || !$nouveauMdp) respond(['error' => 'Ancien et nouveau mot de passe requis'], 400);
    if (strlen($nouveauMdp) < 6)     respond(['error' => 'Minimum 6 caractères'], 400);
    $stmt = $db->prepare("SELECT mot_de_passe_hash FROM utilisateurs WHERE id=?");
    $stmt->execute([$user['id']]);
    $row = $stmt->fetch();
    if (!$row || !password_verify($ancienMdp, $row['mot_de_passe_hash'])) {
        respond(['error' => 'Ancien mot de passe incorrect'], 401);
    }
    $hash = password_hash($nouveauMdp, PASSWORD_BCRYPT, ['cost' => 10]);
    $db->prepare("UPDATE utilisateurs SET mot_de_passe_hash=? WHERE id=?")->execute([$hash, $user['id']]);
    respond(['message' => 'Mot de passe changé avec succès']);
}

// ── Routes admin uniquement ──
$user = requireAuth(['admin']);

if ($method === 'GET') {
    $rows = $db->query("SELECT id,email,role,nom_complet,id_classe,id_lien,actif,created_at FROM utilisateurs ORDER BY role,nom_complet");
    respond($rows->fetchAll());
}

if ($method === 'POST' && !$action) {
    $b = jsonBody();
    if (!($b['email']??'') || !($b['role']??'')) respond(['error'=>'email et role requis'], 400);
    $mdp  = $b['password'] ?? 'password';
    $hash = password_hash($mdp, PASSWORD_BCRYPT, ['cost' => 10]);
    $db->prepare("INSERT INTO utilisateurs (email,mot_de_passe_hash,role,id_lien,id_classe,nom_complet) VALUES (?,?,?,?,?,?)")
       ->execute([$b['email'], $hash, $b['role'], $b['id_lien']??null, $b['id_classe']??null, $b['nom_complet']??'']);
    respond(['id' => $db->lastInsertId(), 'message' => 'Utilisateur créé — mot de passe : ' . $mdp], 201);
}

if ($method === 'PUT' && $id && !$action) {
    $b = jsonBody();
    $db->prepare("UPDATE utilisateurs SET nom_complet=?,role=?,actif=?,id_classe=?,id_lien=? WHERE id=?")
       ->execute([$b['nom_complet']??'',$b['role']??'etudiant',(int)($b['actif']??1),$b['id_classe']??null,$b['id_lien']??null,$id]);
    if (!empty($b['password'])) {
        $hash = password_hash($b['password'], PASSWORD_BCRYPT, ['cost' => 10]);
        $db->prepare("UPDATE utilisateurs SET mot_de_passe_hash=? WHERE id=?")->execute([$hash, $id]);
    }
    respond(['message' => 'Utilisateur mis à jour']);
}

// ── Réactiver un utilisateur ──
if ($method === 'PUT' && $id && $action === 'reactiver') {
    $db->prepare("UPDATE utilisateurs SET actif=1 WHERE id=?")->execute([$id]);
    respond(['message' => 'Utilisateur réactivé']);
}

// ── Désactiver un utilisateur ──
if ($method === 'DELETE' && $id) {
    $db->prepare("UPDATE utilisateurs SET actif=0 WHERE id=?")->execute([$id]);
    respond(['message' => 'Utilisateur désactivé']);
}

// ── Réinitialiser le mot de passe ──
if ($method === 'POST' && $id && $action === 'reset-mdp') {
    $hash = password_hash('password', PASSWORD_BCRYPT, ['cost' => 10]);
    $db->prepare("UPDATE utilisateurs SET mot_de_passe_hash=? WHERE id=?")->execute([$hash, $id]);
    respond(['message' => 'Mot de passe réinitialisé à "password"']);
}

respond(['error' => 'Route inconnue'], 404);
