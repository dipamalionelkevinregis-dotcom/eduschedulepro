<?php
// backend/index.php — Routeur principal
require_once __DIR__.'/config/cors.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = preg_replace('#^/backend/api/#', '', $uri);
$uri = preg_replace('#^/api/#', '', $uri);

// Extraire la ressource et l'ID
$parts = explode('/', trim($uri, '/'));
$resource = $parts[0] ?? '';

// Passer l'ID et l'action via query string si path params
if (isset($parts[1]) && is_numeric($parts[1])) {
    $_GET['id'] = $parts[1];
    if (isset($parts[2])) $_GET['action'] = $parts[2];
}

$routes = [
    'auth' => 'auth.php',
    'classes' => 'classes.php',
    'enseignants' => 'enseignants.php',
    'matieres' => 'matieres.php',
    'salles' => 'salles.php',
    'emploi-temps' => 'emploi_temps.php',
    'creneaux' => 'creneaux.php',
    'pointages' => 'pointages.php',
    'cahiers' => 'cahiers.php',
    'vacations' => 'vacations.php',
    'dashboard' => 'dashboard.php',
    'logs' => 'logs.php',
    'utilisateurs' => 'utilisateurs.php',
];

if (isset($routes[$resource])) {
    require_once __DIR__.'/api/'.$routes[$resource];
} else {
    http_response_code(404);
    echo json_encode(['error' => "Route '$resource' non trouvée", 'uri' => $uri]);
}
