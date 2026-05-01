<?php
// ============================================================
//  EduSchedule Pro — CORRECTION MOTS DE PASSE
//  Placer dans : C:\wamp64\www\eduschedulepro\backend\fix_passwords.php
//  Ouvrir UNE SEULE FOIS : http://localhost/eduschedulepro/backend/fix_passwords.php
//  SUPPRIMER ce fichier après utilisation !
// ============================================================

$host   = 'localhost';
$dbname = 'eduschedulepro';
$user   = 'root';
$pass   = '';

$comptes = [
    'admin@isge.bf'        => 'Admin@2026',
    'cbere@isge.bf'        => 'Enseignant@2026',
    'bouedraogo@isge.bf'   => 'Enseignant@2026',
    'isawadogo@isge.bf'    => 'Enseignant@2026',
    'atraore@isge.bf'      => 'Enseignant@2026',
    'skabore@isge.bf'      => 'Enseignant@2026',
    'delegue.l3@isge.bf'   => 'Delegue@2026',
    'surveillant@isge.bf'  => 'Surveillant@2026',
    'comptable@isge.bf'    => 'Comptable@2026',
    'etudiant01@isge.bf'   => 'Etudiant@2026',
];

echo '<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Fix Passwords — EduSchedule Pro</title>
<style>
  body { font-family: monospace; background: #111; color: #eee; padding: 30px; }
  h2 { color: #4ade80; }
  .ok  { color: #4ade80; }
  .err { color: #f87171; }
  .row { padding: 8px 0; border-bottom: 1px solid #222; }
  .note { background: #1a1a1a; padding: 14px; border-left: 3px solid #fbbf24; margin-top: 20px; color: #fbbf24; }
</style>
</head>
<body>
<h2>🔧 Correction des mots de passe — EduSchedule Pro</h2>';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $user, $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $ok_count  = 0;
    $err_count = 0;

    foreach ($comptes as $email => $mdp) {
        // Générer un vrai hash $2y$ directement en PHP
        $hash = password_hash($mdp, PASSWORD_BCRYPT, ['cost' => 10]);

        // Vérifier immédiatement que le hash est valide
        $valide = password_verify($mdp, $hash);

        // Mettre à jour en base
        $stmt = $pdo->prepare(
            "UPDATE utilisateurs SET mot_de_passe_hash = ? WHERE email = ?"
        );
        $stmt->execute([$hash, $email]);
        $affected = $stmt->rowCount();

        echo '<div class="row">';
        if ($affected > 0 && $valide) {
            echo '<span class="ok">✔ ' . htmlspecialchars($email) . '</span>';
            echo ' → hash $2y$ généré et vérifié ✓';
            $ok_count++;
        } elseif ($affected === 0) {
            echo '<span class="err">⚠ ' . htmlspecialchars($email) . ' — email introuvable dans la BDD</span>';
            $err_count++;
        } else {
            echo '<span class="err">✘ ' . htmlspecialchars($email) . ' — erreur lors de la mise à jour</span>';
            $err_count++;
        }
        echo '</div>';
    }

    echo '<br>';
    if ($err_count === 0) {
        echo '<div class="ok" style="font-size:18px;margin-top:16px;">✔ ' . $ok_count . ' mots de passe mis à jour avec succès !</div>';
        echo '<div class="ok" style="margin-top:8px;">Tu peux maintenant te connecter avec :</div>';
        echo '<div style="margin-top:12px;line-height:2;color:#60a5fa;">';
        foreach ($comptes as $email => $mdp) {
            echo htmlspecialchars($email) . ' → <strong style="color:#fbbf24;">' . htmlspecialchars($mdp) . '</strong><br>';
        }
        echo '</div>';
    } else {
        echo '<div class="err" style="font-size:16px;margin-top:16px;">⚠ ' . $err_count . ' erreur(s) — vérifiez que la BDD est bien importée.</div>';
    }

} catch (PDOException $e) {
    echo '<div class="err">✘ Connexion BDD échouée : ' . htmlspecialchars($e->getMessage()) . '</div>';
    echo '<div style="color:#fbbf24;margin-top:8px;">→ Vérifiez que WAMP est démarré et que la base "eduschedulepro" existe dans phpMyAdmin.</div>';
}

echo '<div class="note">⚠ IMPORTANT : Supprime ce fichier fix_passwords.php après utilisation !</div>';
echo '</body></html>';
?>