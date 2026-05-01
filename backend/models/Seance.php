<?php
// ============================================================
//  EduSchedule Pro — Modèle Séance (Créneau)
//  backend/models/Seance.php
// ============================================================
require_once __DIR__ . '/../config/database.php';

class Seance {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getPdo();
    }

    public function findByEmploiTemps(int $idEmploiTemps): array {
        $stmt = $this->pdo->prepare("
            SELECT c.*,
                   m.libelle AS matiere_nom,
                   e.nom AS enseignant_nom, e.prenom AS enseignant_prenom,
                   s.nom AS salle_nom
            FROM creneaux c
            LEFT JOIN matieres m    ON m.id = c.id_matiere
            LEFT JOIN enseignants e ON e.id = c.id_enseignant
            LEFT JOIN salles s      ON s.id = c.id_salle
            WHERE c.id_emploi_temps = ?
            ORDER BY FIELD(c.jour,'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'), c.heure_debut
        ");
        $stmt->execute([$idEmploiTemps]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(array $data): int {
        // Générer un token QR unique
        $qrToken = bin2hex(random_bytes(16));

        $stmt = $this->pdo->prepare("
            INSERT INTO creneaux
                (id_emploi_temps, id_matiere, id_enseignant, id_salle, jour,
                 heure_debut, heure_fin, type_seance, qr_token, qr_expire, statut)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR), 'planifie')
        ");
        $stmt->execute([
            $data['id_emploi_temps'],
            $data['id_matiere'],
            $data['id_enseignant'],
            $data['id_salle']   ?? null,
            $data['jour'],
            $data['heure_debut'],
            $data['heure_fin'],
            $data['type_seance'] ?? 'CM',
            $qrToken,
        ]);
        return (int) $this->pdo->lastInsertId();
    }

    public function delete(int $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM creneaux WHERE id = ?");
        return $stmt->execute([$id]);
    }

    /** Regénère le QR token d'un créneau */
    public function regenerateQR(int $id): string {
        $token = bin2hex(random_bytes(16));
        $stmt = $this->pdo->prepare("
            UPDATE creneaux
            SET qr_token = ?, qr_expire = DATE_ADD(NOW(), INTERVAL 24 HOUR), qr_utilise = 0
            WHERE id = ?
        ");
        $stmt->execute([$token, $id]);
        return $token;
    }
}