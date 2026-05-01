<?php
// ============================================================
//  EduSchedule Pro — Générateur de hash bcrypt
//  Exécuter UNE SEULE FOIS pour initialiser les mots de passe
//  Accès : http://localhost/backend/utils/generate_passwords.php
// ============================================================

// SUPPRIMER CE FICHIER APRÈS UTILISATION EN PRODUCTION !

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

echo "<pre>";
echo "-- Copier ces UPDATE dans phpMyAdmin :\n\n";

foreach ($comptes as $email => $password) {
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    echo "UPDATE utilisateurs SET mot_de_passe_hash = '$hash' WHERE email = '$email';\n";
}

echo "\n-- Mots de passe en clair (à communiquer à l'équipe) :\n";
foreach ($comptes as $email => $password) {
    echo "$email  →  $password\n";
}
echo "</pre>";