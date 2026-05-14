-- ============================================================
-- EduSchedule Pro — Script SQL complet
-- ISGE | RST | Année 2025-2026
-- ============================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `eduschedulepro` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `eduschedulepro`;

CREATE TABLE `classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `libelle` VARCHAR(100) NOT NULL,
  `niveau` VARCHAR(50) NOT NULL,
  `annee_academique` VARCHAR(9) NOT NULL DEFAULT '2025-2026',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE `matieres` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `libelle` VARCHAR(150) NOT NULL,
  `volume_horaire_total` DECIMAL(5,1) NOT NULL DEFAULT 0,
  `coefficient` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE `enseignants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `matricule` VARCHAR(30) NOT NULL UNIQUE,
  `nom` VARCHAR(80) NOT NULL,
  `prenom` VARCHAR(80) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `telephone` VARCHAR(20),
  `specialite` VARCHAR(150),
  `statut` ENUM('permanent','vacataire') NOT NULL DEFAULT 'vacataire',
  `taux_horaire` DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE `salles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `libelle` VARCHAR(100) NOT NULL,
  `capacite` INT NOT NULL DEFAULT 30,
  `equipements` TEXT,
  `batiment` VARCHAR(80),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE `utilisateurs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `mot_de_passe_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','enseignant','delegue','surveillant','comptable','etudiant') NOT NULL,
  `id_lien` INT DEFAULT NULL,
  `id_classe` INT DEFAULT NULL,
  `nom_complet` VARCHAR(180),
  `actif` TINYINT(1) NOT NULL DEFAULT 1,
  `token_reset` VARCHAR(255) DEFAULT NULL,
  `token_reset_expire` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE `emploi_temps` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_classe` INT NOT NULL,
  `semaine_debut` DATE NOT NULL,
  `statut_publication` ENUM('brouillon','publie','archive') NOT NULL DEFAULT 'brouillon',
  `cree_par` INT NOT NULL,
  `date_creation` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `date_publication` DATETIME DEFAULT NULL,
  FOREIGN KEY (`id_classe`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`cree_par`) REFERENCES `utilisateurs`(`id`)
) ENGINE=InnoDB;

CREATE TABLE `creneaux` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_emploi_temps` INT NOT NULL,
  `id_matiere` INT NOT NULL,
  `id_enseignant` INT NOT NULL,
  `id_salle` INT NOT NULL,
  `jour` ENUM('lundi','mardi','mercredi','jeudi','vendredi','samedi') NOT NULL,
  `heure_debut` TIME NOT NULL,
  `heure_fin` TIME NOT NULL,
  `qr_token` VARCHAR(512) DEFAULT NULL,
  `qr_expire` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_emploi_temps`) REFERENCES `emploi_temps`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`id_matiere`) REFERENCES `matieres`(`id`),
  FOREIGN KEY (`id_enseignant`) REFERENCES `enseignants`(`id`),
  FOREIGN KEY (`id_salle`) REFERENCES `salles`(`id`)
) ENGINE=InnoDB;

CREATE TABLE `pointages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_creneau` INT NOT NULL,
  `id_enseignant` INT NOT NULL,
  `heure_pointage_reelle` DATETIME NOT NULL,
  `ip_source` VARCHAR(45),
  `token_utilise` VARCHAR(512),
  `statut` ENUM('ok','retard','absent') NOT NULL DEFAULT 'ok',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_creneau`) REFERENCES `creneaux`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`id_enseignant`) REFERENCES `enseignants`(`id`)
) ENGINE=InnoDB;

CREATE TABLE `cahiers_texte` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_creneau` INT NOT NULL,
  `id_delegue` INT NOT NULL,
  `titre_cours` VARCHAR(255),
  `contenu_json` JSON,
  `niveau_avancement` VARCHAR(100),
  `heure_fin_reelle` TIME DEFAULT NULL,
  `observations` TEXT,
  `statut` ENUM('brouillon','signe_delegue','cloture') NOT NULL DEFAULT 'brouillon',
  `date_creation` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `date_cloture` DATETIME DEFAULT NULL,
  FOREIGN KEY (`id_creneau`) REFERENCES `creneaux`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`id_delegue`) REFERENCES `utilisateurs`(`id`)
) ENGINE=InnoDB;

CREATE TABLE `signatures` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_cahier` INT NOT NULL,
  `type_signataire` ENUM('delegue','enseignant') NOT NULL,
  `id_utilisateur` INT NOT NULL,
  `signature_base64` LONGTEXT NOT NULL,
  `horodatage` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_cahier`) REFERENCES `cahiers_texte`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs`(`id`)
) ENGINE=InnoDB;

CREATE TABLE `travaux_demandes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_cahier` INT NOT NULL,
  `description` TEXT NOT NULL,
  `date_limite` DATE,
  `type` ENUM('devoir','exercice','projet','expose','autre') NOT NULL DEFAULT 'devoir',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_cahier`) REFERENCES `cahiers_texte`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `vacations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_enseignant` INT NOT NULL,
  `mois` TINYINT NOT NULL,
  `annee` YEAR NOT NULL,
  `montant_brut` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `retenues` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `montant_net` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `statut` ENUM('generee','signee_enseignant','visee_surveillant','approuvee_comptable') NOT NULL DEFAULT 'generee',
  `date_generation` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_enseignant`) REFERENCES `enseignants`(`id`)
) ENGINE=InnoDB;

CREATE TABLE `vacation_lignes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_vacation` INT NOT NULL,
  `id_creneau` INT NOT NULL,
  `duree_heures` DECIMAL(5,2) NOT NULL,
  `taux` DECIMAL(10,2) NOT NULL,
  `montant` DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (`id_vacation`) REFERENCES `vacations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`id_creneau`) REFERENCES `creneaux`(`id`)
) ENGINE=InnoDB;

CREATE TABLE `validations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_vacation` INT NOT NULL,
  `id_validateur` INT NOT NULL,
  `role_validateur` ENUM('enseignant','surveillant','comptable') NOT NULL,
  `visa_base64` LONGTEXT,
  `date_validation` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `commentaire` TEXT,
  FOREIGN KEY (`id_vacation`) REFERENCES `vacations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`id_validateur`) REFERENCES `utilisateurs`(`id`)
) ENGINE=InnoDB;

CREATE TABLE `logs_activite` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `id_utilisateur` INT DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `details_json` JSON,
  `ip` VARCHAR(45),
  `date_heure` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Données de démo
INSERT INTO `classes` (`code`,`libelle`,`niveau`) VALUES
('RST-L1','Licence 1 RST','Licence 1'),
('RST-L2','Licence 2 RST','Licence 2'),
('RST-L3','Licence 3 RST','Licence 3'),
('RST-M1','Master 1 RST','Master 1');

INSERT INTO `matieres` (`code`,`libelle`,`volume_horaire_total`,`coefficient`) VALUES
('MATH101','Mathématiques Appliquées',45,3),
('INFO101','Algorithmique et Programmation',60,4),
('NET101','Réseaux Informatiques',45,3),
('SYS101','Systèmes d Exploitation',45,3),
('WEB101','Développement Web',60,4),
('BD101','Bases de Données',45,3),
('SEC101','Sécurité des Systèmes',30,2),
('TELEC101','Télécommunications',45,3);

INSERT INTO `salles` (`code`,`libelle`,`capacite`,`equipements`,`batiment`) VALUES
('A101','Salle A101',40,'Tableau, Projecteur','Bâtiment A'),
('A102','Salle A102',35,'Tableau, Projecteur','Bâtiment A'),
('B201','Labo Informatique B201',30,'PCs, Réseau, Projecteur','Bâtiment B'),
('B202','Labo Réseaux B202',25,'Équipements Cisco, PCs','Bâtiment B'),
('C301','Amphi C301',80,'Micro, Projecteur HD','Bâtiment C');

INSERT INTO `enseignants` (`matricule`,`nom`,`prenom`,`email`,`telephone`,`specialite`,`statut`,`taux_horaire`) VALUES
('ENS001','BERE','Cedric','cedric.bere@isge.bf','70000001','Développement Web','permanent',8000.00),
('ENS002','OUEDRAOGO','Adama','adama.ouedraogo@isge.bf','70000002','Réseaux et Sécurité','vacataire',6000.00),
('ENS003','TRAORE','Fatima','fatima.traore@isge.bf','70000003','Bases de Données','vacataire',6500.00),
('ENS004','SAWADOGO','Ibrahim','ibrahim.sawadogo@isge.bf','70000004','Mathématiques','permanent',7000.00),
('ENS005','KABORE','Marie','marie.kabore@isge.bf','70000005','Systèmes et Télécoms','vacataire',6000.00);

-- Mot de passe: password (hash bcrypt)
INSERT INTO `utilisateurs` (`email`,`mot_de_passe_hash`,`role`,`id_lien`,`id_classe`,`nom_complet`) VALUES
('admin@isge.bf','$2y$12$LCy7xGEDzUxEoXiYxwirMuHd2Z1QFdLLSBjMdm8PqJlmQfLwkWQ3W','admin',NULL,NULL,'Administrateur ISGE'),
('cedric.bere@isge.bf','$2y$12$LCy7xGEDzUxEoXiYxwirMuHd2Z1QFdLLSBjMdm8PqJlmQfLwkWQ3W','enseignant',1,NULL,'Dr. Cedric BERE'),
('adama.ouedraogo@isge.bf','$2y$12$LCy7xGEDzUxEoXiYxwirMuHd2Z1QFdLLSBjMdm8PqJlmQfLwkWQ3W','enseignant',2,NULL,'Adama OUEDRAOGO'),
('fatima.traore@isge.bf','$2y$12$LCy7xGEDzUxEoXiYxwirMuHd2Z1QFdLLSBjMdm8PqJlmQfLwkWQ3W','enseignant',3,NULL,'Fatima TRAORE'),
('ibrahim.sawadogo@isge.bf','$2y$12$LCy7xGEDzUxEoXiYxwirMuHd2Z1QFdLLSBjMdm8PqJlmQfLwkWQ3W','enseignant',4,NULL,'Ibrahim SAWADOGO'),
('marie.kabore@isge.bf','$2y$12$LCy7xGEDzUxEoXiYxwirMuHd2Z1QFdLLSBjMdm8PqJlmQfLwkWQ3W','enseignant',5,NULL,'Marie KABORE'),
('delegue.l1@isge.bf','$2y$12$LCy7xGEDzUxEoXiYxwirMuHd2Z1QFdLLSBjMdm8PqJlmQfLwkWQ3W','delegue',NULL,1,'Delegue L1 RST'),
('delegue.l2@isge.bf','$2y$12$LCy7xGEDzUxEoXiYxwirMuHd2Z1QFdLLSBjMdm8PqJlmQfLwkWQ3W','delegue',NULL,2,'Delegue L2 RST'),
('surveillant@isge.bf','$2y$12$LCy7xGEDzUxEoXiYxwirMuHd2Z1QFdLLSBjMdm8PqJlmQfLwkWQ3W','surveillant',NULL,NULL,'Surveillant General'),
('comptable@isge.bf','$2y$12$LCy7xGEDzUxEoXiYxwirMuHd2Z1QFdLLSBjMdm8PqJlmQfLwkWQ3W','comptable',NULL,NULL,'Responsable Comptable');

INSERT INTO `emploi_temps` (`id_classe`,`semaine_debut`,`statut_publication`,`cree_par`) VALUES
(1,'2026-04-27','publie',1),(2,'2026-04-27','publie',1);

INSERT INTO `creneaux` (`id_emploi_temps`,`id_matiere`,`id_enseignant`,`id_salle`,`jour`,`heure_debut`,`heure_fin`) VALUES
(1,5,1,3,'lundi','08:00:00','10:00:00'),
(1,1,4,1,'lundi','10:30:00','12:30:00'),
(1,2,1,3,'mardi','08:00:00','10:00:00'),
(1,6,3,3,'mardi','10:30:00','12:30:00'),
(1,3,2,4,'mercredi','08:00:00','10:00:00'),
(1,4,5,1,'jeudi','08:00:00','10:00:00'),
(1,7,2,1,'vendredi','14:00:00','16:00:00'),
(1,8,5,5,'samedi','08:00:00','10:00:00'),
(2,5,1,3,'lundi','14:00:00','16:00:00'),
(2,3,2,4,'mardi','14:00:00','16:00:00'),
(2,6,3,3,'mercredi','10:30:00','12:30:00'),
(2,7,2,1,'jeudi','10:30:00','12:30:00');

SET FOREIGN_KEY_CHECKS = 1;
