<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/JWT.php';

function handleLogin(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
        exit();
    }
    $body     = json_decode(file_get_contents('php://input'), true);
    $email    = trim($body['email']    ?? '');
    $password = trim($body['password'] ?? '');
    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email et mot de passe requis.']);
        exit();
    }
    try {
        $pdo  = Database::getInstance()->getPdo();
        $stmt = $pdo->prepare('SELECT u.id, u.email, u.role, u.mot_de_passe_hash, u.actif, COALESCE(e.prenom, "") AS prenom, COALESCE(e.nom, u.email) AS nom FROM utilisateurs u LEFT JOIN enseignants e ON u.id_lien = e.id WHERE u.email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user || !$user['actif']) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Identifiants incorrects.']);
            exit();
        }
        $hash = $user['mot_de_passe_hash'];
        if (str_starts_with($hash, '$2b$')) { $hash = '$2y$' . substr($hash, 4); }
        if (!password_verify($password, $hash)) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Identifiants incorrects.']);
            exit();
        }
        $token = JWT::generate(['sub' => $user['id'], 'email' => $user['email'], 'role' => $user['role'], 'nom' => $user['nom'], 'prenom' => $user['prenom'], 'iat' => time(), 'exp' => time() + 86400]);
        http_response_code(200);
        echo json_encode(['success' => true, 'token' => $token, 'user' => ['id' => $user['id'], 'nom' => $user['nom'], 'prenom' => $user['prenom'], 'email' => $user['email'], 'role' => $user['role']]]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erreur: ' . $e->getMessage()]);
    }
}

function handleLogout(): void {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Déconnecté.']);
}

function handleMe(): void {
    $headers = getallheaders();
    $token = null;
    foreach ($headers as $k => $v) {
        if (strtolower($k) === 'authorization' && preg_match('/Bearer\s+(.+)/i', $v, $m)) {
            $token = $m[1];
        }
    }
    if (!$token) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Token manquant.']);
        exit();
    }
    try {
        $payload = JWT::verify($token);
        $pdo = Database::getInstance()->getPdo();
        $stmt = $pdo->prepare('SELECT u.id, u.email, u.role, COALESCE(e.prenom, "") AS prenom, COALESCE(e.nom, u.email) AS nom FROM utilisateurs u LEFT JOIN enseignants e ON u.id_lien = e.id WHERE u.id = ? AND u.actif = 1');
        $stmt->execute([$payload['sub']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Utilisateur introuvable.']);
            exit();
        }
        http_response_code(200);
        echo json_encode(['success' => true, 'data' => ['user' => $user]]);
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Token invalide.']);
    }
}