<?php
// ============================================================
//  EduSchedule Pro — Configuration Générale (CORRIGÉ)
//  backend/config/config.php
// ============================================================

// Clé secrète JWT
define('JWT_SECRET',     'EduSchedulePro_S3cr3tK3y_2025_ISGE_RST_!@#');
define('JWT_EXPIRATION', 3600 * 8); // 8 heures

// Clé secrète pour les tokens QR
define('QR_SECRET_KEY',  'QR_S3cr3t_EduSch3dul3_!2025');

// Fenêtre de validité QR (minutes)
define('QR_WINDOW_MINUTES',    15);

// Délai alerte retard (minutes)
define('RETARD_ALERTE_MINUTES', 30);

// ⚠️ CORRIGÉ : Vite tourne sur le port 5173
define('FRONTEND_URL', 'http://localhost:5173');

// ⚠️ AJOUTÉ : URL du backend (utilisé dans QRCodeManager pour les liens QR)
define('BACKEND_URL', 'http://localhost/eduschedulepro/backend');

// Timezone Ouagadougou
date_default_timezone_set('Africa/Ouagadougou');

// Headers CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . FRONTEND_URL);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}