<?php
// ============================================================
//  EduSchedule Pro — Router principal SANS .htaccess
//  Placer dans : C:\wamp64\www\eduschedulepro\backend\index.php
// ============================================================

// ---------- CORS ----------
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ---------- Récupérer le path ----------
// Fonctionne avec et sans mod_rewrite
$path = '';

if (isset($_GET['path'])) {
    // Mode sans mod_rewrite : index.php?path=api/auth/login
    $path = '/' . trim($_GET['path'], '/');
} else {
    // Mode avec mod_rewrite
    $uri  = $_SERVER['REQUEST_URI'];
    $base = dirname($_SERVER['SCRIPT_NAME']);
    $path = str_replace($base, '', strtok($uri, '?'));
    $path = '/' . trim($path, '/');
}

$method = $_SERVER['REQUEST_METHOD'];

// ---------- Routing ----------

// AUTH
if ($path === '/api/auth/login') {
    require_once __DIR__ . '/api/auth.php';
    handleLogin(); exit();
}
if ($path === '/api/auth/logout') {
    require_once __DIR__ . '/api/auth.php';
    handleLogout(); exit();
}
if ($path === '/api/auth/me') {
    require_once __DIR__ . '/api/auth.php';
    handleMe(); exit();
}

// CLASSES
if (preg_match('#^/api/classes(/(\d+))?$#', $path, $m)) {
    require_once __DIR__ . '/api/classes.php';
    handleClasses($method, $m[2] ?? null); exit();
}

// MATIÈRES
if (preg_match('#^/api/matieres(/(\d+))?$#', $path, $m)) {
    require_once __DIR__ . '/api/matieres.php';
    handleMatieres($method, $m[2] ?? null); exit();
}

// ENSEIGNANTS
if (preg_match('#^/api/enseignants(/(\d+))?$#', $path, $m)) {
    require_once __DIR__ . '/api/enseignants.php';
    handleEnseignants($method, $m[2] ?? null); exit();
}

// SALLES
if (preg_match('#^/api/salles(/(\d+))?$#', $path, $m)) {
    require_once __DIR__ . '/api/salles.php';
    handleSalles($method, $m[2] ?? null); exit();
}

// EMPLOIS DU TEMPS
if (preg_match('#^/api/emplois-temps/(\d+)/(publier|depublier|dupliquer)$#', $path, $m)) {
    require_once __DIR__ . '/api/emploi_temps.php';
    handleEmploiTemps($method, $m[1], $m[2]); exit();
}
if (preg_match('#^/api/emplois-temps(/(\d+))?$#', $path, $m)) {
    require_once __DIR__ . '/api/emploi_temps.php';
    handleEmploiTemps($method, $m[2] ?? null, null); exit();
}

// CRÉNEAUX
if (preg_match('#^/api/creneaux/(\d+)/qr$#', $path, $m)) {
    require_once __DIR__ . '/api/creneaux.php';
    handleCreneauQR($m[1]); exit();
}
if (preg_match('#^/api/creneaux(/(\d+))?$#', $path, $m)) {
    require_once __DIR__ . '/api/creneaux.php';
    handleCreneaux($method, $m[2] ?? null); exit();
}

// POINTAGES
if ($path === '/api/pointages/scan') {
    require_once __DIR__ . '/api/pointages.php';
    handlePointageScan(); exit();
}
if (preg_match('#^/api/pointages/(\d+)/statut$#', $path, $m)) {
    require_once __DIR__ . '/api/pointages.php';
    handlePointageStatut($m[1]); exit();
}
if (preg_match('#^/api/pointages(/(\d+))?$#', $path, $m)) {
    require_once __DIR__ . '/api/pointages.php';
    handlePointages($method, $m[2] ?? null); exit();
}

// CAHIERS
if (preg_match('#^/api/cahiers/(\d+)/signer$#', $path, $m)) {
    require_once __DIR__ . '/api/cahiers.php';
    handleCahierSigner($m[1]); exit();
}
if (preg_match('#^/api/cahiers(/(\d+))?$#', $path, $m)) {
    require_once __DIR__ . '/api/cahiers.php';
    handleCahiers($method, $m[2] ?? null); exit();
}

// VACATIONS
if (preg_match('#^/api/vacations/(\d+)/(valider|rejeter)$#', $path, $m)) {
    require_once __DIR__ . '/api/vacations.php';
    handleVacationAction($m[1], $m[2]); exit();
}
if (preg_match('#^/api/vacations/(\d+)/pdf$#', $path, $m)) {
    require_once __DIR__ . '/api/vacations.php';
    handleVacationPDF($m[1]); exit();
}
if (preg_match('#^/api/vacations(/(\d+))?$#', $path, $m)) {
    require_once __DIR__ . '/api/vacations.php';
    handleVacations($method, $m[2] ?? null); exit();
}

// DASHBOARD
if ($path === '/api/dashboard') {
    require_once __DIR__ . '/api/dashboard.php';
    handleDashboard(); exit();
}

// LOGS
if ($path === '/api/logs') {
    require_once __DIR__ . '/api/logs.php';
    handleLogs($method); exit();
}

// ---------- 404 ----------
http_response_code(404);
echo json_encode([
    'error'  => 'Endpoint introuvable.',
    'path'   => $path,
    'method' => $method,
]);