<?php
// ============================================================
//  EduSchedule Pro — Test Connexion BDD & Backend
//  Fichier : C:\wamp64\www\eduschedulepro\backend\test.php
//  Accès   : http://localhost/eduschedulepro/backend/test.php
//  ⚠️  SUPPRIMER CE FICHIER APRÈS LES TESTS !
// ============================================================

// Désactiver les erreurs en affichage propre
error_reporting(E_ALL);
ini_set('display_errors', 0);

$resultats = [];
$erreurs   = [];

// ============================================================
// TEST 1 — Version PHP
// ============================================================
$phpVersion = PHP_VERSION;
$ok = version_compare($phpVersion, '8.0.0', '>=');
$resultats[] = [
    'test'    => '1. Version PHP',
    'statut'  => $ok ? 'OK' : 'ERREUR',
    'detail'  => "PHP $phpVersion " . ($ok ? '✅ Compatible' : '❌ Minimum PHP 8.0 requis')
];

// ============================================================
// TEST 2 — Extensions PHP requises
// ============================================================
$extensions = ['pdo', 'pdo_mysql', 'json', 'mbstring', 'openssl'];
foreach ($extensions as $ext) {
    $ok = extension_loaded($ext);
    $resultats[] = [
        'test'   => "2. Extension PHP : $ext",
        'statut' => $ok ? 'OK' : 'ERREUR',
        'detail' => $ok ? "✅ Chargée" : "❌ Manquante — activer dans php.ini"
    ];
}

// ============================================================
// TEST 3 — Connexion à la base de données
// ============================================================
$host   = 'localhost';
$dbname = 'eduschedulepro';
$user   = 'root';
$pass   = '';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $user, $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $resultats[] = [
        'test'   => '3. Connexion MySQL',
        'statut' => 'OK',
        'detail' => "✅ Connecté à '$dbname' sur $host"
    ];
} catch (PDOException $e) {
    $resultats[] = [
        'test'   => '3. Connexion MySQL',
        'statut' => 'ERREUR',
        'detail' => "❌ " . $e->getMessage()
    ];
    $pdo = null;
}

// ============================================================
// TEST 4 — Vérification des tables
// ============================================================
if ($pdo) {
    $tablesRequises = [
        'classes', 'matieres', 'enseignants', 'salles',
        'utilisateurs', 'emploi_temps', 'creneaux', 'pointages',
        'cahiers_texte', 'signatures', 'travaux_demandes',
        'vacations', 'vacation_lignes', 'validations', 'logs_activite'
    ];

    $stmt = $pdo->query("SHOW TABLES");
    $tablesExistantes = $stmt->fetchAll(PDO::FETCH_COLUMN);

    foreach ($tablesRequises as $table) {
        $ok = in_array($table, $tablesExistantes);
        $resultats[] = [
            'test'   => "4. Table : $table",
            'statut' => $ok ? 'OK' : 'ERREUR',
            'detail' => $ok ? "✅ Existe" : "❌ Table manquante — réimporter le script SQL"
        ];
    }
}

// ============================================================
// TEST 5 — Données de démonstration
// ============================================================
if ($pdo) {
    $checks = [
        ['classes',     'classes',     5],
        ['matieres',    'matières',    8],
        ['enseignants', 'enseignants', 5],
        ['salles',      'salles',      5],
        ['utilisateurs','utilisateurs',10],
        ['creneaux',    'créneaux',    8],
    ];

    foreach ($checks as [$table, $label, $min]) {
        $count = (int)$pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
        $ok    = $count >= $min;
        $resultats[] = [
            'test'   => "5. Données : $label",
            'statut' => $ok ? 'OK' : 'ATTENTION',
            'detail' => "$count enregistrement(s) " . ($ok ? "✅" : "⚠️ Attendu minimum $min")
        ];
    }
}

// ============================================================
// TEST 6 — Vérification des mots de passe (hash valides)
// ============================================================
if ($pdo) {
    $stmt  = $pdo->query("SELECT email, mot_de_passe_hash FROM utilisateurs LIMIT 1");
    $user  = $stmt->fetch(PDO::FETCH_ASSOC);
    $valid = $user && strlen($user['mot_de_passe_hash']) > 20 && !str_contains($user['mot_de_passe_hash'], 'examplehash');

    $resultats[] = [
        'test'   => '6. Hash mots de passe',
        'statut' => $valid ? 'OK' : 'ERREUR',
        'detail' => $valid
            ? "✅ Hash bcrypt valide pour {$user['email']}"
            : "❌ Faux hash détecté ! Exécuter generate_passwords.php et mettre à jour les utilisateurs"
    ];
}

// ============================================================
// TEST 7 — Authentification JWT (login admin)
// ============================================================
$loginUrl = 'http://localhost/eduschedulepro/backend/api/auth/login';
$loginData = json_encode(['email' => 'admin@isge.bf', 'password' => 'Admin@2026']);

$ch = curl_init($loginUrl);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $loginData,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 5,
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

$token = null;
if ($curlErr) {
    $resultats[] = [
        'test'   => '7. Login Admin (JWT)',
        'statut' => 'ERREUR',
        'detail' => "❌ Erreur cURL : $curlErr"
    ];
} elseif ($httpCode === 200) {
    $data  = json_decode($response, true);
    $token = $data['token'] ?? null;
    $resultats[] = [
        'test'   => '7. Login Admin (JWT)',
        'statut' => $token ? 'OK' : 'ERREUR',
        'detail' => $token
            ? "✅ Token JWT généré pour admin@isge.bf"
            : "❌ Login échoué : " . ($data['error'] ?? 'Erreur inconnue')
    ];
} else {
    $resultats[] = [
        'test'   => '7. Login Admin (JWT)',
        'statut' => 'ERREUR',
        'detail' => "❌ HTTP $httpCode — Vérifiez que WAMP est démarré et mod_rewrite activé"
    ];
}

// ============================================================
// TEST 8 — Endpoints API (avec token)
// ============================================================
if ($token) {
    $endpoints = [
        ['GET', '/api/classes',     'Liste classes'],
        ['GET', '/api/matieres',    'Liste matières'],
        ['GET', '/api/enseignants', 'Liste enseignants'],
        ['GET', '/api/salles',      'Liste salles'],
        ['GET', '/api/emploi-temps?id_classe=3&semaine=2026-04-14', 'Emploi du temps L3'],
        ['GET', '/api/creneaux?id_emploi_temps=1', 'Créneaux semaine'],
        ['GET', '/api/dashboard/stats', 'Dashboard stats'],
    ];

    foreach ($endpoints as [$method, $path, $label]) {
        $url = 'http://localhost/eduschedulepro/backend' . $path;
        $ch  = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_HTTPGET        => true,
            CURLOPT_HTTPHEADER     => ["Authorization: Bearer $token", 'Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 5,
        ]);
        $res  = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $data   = json_decode($res, true);
        $ok     = $code === 200 && !empty($data['success']);
        $count  = is_array($data['data'] ?? null) ? count($data['data']) : '—';

        $resultats[] = [
            'test'   => "8. API : $label",
            'statut' => $ok ? 'OK' : 'ERREUR',
            'detail' => $ok
                ? "✅ HTTP $code — $count résultat(s)"
                : "❌ HTTP $code — " . ($data['error'] ?? $res)
        ];
    }
}

// ============================================================
// TEST 9 — Test création d'une classe (POST)
// ============================================================
if ($token) {
    $url  = 'http://localhost/eduschedulepro/backend/api/classes';
    $body = json_encode(['code' => 'TEST-TMP', 'libelle' => 'Classe Test Temporaire', 'niveau' => 'Licence 1', 'annee_academique' => '2025-2026', 'effectif' => 1]);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $body,
        CURLOPT_HTTPHEADER     => ["Authorization: Bearer $token", 'Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 5,
    ]);
    $res  = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $data   = json_decode($res, true);
    $newId  = $data['data']['id'] ?? null;
    $ok     = $code === 201 && $newId;

    $resultats[] = [
        'test'   => '9. Création classe (POST)',
        'statut' => $ok ? 'OK' : 'ERREUR',
        'detail' => $ok ? "✅ Classe créée avec ID #$newId" : "❌ HTTP $code — " . ($data['error'] ?? $res)
    ];

    // Supprimer la classe de test
    if ($newId) {
        $ch = curl_init("$url/$newId");
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST  => 'DELETE',
            CURLOPT_HTTPHEADER     => ["Authorization: Bearer $token"],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 5,
        ]);
        $res  = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $data = json_decode($res, true);

        $resultats[] = [
            'test'   => '9b. Suppression classe test (DELETE)',
            'statut' => $code === 200 ? 'OK' : 'ERREUR',
            'detail' => $code === 200 ? "✅ Classe test supprimée" : "❌ HTTP $code"
        ];
    }
}

// ============================================================
// TEST 10 — Test génération QR-Code
// ============================================================
if ($token) {
    $url = 'http://localhost/eduschedulepro/backend/api/creneaux/1/qr';
    $ch  = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_HTTPGET        => true,
        CURLOPT_HTTPHEADER     => ["Authorization: Bearer $token"],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 5,
    ]);
    $res  = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $data = json_decode($res, true);
    $ok   = $code === 200 && !empty($data['data']['token']);

    $resultats[] = [
        'test'   => '10. Génération QR-Code',
        'statut' => $ok ? 'OK' : 'ERREUR',
        'detail' => $ok
            ? "✅ Token QR généré — expire le " . ($data['data']['expire_le'] ?? '?')
            : "❌ HTTP $code — " . ($data['error'] ?? $res)
    ];
}

// ============================================================
// AFFICHAGE HTML
// ============================================================
$nbOk      = count(array_filter($resultats, fn($r) => $r['statut'] === 'OK'));
$nbErreur  = count(array_filter($resultats, fn($r) => $r['statut'] === 'ERREUR'));
$nbAttention = count(array_filter($resultats, fn($r) => $r['statut'] === 'ATTENTION'));
$total     = count($resultats);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EduSchedule Pro — Tests BDD & Backend</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; color: #1e293b; padding: 2rem; }
  .container { max-width: 900px; margin: 0 auto; }
  h1 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.25rem; }
  .subtitle { color: #64748b; margin-bottom: 2rem; font-size: 0.9rem; }

  .summary {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 1rem; margin-bottom: 2rem;
  }
  .summary-card {
    background: white; border-radius: 12px; padding: 1.25rem;
    border: 1px solid #e2e8f0; text-align: center;
  }
  .summary-card .val { font-size: 2.5rem; font-weight: 800; }
  .summary-card .lbl { font-size: 0.8rem; color: #64748b; margin-top: 0.25rem; }
  .green { color: #10b981; } .red { color: #ef4444; }
  .orange { color: #f59e0b; } .blue { color: #4F46E5; }

  .tests { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
  .test-row {
    display: grid; grid-template-columns: 2fr 100px 3fr;
    padding: 0.75rem 1.25rem; border-bottom: 1px solid #f1f5f9;
    align-items: center; font-size: 0.875rem;
  }
  .test-row:last-child { border-bottom: none; }
  .test-row:hover { background: #f8fafc; }
  .test-name { font-weight: 500; color: #374151; }
  .badge {
    padding: 0.2rem 0.6rem; border-radius: 20px;
    font-size: 0.75rem; font-weight: 700; text-align: center;
  }
  .badge-ok      { background: #d1fae5; color: #065f46; }
  .badge-erreur  { background: #fee2e2; color: #991b1b; }
  .badge-attention { background: #fef3c7; color: #92400e; }
  .test-detail { color: #64748b; font-size: 0.8rem; }

  .header-row {
    background: #f8fafc; padding: 0.6rem 1.25rem;
    font-size: 0.75rem; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; letter-spacing: 0.05em;
    display: grid; grid-template-columns: 2fr 100px 3fr;
    border-bottom: 2px solid #e2e8f0;
  }

  .warning-box {
    background: #fef3c7; border: 1px solid #fcd34d;
    border-radius: 10px; padding: 1rem 1.25rem;
    margin-top: 1.5rem; font-size: 0.85rem; color: #92400e;
  }

  .token-box {
    background: #f0fdf4; border: 1px solid #86efac;
    border-radius: 10px; padding: 1rem 1.25rem;
    margin-top: 1rem; font-size: 0.8rem;
    word-break: break-all; color: #166534;
  }
</style>
</head>
<body>
<div class="container">

  <h1>📋 EduSchedule Pro</h1>
  <p class="subtitle">Tests d'interaction BDD ↔ Backend — <?= date('d/m/Y H:i:s') ?></p>

  <!-- Résumé -->
  <div class="summary">
    <div class="summary-card">
      <div class="val blue"><?= $total ?></div>
      <div class="lbl">Tests total</div>
    </div>
    <div class="summary-card">
      <div class="val green"><?= $nbOk ?></div>
      <div class="lbl">✅ Réussis</div>
    </div>
    <div class="summary-card">
      <div class="val red"><?= $nbErreur ?></div>
      <div class="lbl">❌ Erreurs</div>
    </div>
    <div class="summary-card">
      <div class="val orange"><?= $nbAttention ?></div>
      <div class="lbl">⚠️ Attention</div>
    </div>
  </div>

  <!-- Tableau des tests -->
  <div class="tests">
    <div class="header-row">
      <span>Test</span>
      <span>Statut</span>
      <span>Détail</span>
    </div>
    <?php foreach ($resultats as $r): ?>
    <div class="test-row">
      <div class="test-name"><?= htmlspecialchars($r['test']) ?></div>
      <div>
        <span class="badge badge-<?= strtolower($r['statut']) === 'ok' ? 'ok' : (strtolower($r['statut']) === 'attention' ? 'attention' : 'erreur') ?>">
          <?= $r['statut'] ?>
        </span>
      </div>
      <div class="test-detail"><?= htmlspecialchars($r['detail']) ?></div>
    </div>
    <?php endforeach; ?>
  </div>

  <!-- Token JWT si disponible -->
  <?php if ($token): ?>
  <div class="token-box">
    <strong>🔑 Token JWT généré :</strong><br>
    <?= htmlspecialchars(substr($token, 0, 80)) ?>...
    <br><small>Utilise ce token dans Postman : Authorization: Bearer {token}</small>
  </div>
  <?php endif; ?>

  <!-- Message selon résultats -->
  <?php if ($nbErreur === 0): ?>
  <div style="background:#d1fae5;border:1px solid #6ee7b7;border-radius:10px;padding:1rem 1.25rem;margin-top:1.5rem;color:#065f46;font-weight:600;">
    🎉 Tous les tests sont passés ! Ton backend et ta BDD communiquent parfaitement.
    Lance maintenant React avec <code>npm run dev</code> et accède à <strong>http://localhost:5173</strong>
  </div>
  <?php else: ?>
  <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:10px;padding:1rem 1.25rem;margin-top:1.5rem;color:#991b1b;">
    <strong>⚠️ <?= $nbErreur ?> erreur(s) détectée(s).</strong> Corrige les erreurs ci-dessus avant de continuer.
  </div>
  <?php endif; ?>

  <div class="warning-box">
    ⚠️ <strong>Important :</strong> Supprime ce fichier <code>test.php</code> après les tests pour des raisons de sécurité.
  </div>

</div>
</body>
</html>