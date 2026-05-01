-- ============================================================
-- EduSchedule Pro — Données de démonstration
-- À importer APRÈS eduschedulepro.sql
-- ============================================================

USE eduschedulepro;

-- ============================================================
-- Classes (5 classes)
-- ============================================================
INSERT INTO classes (code, libelle, niveau, annee_academique) VALUES
('RST-L1-A',   'Licence 1 RST - Groupe A', 'Licence 1', '2025-2026'),
('RST-L2-A',   'Licence 2 RST - Groupe A', 'Licence 2', '2025-2026'),
('RST-L3-A',   'Licence 3 RST - Groupe A', 'Licence 3', '2025-2026'),
('RST-M1-A',   'Master 1 RST',             'Master 1',  '2025-2026'),
('INFO-L2-B',  'Licence 2 Informatique',   'Licence 2', '2025-2026');

-- ============================================================
-- Matières (8 matières)
-- ============================================================
INSERT INTO matieres (code, libelle, volume_horaire_total, coefficient) VALUES
('RST301', 'Réseaux et Protocoles',          45.0, 3),
('RST302', 'Télécommunications Numériques',  40.0, 3),
('RST303', 'Traitement du Signal',           45.0, 3),
('RST304', 'Sécurité des Réseaux',           30.0, 2),
('DEV301', 'Développement Web',              40.0, 2),
('BD301',  'Bases de Données Avancées',      35.0, 2),
('MATH301','Mathématiques Appliquées',       45.0, 3),
('MGMT301','Management et Stratégie',        25.0, 1);

-- ============================================================
-- Salles (4 salles)
-- ============================================================
INSERT INTO salles (code, capacite, equipements, batiment) VALUES
('A101', 40, 'Vidéoprojecteur, tableau blanc, WiFi',   'Bâtiment A'),
('A102', 35, 'Vidéoprojecteur, tableau blanc',         'Bâtiment A'),
('B201', 30, 'Vidéoprojecteur, climatisation, WiFi',   'Bâtiment B'),
('LABO1', 25, 'Ordinateurs (25 postes), serveur local','Laboratoire');

-- ============================================================
-- Enseignants (5 enseignants)
-- ============================================================
INSERT INTO enseignants (matricule, nom, prenom, email, specialite, statut, taux_horaire) VALUES
('ENS001', 'BÉRÉ',    'Cédric',    'c.bere@isge-bf.edu',    'Développement Web, Bases de données', 'permanent',  8000.00),
('ENS002', 'SAWADOGO','Ibrahim',   'i.sawadogo@isge-bf.edu','Réseaux, Télécommunications',         'permanent',  8000.00),
('ENS003', 'KABORE',  'Aminata',   'a.kabore@vacataire.net','Traitement du Signal, MATLAB',        'vacataire',  6000.00),
('ENS004', 'OUEDRAOGO','Dramane',  'd.ouedraogo@vacataire.net','Sécurité Informatique, Cryptographie','vacataire', 6500.00),
('ENS005', 'TRAORE',  'Mariam',    'm.traore@vacataire.net','Mathématiques Appliquées',            'vacataire',  5500.00);

-- ============================================================
-- Utilisateurs (comptes de connexion)
-- Mot de passe pour tous : "Password" → hash bcrypt
-- ============================================================
INSERT INTO utilisateurs (email, mot_de_passe_hash, role, id_lien) VALUES
('admin@isge-bf.edu',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
 'admin', NULL),
('c.bere@isge-bf.edu',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'enseignant', 1),
('i.sawadogo@isge-bf.edu',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'enseignant', 2),
('a.kabore@vacataire.net',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'enseignant', 3),
('d.ouedraogo@vacataire.net',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'enseignant', 4),
('m.traore@vacataire.net',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'enseignant', 5),
('delegue.rst-l3@isge-bf.edu',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'delegue', NULL),
('surveillant@isge-bf.edu',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'surveillant', NULL),
('comptable@isge-bf.edu',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'comptable', NULL);

-- ============================================================
-- Emploi du temps (semaine du 28 avril 2026, classe RST-L3)
-- ============================================================
INSERT INTO emploi_temps (id_classe, semaine_debut, statut_publication, cree_par) VALUES
(3, '2026-04-28', 'publie', 1);

-- Créneaux de la semaine
INSERT INTO creneaux (id_emploi_temps, id_matiere, id_enseignant, id_salle, jour, heure_debut, heure_fin) VALUES
(1, 5, 1, 3, 'Lundi',    '08:00:00', '10:00:00'), -- Dev Web - BÉRÉ - B201
(1, 6, 1, 3, 'Lundi',    '10:00:00', '12:00:00'), -- BDD - BÉRÉ - B201
(1, 1, 2, 1, 'Mardi',    '08:00:00', '10:00:00'), -- Réseaux - SAWADOGO - A101
(1, 4, 4, 1, 'Mardi',    '14:00:00', '16:00:00'), -- Sécu - OUEDRAOGO - A101
(1, 3, 3, 4, 'Mercredi', '08:00:00', '11:00:00'), -- Signal - KABORE - LABO1
(1, 7, 5, 2, 'Jeudi',    '08:00:00', '10:00:00'), -- Maths - TRAORE - A102
(1, 2, 2, 1, 'Vendredi', '08:00:00', '10:00:00'), -- Télécoms - SAWADOGO - A101
(1, 8, 1, 2, 'Samedi',   '08:00:00', '10:00:00'); -- Management - BÉRÉ - A102

SELECT 'Données de démonstration insérées avec succès ✓' AS message;
SELECT CONCAT('Classes : ', COUNT(*)) AS info FROM classes;
SELECT CONCAT('Enseignants : ', COUNT(*)) AS info FROM enseignants;
SELECT CONCAT('Utilisateurs : ', COUNT(*)) AS info FROM utilisateurs;
SELECT CONCAT('Créneaux semaine : ', COUNT(*)) AS info FROM creneaux;
