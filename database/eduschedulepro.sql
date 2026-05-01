-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mar. 21 avr. 2026 à 10:16
-- Version du serveur : 9.1.0
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `eduschedulepro`
--

-- --------------------------------------------------------

--
-- Structure de la table `cahiers_texte`
--

DROP TABLE IF EXISTS `cahiers_texte`;
CREATE TABLE IF NOT EXISTS `cahiers_texte` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_creneau` int UNSIGNED NOT NULL,
  `id_delegue` int UNSIGNED NOT NULL,
  `titre_cours` varchar(200) NOT NULL,
  `contenu_json` json DEFAULT NULL,
  `heure_fin_reelle` time DEFAULT NULL,
  `statut` enum('brouillon','signé_délégué','clôturé') NOT NULL DEFAULT 'brouillon',
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_creneau` (`id_creneau`),
  KEY `fk_ct_delegue` (`id_delegue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `classes`
--

DROP TABLE IF EXISTS `classes`;
CREATE TABLE IF NOT EXISTS `classes` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `libelle` varchar(100) NOT NULL,
  `niveau` enum('Licence 1','Licence 2','Licence 3','Master 1','Master 2','Ingénieur') NOT NULL,
  `annee_academique` varchar(9) NOT NULL,
  `effectif` smallint UNSIGNED DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `classes`
--

INSERT INTO `classes` (`id`, `code`, `libelle`, `niveau`, `annee_academique`, `effectif`, `created_at`) VALUES
(1, 'L1-RST', 'Licence 1 Réseaux et Télécoms', 'Licence 1', '2025-2026', 60, '2026-04-17 09:29:14'),
(2, 'L2-RST', 'Licence 2 Réseaux et Télécoms', 'Licence 2', '2025-2026', 60, '2026-04-17 09:29:14'),
(3, 'L3-RST', 'Licence 3 Réseaux et Télécoms', 'Licence 3', '2025-2026', 60, '2026-04-17 09:29:14'),
(4, 'M1-RST', 'Master 1 Réseaux et Télécoms', 'Master 1', '2025-2026', 40, '2026-04-17 09:29:14'),
(5, 'ING-RST', 'Ingénieur RST', 'Ingénieur', '2025-2026', 40, '2026-04-17 09:29:14');

-- --------------------------------------------------------

--
-- Structure de la table `creneaux`
--

DROP TABLE IF EXISTS `creneaux`;
CREATE TABLE IF NOT EXISTS `creneaux` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_emploi_temps` int UNSIGNED NOT NULL,
  `id_matiere` int UNSIGNED NOT NULL,
  `id_enseignant` int UNSIGNED NOT NULL,
  `id_salle` int UNSIGNED NOT NULL,
  `jour` enum('Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi') NOT NULL,
  `heure_debut` time NOT NULL,
  `heure_fin` time NOT NULL,
  `type_seance` enum('CM','TD','TP') NOT NULL DEFAULT 'CM',
  `qr_token` varchar(255) DEFAULT NULL,
  `qr_expire` datetime DEFAULT NULL,
  `qr_utilise` tinyint(1) NOT NULL DEFAULT '0',
  `statut` enum('planifié','en_cours','terminé','annulé') NOT NULL DEFAULT 'planifié',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `qr_token` (`qr_token`),
  KEY `fk_cr_et` (`id_emploi_temps`),
  KEY `fk_cr_matiere` (`id_matiere`),
  KEY `fk_cr_enseignant` (`id_enseignant`),
  KEY `fk_cr_salle` (`id_salle`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `creneaux`
--

INSERT INTO `creneaux` (`id`, `id_emploi_temps`, `id_matiere`, `id_enseignant`, `id_salle`, `jour`, `heure_debut`, `heure_fin`, `type_seance`, `qr_token`, `qr_expire`, `qr_utilise`, `statut`, `created_at`) VALUES
(1, 1, 2, 1, 2, 'Lundi', '08:00:00', '10:00:00', 'CM', NULL, NULL, 0, 'planifié', '2026-04-17 09:29:15'),
(2, 1, 2, 1, 4, 'Lundi', '10:15:00', '12:15:00', 'TP', NULL, NULL, 0, 'planifié', '2026-04-17 09:29:15'),
(3, 1, 1, 2, 2, 'Mardi', '08:00:00', '10:00:00', 'CM', NULL, NULL, 0, 'planifié', '2026-04-17 09:29:15'),
(4, 1, 3, 3, 2, 'Mercredi', '08:00:00', '10:00:00', 'CM', NULL, NULL, 0, 'planifié', '2026-04-17 09:29:15'),
(5, 1, 6, 5, 2, 'Jeudi', '08:00:00', '10:00:00', 'CM', NULL, NULL, 0, 'planifié', '2026-04-17 09:29:15'),
(6, 1, 6, 5, 4, 'Jeudi', '10:15:00', '12:15:00', 'TD', NULL, NULL, 0, 'planifié', '2026-04-17 09:29:15'),
(7, 1, 4, 4, 2, 'Vendredi', '08:00:00', '10:00:00', 'CM', NULL, NULL, 0, 'planifié', '2026-04-17 09:29:15'),
(8, 1, 8, 1, 5, 'Samedi', '08:00:00', '10:00:00', 'TD', NULL, NULL, 0, 'planifié', '2026-04-17 09:29:15');

-- --------------------------------------------------------

--
-- Structure de la table `emploi_temps`
--

DROP TABLE IF EXISTS `emploi_temps`;
CREATE TABLE IF NOT EXISTS `emploi_temps` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_classe` int UNSIGNED NOT NULL,
  `semaine_debut` date NOT NULL,
  `statut_publication` enum('brouillon','publié','archivé') NOT NULL DEFAULT 'brouillon',
  `cree_par` int UNSIGNED NOT NULL,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_et_classe` (`id_classe`),
  KEY `fk_et_createur` (`cree_par`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `emploi_temps`
--

INSERT INTO `emploi_temps` (`id`, `id_classe`, `semaine_debut`, `statut_publication`, `cree_par`, `date_creation`, `date_modification`) VALUES
(1, 3, '2026-04-14', 'publié', 1, '2026-04-17 09:29:15', '2026-04-17 09:29:15');

-- --------------------------------------------------------

--
-- Structure de la table `enseignants`
--

DROP TABLE IF EXISTS `enseignants`;
CREATE TABLE IF NOT EXISTS `enseignants` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `matricule` varchar(30) NOT NULL,
  `nom` varchar(80) NOT NULL,
  `prenom` varchar(80) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `specialite` varchar(150) DEFAULT NULL,
  `statut` enum('vacataire','permanent') NOT NULL DEFAULT 'vacataire',
  `taux_horaire` decimal(10,2) NOT NULL DEFAULT '0.00',
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricule` (`matricule`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `enseignants`
--

INSERT INTO `enseignants` (`id`, `matricule`, `nom`, `prenom`, `email`, `telephone`, `specialite`, `statut`, `taux_horaire`, `actif`, `created_at`) VALUES
(1, 'ENS001', 'BÉRÉ', 'Wend-Panga Cédric', 'cbere@isge.bf', '+22670000001', 'Développement Web', 'permanent', 5000.00, 1, '2026-04-17 09:29:14'),
(2, 'ENS002', 'OUEDRAOGO', 'Boureima', 'bouedraogo@isge.bf', '+22670000002', 'Réseaux TCP/IP', 'permanent', 5000.00, 1, '2026-04-17 09:29:14'),
(3, 'ENS003', 'SAWADOGO', 'Inoussa', 'isawadogo@isge.bf', '+22670000003', 'Sécurité Informatique', 'vacataire', 7500.00, 1, '2026-04-17 09:29:14'),
(4, 'ENS004', 'TRAORE', 'Aminata', 'atraore@isge.bf', '+22670000004', 'Traitement du Signal', 'vacataire', 7500.00, 1, '2026-04-17 09:29:14'),
(5, 'ENS005', 'KABORÉ', 'Serge', 'skabore@isge.bf', '+22670000005', 'Bases de Données', 'vacataire', 6000.00, 1, '2026-04-17 09:29:14');

-- --------------------------------------------------------

--
-- Structure de la table `logs_activite`
--

DROP TABLE IF EXISTS `logs_activite`;
CREATE TABLE IF NOT EXISTS `logs_activite` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_utilisateur` int UNSIGNED DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `details_json` json DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `date_heure` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_log_user` (`id_utilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `matieres`
--

DROP TABLE IF EXISTS `matieres`;
CREATE TABLE IF NOT EXISTS `matieres` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `libelle` varchar(150) NOT NULL,
  `volume_horaire_total` smallint UNSIGNED NOT NULL DEFAULT '0',
  `coefficient` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `matieres`
--

INSERT INTO `matieres` (`id`, `code`, `libelle`, `volume_horaire_total`, `coefficient`, `created_at`) VALUES
(1, 'RST301', 'Réseaux TCP/IP', 40, 3, '2026-04-17 09:29:14'),
(2, 'RST302', 'Développement Web', 60, 3, '2026-04-17 09:29:14'),
(3, 'RST303', 'Sécurité des Réseaux', 40, 3, '2026-04-17 09:29:14'),
(4, 'RST304', 'Traitement du Signal', 45, 3, '2026-04-17 09:29:14'),
(5, 'RST305', 'Systèmes exploitation', 35, 2, '2026-04-17 09:29:14'),
(6, 'RST306', 'Bases de Données', 40, 3, '2026-04-17 09:29:14'),
(7, 'RST307', 'Programmation Java', 50, 3, '2026-04-17 09:29:14'),
(8, 'RST308', 'Gestion et Economie', 30, 2, '2026-04-17 09:29:14');

-- --------------------------------------------------------

--
-- Structure de la table `pointages`
--

DROP TABLE IF EXISTS `pointages`;
CREATE TABLE IF NOT EXISTS `pointages` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_creneau` int UNSIGNED NOT NULL,
  `id_enseignant` int UNSIGNED NOT NULL,
  `heure_pointage_reelle` datetime NOT NULL,
  `ip_source` varchar(45) DEFAULT NULL,
  `token_utilise` varchar(255) DEFAULT NULL,
  `statut` enum('à_l_heure','retard','absent') NOT NULL DEFAULT 'à_l_heure',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_pt_creneau` (`id_creneau`),
  KEY `fk_pt_enseignant` (`id_enseignant`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `salles`
--

DROP TABLE IF EXISTS `salles`;
CREATE TABLE IF NOT EXISTS `salles` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `capacite` smallint UNSIGNED NOT NULL DEFAULT '0',
  `equipements` text,
  `batiment` varchar(80) DEFAULT NULL,
  `disponible` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `salles`
--

INSERT INTO `salles` (`id`, `code`, `capacite`, `equipements`, `batiment`, `disponible`, `created_at`) VALUES
(1, 'SALLE-01', 120, 'Vidéoprojecteur, micro, tableau', 'Bâtiment A', 1, '2026-04-17 09:29:15'),
(2, 'SALLE-14', 100, 'Vidéoprojecteur, tableau blanc', 'Bâtiment B', 1, '2026-04-17 09:29:15'),
(3, 'SALLE-15', 100, 'Vidéoprojecteur, tableau blanc', 'Bâtiment B', 1, '2026-04-17 09:29:15'),
(4, 'LABO-RESEAU', 50, 'Ordinateurs, réseau, vidéoprojecteur', 'Bâtiment C', 1, '2026-04-17 09:29:15'),
(5, 'SALLE-TD1', 50, 'Tableau noir', 'Bâtiment A', 1, '2026-04-17 09:29:15');

-- --------------------------------------------------------

--
-- Structure de la table `signatures`
--

DROP TABLE IF EXISTS `signatures`;
CREATE TABLE IF NOT EXISTS `signatures` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_cahier` int UNSIGNED NOT NULL,
  `type_signataire` enum('delegue','enseignant') NOT NULL,
  `id_utilisateur` int UNSIGNED NOT NULL,
  `signature_base64` longtext NOT NULL,
  `horodatage` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_signature` (`id_cahier`,`type_signataire`),
  KEY `fk_sig_user` (`id_utilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `travaux_demandes`
--

DROP TABLE IF EXISTS `travaux_demandes`;
CREATE TABLE IF NOT EXISTS `travaux_demandes` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_cahier` int UNSIGNED NOT NULL,
  `description` text NOT NULL,
  `date_limite` date DEFAULT NULL,
  `type` enum('devoir','exercice','projet','lecture','autre') NOT NULL DEFAULT 'exercice',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_td_cahier` (`id_cahier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `mot_de_passe_hash` varchar(255) NOT NULL,
  `role` enum('admin','enseignant','delegue','surveillant','comptable','etudiant') NOT NULL,
  `id_lien` int UNSIGNED DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `token_reset` varchar(255) DEFAULT NULL,
  `token_reset_expire` datetime DEFAULT NULL,
  `derniere_connexion` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `email`, `mot_de_passe_hash`, `role`, `id_lien`, `actif`, `token_reset`, `token_reset_expire`, `derniere_connexion`, `created_at`) VALUES
(1, 'admin@isge.bf', '$2y$12$KXE7iynqOYOFde0soE/eKOqF2vEdtFRaQk1yEkLHo7dLd.bfzRPsS', 'admin', NULL, 1, NULL, NULL, NULL, '2026-04-17 09:29:15'),
(2, 'cbere@isge.bf', '$2y$12$cpfPQ.ITuOAWjptZmCTfH./BoxNBExkFWRDYsHuGt1EpvCuIlhHrq', 'enseignant', 1, 1, NULL, NULL, NULL, '2026-04-17 09:29:15'),
(3, 'bouedraogo@isge.bf', '$2y$12$3qB7s55xjnXx1X3mjVQ9W.ZlWkdvML38m/9izlYTeg6krnKSfPbWq', 'enseignant', 2, 1, NULL, NULL, NULL, '2026-04-17 09:29:15'),
(4, 'isawadogo@isge.bf', '$2y$12$H39BJK9TZb3hMZi4gASaEui4Nuy7lB/Yx1yRI5pyS.SYg4VtSteGG', 'enseignant', 3, 1, NULL, NULL, NULL, '2026-04-17 09:29:15'),
(5, 'atraore@isge.bf', '$2y$12$Si4/qG5BG32WqA7tKxCt9OtWSInp/zZuLogcrrS2KlRITIenkceiu', 'enseignant', 4, 1, NULL, NULL, NULL, '2026-04-17 09:29:15'),
(6, 'skabore@isge.bf', '$2y$12$/i2kIG.nPXCq1/ltq.a3ZO8FZd6BWLRkDOZ812d/YTbwYrJvcyZwO', 'enseignant', 5, 1, NULL, NULL, NULL, '2026-04-17 09:29:15'),
(7, 'delegue.l3@isge.bf', '$2y$12$1GICdQrb55WiPthLOBCmgOQm8rL/AeySvX6TXrQY0HQ2iVEP3MMi6', 'delegue', NULL, 1, NULL, NULL, NULL, '2026-04-17 09:29:15'),
(8, 'surveillant@isge.bf', '$2y$12$3DTa01c1b8cJuV4Bm8139.t.V.XhPWn5tE0J4BGYsPTwgKD1bl3sa', 'surveillant', NULL, 1, NULL, NULL, NULL, '2026-04-17 09:29:15'),
(9, 'comptable@isge.bf', '$2y$12$YbjQZjXVupP9CaUrTXYCo.G6K5JpczzkbzDhR.QIiovPVWkwr2ypK', 'comptable', NULL, 1, NULL, NULL, NULL, '2026-04-17 09:29:15'),
(10, 'etudiant01@isge.bf', '$2y$12$GcHszFM6CMQ.FPa0o63oWuUbBJYDCysvxIsJgFp8eyc3cY3KaeWda', 'etudiant', NULL, 1, NULL, NULL, NULL, '2026-04-17 09:29:15');

-- --------------------------------------------------------

--
-- Structure de la table `vacations`
--

DROP TABLE IF EXISTS `vacations`;
CREATE TABLE IF NOT EXISTS `vacations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_enseignant` int UNSIGNED NOT NULL,
  `mois` tinyint UNSIGNED NOT NULL,
  `annee` year NOT NULL,
  `montant_brut` decimal(12,2) NOT NULL DEFAULT '0.00',
  `retenues` decimal(12,2) NOT NULL DEFAULT '0.00',
  `montant_net` decimal(12,2) GENERATED ALWAYS AS ((`montant_brut` - `retenues`)) STORED,
  `statut` enum('générée','signée_enseignant','visée_surveillant','approuvée','payée') NOT NULL DEFAULT 'générée',
  `date_generation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_vacation` (`id_enseignant`,`mois`,`annee`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `vacation_lignes`
--

DROP TABLE IF EXISTS `vacation_lignes`;
CREATE TABLE IF NOT EXISTS `vacation_lignes` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_vacation` int UNSIGNED NOT NULL,
  `id_creneau` int UNSIGNED NOT NULL,
  `duree_heures` decimal(5,2) NOT NULL,
  `taux` decimal(10,2) NOT NULL,
  `montant` decimal(12,2) GENERATED ALWAYS AS ((`duree_heures` * `taux`)) STORED,
  PRIMARY KEY (`id`),
  KEY `fk_vl_vacation` (`id_vacation`),
  KEY `fk_vl_creneau` (`id_creneau`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `validations`
--

DROP TABLE IF EXISTS `validations`;
CREATE TABLE IF NOT EXISTS `validations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_vacation` int UNSIGNED NOT NULL,
  `id_validateur` int UNSIGNED NOT NULL,
  `role_validateur` enum('enseignant','surveillant','comptable') NOT NULL,
  `visa_base64` longtext,
  `date_validation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `commentaire` text,
  PRIMARY KEY (`id`),
  KEY `fk_val_vacation` (`id_vacation`),
  KEY `fk_val_validateur` (`id_validateur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_emploi_temps`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_emploi_temps`;
CREATE TABLE IF NOT EXISTS `vue_emploi_temps` (
`id_creneau` int unsigned
,`semaine_debut` date
,`classe` varchar(100)
,`matiere` varchar(150)
,`enseignant` varchar(161)
,`salle` varchar(20)
,`jour` enum('Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi')
,`heure_debut` time
,`heure_fin` time
,`type_seance` enum('CM','TD','TP')
,`statut_creneau` enum('planifié','en_cours','terminé','annulé')
,`statut_publication` enum('brouillon','publié','archivé')
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_vacation_recap`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_vacation_recap`;
CREATE TABLE IF NOT EXISTS `vue_vacation_recap` (
`enseignant` varchar(161)
,`statut` enum('vacataire','permanent')
,`mois` tinyint unsigned
,`annee` year
,`nb_seances` bigint
,`total_heures` decimal(27,2)
,`montant_brut` decimal(12,2)
,`montant_net` decimal(12,2)
,`statut_vacation` enum('générée','signée_enseignant','visée_surveillant','approuvée','payée')
);

-- --------------------------------------------------------

--
-- Structure de la vue `vue_emploi_temps`
--
DROP TABLE IF EXISTS `vue_emploi_temps`;

DROP VIEW IF EXISTS `vue_emploi_temps`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_emploi_temps`  AS SELECT `c`.`id` AS `id_creneau`, `et`.`semaine_debut` AS `semaine_debut`, `cl`.`libelle` AS `classe`, `m`.`libelle` AS `matiere`, concat(`e`.`prenom`,' ',`e`.`nom`) AS `enseignant`, `s`.`code` AS `salle`, `c`.`jour` AS `jour`, `c`.`heure_debut` AS `heure_debut`, `c`.`heure_fin` AS `heure_fin`, `c`.`type_seance` AS `type_seance`, `c`.`statut` AS `statut_creneau`, `et`.`statut_publication` AS `statut_publication` FROM (((((`creneaux` `c` join `emploi_temps` `et` on((`c`.`id_emploi_temps` = `et`.`id`))) join `classes` `cl` on((`et`.`id_classe` = `cl`.`id`))) join `matieres` `m` on((`c`.`id_matiere` = `m`.`id`))) join `enseignants` `e` on((`c`.`id_enseignant` = `e`.`id`))) join `salles` `s` on((`c`.`id_salle` = `s`.`id`))) ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_vacation_recap`
--
DROP TABLE IF EXISTS `vue_vacation_recap`;

DROP VIEW IF EXISTS `vue_vacation_recap`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_vacation_recap`  AS SELECT concat(`e`.`prenom`,' ',`e`.`nom`) AS `enseignant`, `e`.`statut` AS `statut`, `v`.`mois` AS `mois`, `v`.`annee` AS `annee`, count(`vl`.`id`) AS `nb_seances`, sum(`vl`.`duree_heures`) AS `total_heures`, `v`.`montant_brut` AS `montant_brut`, `v`.`montant_net` AS `montant_net`, `v`.`statut` AS `statut_vacation` FROM ((`vacations` `v` join `enseignants` `e` on((`v`.`id_enseignant` = `e`.`id`))) left join `vacation_lignes` `vl` on((`vl`.`id_vacation` = `v`.`id`))) GROUP BY `v`.`id` ;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `cahiers_texte`
--
ALTER TABLE `cahiers_texte`
  ADD CONSTRAINT `fk_ct_creneau` FOREIGN KEY (`id_creneau`) REFERENCES `creneaux` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ct_delegue` FOREIGN KEY (`id_delegue`) REFERENCES `utilisateurs` (`id`);

--
-- Contraintes pour la table `creneaux`
--
ALTER TABLE `creneaux`
  ADD CONSTRAINT `fk_cr_enseignant` FOREIGN KEY (`id_enseignant`) REFERENCES `enseignants` (`id`),
  ADD CONSTRAINT `fk_cr_et` FOREIGN KEY (`id_emploi_temps`) REFERENCES `emploi_temps` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cr_matiere` FOREIGN KEY (`id_matiere`) REFERENCES `matieres` (`id`),
  ADD CONSTRAINT `fk_cr_salle` FOREIGN KEY (`id_salle`) REFERENCES `salles` (`id`);

--
-- Contraintes pour la table `emploi_temps`
--
ALTER TABLE `emploi_temps`
  ADD CONSTRAINT `fk_et_classe` FOREIGN KEY (`id_classe`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_et_createur` FOREIGN KEY (`cree_par`) REFERENCES `utilisateurs` (`id`);

--
-- Contraintes pour la table `logs_activite`
--
ALTER TABLE `logs_activite`
  ADD CONSTRAINT `fk_log_user` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `pointages`
--
ALTER TABLE `pointages`
  ADD CONSTRAINT `fk_pt_creneau` FOREIGN KEY (`id_creneau`) REFERENCES `creneaux` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pt_enseignant` FOREIGN KEY (`id_enseignant`) REFERENCES `enseignants` (`id`);

--
-- Contraintes pour la table `signatures`
--
ALTER TABLE `signatures`
  ADD CONSTRAINT `fk_sig_cahier` FOREIGN KEY (`id_cahier`) REFERENCES `cahiers_texte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sig_user` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id`);

--
-- Contraintes pour la table `travaux_demandes`
--
ALTER TABLE `travaux_demandes`
  ADD CONSTRAINT `fk_td_cahier` FOREIGN KEY (`id_cahier`) REFERENCES `cahiers_texte` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `vacations`
--
ALTER TABLE `vacations`
  ADD CONSTRAINT `fk_vac_enseignant` FOREIGN KEY (`id_enseignant`) REFERENCES `enseignants` (`id`);

--
-- Contraintes pour la table `vacation_lignes`
--
ALTER TABLE `vacation_lignes`
  ADD CONSTRAINT `fk_vl_creneau` FOREIGN KEY (`id_creneau`) REFERENCES `creneaux` (`id`),
  ADD CONSTRAINT `fk_vl_vacation` FOREIGN KEY (`id_vacation`) REFERENCES `vacations` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `validations`
--
ALTER TABLE `validations`
  ADD CONSTRAINT `fk_val_vacation` FOREIGN KEY (`id_vacation`) REFERENCES `vacations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_val_validateur` FOREIGN KEY (`id_validateur`) REFERENCES `utilisateurs` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
