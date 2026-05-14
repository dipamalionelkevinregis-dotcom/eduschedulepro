<?php
// regenerer_qr.php — Régénère les QR tokens pour tous les créneaux publiés
// Copier dans backend/ → http://localhost/eduschedulepro/backend/regenerer_qr.php
// SUPPRIMER APRES USAGE

require_once __DIR__.'/config/database.php';

$db = getDB();

// Récupérer tous les créneaux des ET publiés
$creneaux = $db->query("
    SELECT c.id, c.heure_fin, et.semaine_debut
    FROM creneaux c
    JOIN emploi_temps et ON c.id_emploi_temps = et.id
    WHERE et.statut_publication = 'publie'
")->fetchAll();

$count = 0;
foreach ($creneaux as $cr) {
    $token  = bin2hex(random_bytes(32));
    $expire = date('Y-m-d H:i:s', strtotime($cr['semaine_debut'] . ' ' . $cr['heure_fin'] . ' +7 days'));
    $db->prepare("UPDATE creneaux SET qr_token=?, qr_expire=? WHERE id=?")
       ->execute([$token, $expire, $cr['id']]);
    $count++;
}

// Afficher résultat
echo "<style>body{font-family:Arial,sans-serif;padding:30px;max-width:800px}
table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px 12px}
th{background:#6D28D9;color:#fff} .ok{color:#059669;font-weight:bold}
code{background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:0.85rem}</style>";

echo "<h2>✅ QR Tokens régénérés</h2>";
echo "<p class='ok'>{$count} créneau(x) mis à jour</p><hr>";

$creneaux2 = $db->query("
    SELECT c.id, c.jour, c.heure_debut, c.heure_fin,
           c.qr_token, m.libelle AS matiere,
           cl.libelle AS classe, e.nom, e.prenom
    FROM creneaux c
    JOIN emploi_temps et ON c.id_emploi_temps = et.id
    JOIN matieres m ON c.id_matiere = m.id
    JOIN classes cl ON et.id_classe = cl.id
    JOIN enseignants e ON c.id_enseignant = e.id
    WHERE et.statut_publication = 'publie'
    ORDER BY FIELD(c.jour,'lundi','mardi','mercredi','jeudi','vendredi','samedi'), c.heure_debut
")->fetchAll();

echo "<table>
<tr><th>ID</th><th>Jour</th><th>Horaire</th><th>Matière</th><th>Classe</th><th>Enseignant</th><th>Token (début)</th></tr>";

foreach ($creneaux2 as $cr) {
    $token_short = $cr['qr_token'] ? substr($cr['qr_token'], 0, 16) . '...' : 'AUCUN';
    echo "<tr>
        <td>{$cr['id']}</td>
        <td style='text-transform:capitalize'>{$cr['jour']}</td>
        <td>{$cr['heure_debut']} - {$cr['heure_fin']}</td>
        <td>{$cr['matiere']}</td>
        <td>{$cr['classe']}</td>
        <td>{$cr['prenom']} {$cr['nom']}</td>
        <td><code>{$token_short}</code></td>
    </tr>";
}
echo "</table>";

echo "<br><p>Pour tester le scan manuel, accédez à :</p>";
echo "<code>http://localhost/eduschedulepro/backend/api/creneaux.php?id=1&action=qr</code>";
echo "<br><br><p style='color:red;font-weight:bold'>⚠️ Supprimez ce fichier après usage !</p>";
