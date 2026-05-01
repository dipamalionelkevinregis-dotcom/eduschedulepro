<?php
// ============================================================
//  EduSchedule Pro — Modèle Vacation
//  backend/models/Vacation.php
// ============================================================
require_once __DIR__ . '/../config/database.php';

class Vacation {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getPdo();
    }

    public function findAll(array $filters = []): array {
        $where  = ['1=1'];
        $params = [];

        if (!empty($filters['id_enseignant'])) {
            $where[] = 'v.id_enseignant = ?';
            $params[] = $filters['id_enseignant'];
        }
        if (!empty($filters['statut'])) {
            $where[] = 'v.statut = ?';
            $params[] = $filters['statut'];
        }

        $sql = "
            SELECT v.*,
                   e.nom AS enseignant_nom, e.prenom AS enseignant_prenom
            FROM vacations v
            LEFT JOIN enseignants e ON e.id = v.id_enseignant
            WHERE " . implode(' AND ', $where) . "
            ORDER BY v.date_debut DESC
        ";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(array $data): int {
        $heures = (float) ($data['nombre_heures'] ?? 0);
        $taux   = (float) ($data['taux_horaire']  ?? 0);
        $montant = $heures * $taux;

        $stmt = $this->pdo->prepare("
            INSERT INTO vacations
                (id_enseignant, periode, date_debut, date_fin, nombre_heures,
                 taux_horaire, montant_total, statut, observations)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'en_attente', ?)
        ");
        $stmt->execute([
            $data['id_enseignant'],
            $data['periode']       ?? null,
            $data['date_debut'],
            $data['date_fin'],
            $heures,
            $taux,
            $montant,
            $data['observations']  ?? null,
        ]);
        return (int) $this->pdo->lastInsertId();
    }

    public function updateStatut(int $id, string $statut, ?string $commentaire = null): bool {
        $stmt = $this->pdo->prepare("
            UPDATE vacations
            SET statut = ?, commentaire_validation = ?, date_validation = NOW()
            WHERE id = ?
        ");
        return $stmt->execute([$statut, $commentaire, $id]);
    }

    /** Montant total à payer pour les vacations validées d'un enseignant */
    public function totalValide(int $idEnseignant): float {
        $stmt = $this->pdo->prepare("
            SELECT COALESCE(SUM(montant_total), 0)
            FROM vacations
            WHERE id_enseignant = ? AND statut = 'valide'
        ");
        $stmt->execute([$idEnseignant]);
        return (float) $stmt->fetchColumn();
    }
}