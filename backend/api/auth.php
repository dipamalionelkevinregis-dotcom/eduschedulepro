<?php
// backend/api/auth.php
require_once __DIR__.'/../config/cors.php';
require_once __DIR__.'/../config/database.php';
require_once __DIR__.'/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'login') {
    $body = jsonBody();
    $email = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';

    if (!$email || !$password) respond(['error' => 'Email et mot de passe requis'], 400);

    $db = getDB();
    $stmt = $db->prepare("SELECT u.*, e.taux_horaire FROM utilisateurs u LEFT JOIN enseignants e ON u.id_lien = e.id WHERE u.email = ? AND u.actif = 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['mot_de_passe_hash'])) {
        respond(['error' => 'Identifiants incorrects'], 401);
    }

    $token = createJWT([
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'nom' => $user['nom_complet'],
        'id_lien' => $user['id_lien'],
        'id_classe' => $user['id_classe'],
    ]);

    // Log
    $db->prepare("INSERT INTO logs_activite (id_utilisateur, action, ip) VALUES (?,?,?)")
       ->execute([$user['id'], 'login', $_SERVER['REMOTE_ADDR'] ?? '']);

    respond([
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'nom' => $user['nom_complet'],
            'id_lien' => $user['id_lien'],
            'id_classe' => $user['id_classe'],
        ]
    ]);
}

if ($method === 'POST' && $action === 'logout') {
    $user = requireAuth();
    getDB()->prepare("INSERT INTO logs_activite (id_utilisateur, action, ip) VALUES (?,?,?)")
           ->execute([$user['id'], 'logout', $_SERVER['REMOTE_ADDR'] ?? '']);
    respond(['message' => 'Déconnecté']);
}

if ($method === 'GET' && $action === 'me') {
    $user = requireAuth();
    respond($user);
}

respond(['error' => 'Route inconnue'], 404);
