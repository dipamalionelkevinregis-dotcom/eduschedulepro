<?php
// ============================================================
//  EduSchedule Pro — TEST CONNEXION BDD + BACKEND
//  Placer dans : C:\wamp64\www\eduschedulepro\backend\test_connexion.php
//  Ouvrir dans le navigateur : http://localhost/eduschedulepro/backend/test_connexion.php
// ============================================================

// ---- CONFIG ----
$DB_HOST     = 'localhost';
$DB_NAME     = 'eduschedulepro';
$DB_USER     = 'root';
$DB_PASS     = '';          // WAMP = pas de mot de passe
$JWT_SECRET  = 'EduSchedulePro_JWT_Secret_2026_ISGE_BF';

// ---- STYLES ----
echo '<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Test Connexion — EduSchedule Pro</title>
<style>
  body { font-family: Consolas, monospace; background: #0f0f0f; color: #e0e0e0; padding: 30px; }
  h1 { color: #4ade80; font-size: 18px; margin-bottom: 24px; }
  .bloc { background: #1a1a1a; border-left: 3px solid #333; padding: 14px 18px; margin-bottom: 10px; border-radius: 4px; }
  .ok  { border-left-color: #4ade80; }
  .err { border-left-color: #f87171; }
  .info{ border-left-color: #60a5fa; }
  .label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .msg { font-size: 13px; }
  .green { color: #4ade80; }
  .red   { color: #f87171; }
  .blue  { color: #60a5fa; }
  .yellow{ color: #fbbf24; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
  td, th { padding: 6px 10px; border-bottom: 1px solid #2a2a2a; text-align: left; }
  th { color: #888; font-weight: normal; }
  pre { margin: 0; white-space: pre-wrap; word-break: break-all; }
</style>
</head>
<body>
<h1>⚡ EduSchedule Pro — Diagnostic Connexion</h1>';

// ============================================================
// TEST 1 : Version PHP
// ============================================================
$php_ok = version_compare(PHP_VERSION, '8.0.0', '>=');
echo '<div class="bloc ' . ($php_ok ? 'ok' : 'err') . '">';
echo '<div class="label">Test 1 — Version PHP</div>';
echo '<div class="msg ' . ($php_ok ? 'green' : 'red') . '">';
echo ($php_ok ? '✔' : '✘') . ' PHP ' . PHP_VERSION;
if (!$php_ok) echo ' — <span class="red">PHP 8.0+ requis !</span>';
echo '</div></div>';

// ============================================================
// TEST 2 : Extensions PHP requises
// ============================================================
$extensions = ['pdo', 'pdo_mysql', 'json', 'mbstring', 'openssl'];
$ext_ok = true;
echo '<div class="bloc ok"><div class="label">Test 2 — Extensions PHP</div><table>';
echo '<tr><th>Extension</th><th>Statut</th></tr>';
foreach ($extensions as $ext) {
    $loaded = extension_loaded($ext);
    if (!$loaded) $ext_ok = false;
    echo '<tr><td>' . $ext . '</td><td class="' . ($loaded ? 'green' : 'red') . '">' . ($loaded ? '✔ Chargée' : '✘ MANQUANTE') . '</td></tr>';
}
echo '</table></div>';

// ============================================================
// TEST 3 : Connexion à la base de données
// ============================================================
$pdo = null;
try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo '<div class="bloc ok"><div class="label">Test 3 — Connexion MySQL</div>';
    echo '<div class="msg green">✔ Connexion réussie à la base <strong>' . $DB_NAME . '</strong> sur ' . $DB_HOST . '</div></div>';
} catch (PDOException $e) {
    echo '<div class="bloc err"><div class="label">Test 3 — Connexion MySQL</div>';
    echo '<div class="msg red">✘ ÉCHEC : ' . htmlspecialchars($e->getMessage()) . '</div>';
    echo '<div class="msg yellow" style="margin-top:8px;">→ Vérifiez que WAMP est démarré et que la base <strong>' . $DB_NAME . '</strong> existe dans phpMyAdmin</div>';
    echo '</div>';
}

if ($pdo) {
    // ============================================================
    // TEST 4 : Tables existantes
    // ============================================================
    $tables_requises = [
        'classes', 'matieres', 'enseignants', 'salles', 'utilisateurs',
        'emploi_temps', 'creneaux', 'pointages', 'cahiers_texte',
        'signatures', 'travaux_demandes', 'vacations', 'vacation_lignes',
        'validations', 'logs_activite'
    ];
    $stmt = $pdo->query("SHOW TABLES");
    $tables_existantes = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $tables_ok = 0;

    echo '<div class="bloc ok"><div class="label">Test 4 — Tables BDD (' . count($tables_existantes) . ' trouvées)</div><table>';
    echo '<tr><th>Table</th><th>Statut</th><th>Nb lignes</th></tr>';
    foreach ($tables_requises as $table) {
        $existe = in_array($table, $tables_existantes);
        if ($existe) $tables_ok++;
        $count = 0;
        if ($existe) {
            $r = $pdo->query("SELECT COUNT(*) FROM `$table`");
            $count = $r->fetchColumn();
        }
        echo '<tr><td>' . $table . '</td>';
        echo '<td class="' . ($existe ? 'green' : 'red') . '">' . ($existe ? '✔ Existe' : '✘ MANQUANTE') . '</td>';
        echo '<td class="blue">' . ($existe ? $count . ' ligne(s)' : '—') . '</td></tr>';
    }
    echo '</table></div>';

    // ============================================================
    // TEST 5 : Utilisateurs et hash bcrypt
    // ============================================================
    try {
        $stmt = $pdo->query("SELECT email, role, mot_de_passe_hash FROM utilisateurs LIMIT 10");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo '<div class="bloc ok"><div class="label">Test 5 — Utilisateurs et mots de passe</div><table>';
        echo '<tr><th>Email</th><th>Rôle</th><th>Hash valide</th></tr>';
        foreach ($users as $u) {
            $hash_valide = (strlen($u['mot_de_passe_hash']) > 30 && strpos($u['mot_de_passe_hash'], '$2y$') === 0);
            echo '<tr>';
            echo '<td>' . htmlspecialchars($u['email']) . '</td>';
            echo '<td class="blue">' . $u['role'] . '</td>';
            echo '<td class="' . ($hash_valide ? 'green' : 'red') . '">' . ($hash_valide ? '✔ Bcrypt OK' : '✘ Faux hash — relancez generate_passwords.php') . '</td>';
            echo '</tr>';
        }
        echo '</table></div>';

        // ============================================================
        // TEST 6 : Vérification mot de passe admin
        // ============================================================
        $stmt = $pdo->prepare("SELECT mot_de_passe_hash FROM utilisateurs WHERE email = ?");
        $stmt->execute(['admin@isge.bf']);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $mdp_ok = password_verify('Admin@2026', $row['mot_de_passe_hash']);
            echo '<div class="bloc ' . ($mdp_ok ? 'ok' : 'err') . '">';
            echo '<div class="label">Test 6 — Vérification mot de passe admin</div>';
            echo '<div class="msg ' . ($mdp_ok ? 'green' : 'red') . '">';
            echo ($mdp_ok ? '✔ admin@isge.bf / Admin@2026 → OK' : '✘ Mot de passe incorrect — réimportez le script SQL FINAL');
            echo '</div></div>';
        }
    } catch (Exception $e) {
        echo '<div class="bloc err"><div class="label">Test 5</div><div class="msg red">✘ ' . htmlspecialchars($e->getMessage()) . '</div></div>';
    }

    // ============================================================
    // TEST 7 : Génération token JWT
    // ============================================================
    function base64url($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    function genJWT($payload, $secret) {
        $header  = base64url(json_encode(['typ'=>'JWT','alg'=>'HS256']));
        $payload = base64url(json_encode($payload));
        $sig     = base64url(hash_hmac('sha256', "$header.$payload", $secret, true));
        return "$header.$payload.$sig";
    }

    $token = genJWT(['sub'=>1,'email'=>'admin@isge.bf','role'=>'admin','iat'=>time(),'exp'=>time()+3600], $JWT_SECRET);
    $token_ok = (strlen($token) > 50 && substr_count($token, '.') === 2);

    echo '<div class="bloc ' . ($token_ok ? 'ok' : 'err') . '">';
    echo '<div class="label">Test 7 — Génération Token JWT</div>';
    echo '<div class="msg ' . ($token_ok ? 'green' : 'red') . '">' . ($token_ok ? '✔ Token généré avec succès' : '✘ Échec génération JWT') . '</div>';
    if ($token_ok) {
        echo '<div class="msg" style="margin-top:6px;color:#888;font-size:11px;word-break:break-all;">' . substr($token, 0, 100) . '...</div>';
    }
    echo '</div>';
}

// ============================================================
// TEST 8 : Fichiers PHP requis
// ============================================================
$fichiers = [
    'index.php'                    => 'Router principal',
    '.htaccess'                    => 'Routage Apache',
    'config/config.php'            => 'Configuration',
    'config/database.php'          => 'Connexion PDO',
    'middleware/auth.php'          => 'Middleware JWT',
    'utils/JWT.php'                => 'Classe JWT',
    'utils/Response.php'           => 'Réponses JSON',
    'utils/QRCodeManager.php'      => 'QR Code',
    'api/auth.php'                 => 'API Auth',
    'api/classes.php'              => 'API Classes',
    'api/matieres.php'             => 'API Matières',
    'api/enseignants.php'          => 'API Enseignants',
    'api/salles.php'               => 'API Salles',
    'api/emploi_temps.php'         => 'API Emploi du temps',
    'api/creneaux.php'             => 'API Créneaux',
    'api/pointages.php'            => 'API Pointages',
    'api/cahiers.php'              => 'API Cahier de texte',
    'api/vacations.php'            => 'API Vacations',
    'api/dashboard.php'            => 'API Dashboard',
];

echo '<div class="bloc info"><div class="label">Test 8 — Fichiers PHP présents</div><table>';
echo '<tr><th>Fichier</th><th>Rôle</th><th>Statut</th></tr>';
foreach ($fichiers as $fichier => $role) {
    $existe = file_exists(__DIR__ . '/' . $fichier);
    echo '<tr>';
    echo '<td style="font-family:monospace">' . $fichier . '</td>';
    echo '<td style="color:#888">' . $role . '</td>';
    echo '<td class="' . ($existe ? 'green' : 'yellow') . '">' . ($existe ? '✔ Présent' : '⚠ Manquant') . '</td>';
    echo '</tr>';
}
echo '</table></div>';

// ============================================================
// RÉSUMÉ FINAL
// ============================================================
echo '<div class="bloc info" style="margin-top:20px;">';
echo '<div class="label">Résumé — Prochaines étapes</div>';
echo '<div class="msg" style="line-height:2;font-size:13px;">';
echo '<span class="blue">1.</span> Si tous les tests sont verts → lance React avec <span class="yellow">npm run dev</span><br>';
echo '<span class="blue">2.</span> Si Test 3 échoue → WAMP non démarré ou base inexistante<br>';
echo '<span class="blue">3.</span> Si Test 6 échoue → réimporter <span class="yellow">eduschedulepro_database_FINAL.sql</span><br>';
echo '<span class="blue">4.</span> Si des fichiers manquent → copier depuis VS Code dans <span class="yellow">C:\wamp64\www\eduschedulepro\backend\</span><br>';
echo '<span class="red">⚠ Supprimer ce fichier avant la soutenance !</span>';
echo '</div></div>';

echo '</body></html>';
?>