<?php
// ============================================================
//  EduSchedule Pro — Modèle Cahier de Texte
//  backend/models/CahierTexte.php
// ============================================================
require_once __DIR__ . '/../config/database.php';

class CahierTexte {
    private PDO $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getPdo();
    }

    public function findAll(array $filters = []): array {
        $where = ['1=1'];
        $params = [];

        if (!empty($filters['id_enseignant'])) {
            $where[] = 'ct.id_enseignant = ?';
            $params[] = $filters['id_enseignant'];
        }
        if (!empty($filters['id_classe'])) {
            $where[] = 'ct.id_classe = ?';
            $params[] = $filters['id_classe'];
        }

        $sql = "
            SELECT ct.*,
                   e.nom AS enseignant_nom, e.prenom AS enseignant_prenom,
                   m.libelle AS matiere_nom,
                   cl.libelle AS classe_nom
            FROM cahiers_texte ct
            LEFT JOIN enseignants e ON e.id = ct.id_enseignant
            LEFT JOIN matieres m    ON m.id = ct.id_matiere
            LEFT JOIN classes cl    ON cl.id = ct.id_classe
            WHERE " . implode(' AND ', $where) . "
            ORDER BY ct.date_seance DESC
        ";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(array $data): int {
        $stmt = $this->pdo->prepare("
            INSERT INTO cahiers_texte
                (id_creneau, id_enseignant, id_matiere, id_classe, date_seance,
                 heure_debut, heure_fin, contenu, travaux_donnes, observations, statut_signature)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'non_signe')
        ");
        $stmt->execute([
            $data['id_creneau']      ?? null,
            $data['id_enseignant'],
            $data['id_matiere'],
            $data['id_classe'],
            $data['date_seance'],
            $data['heure_debut'],
            $data['heure_fin'],
            $data['contenu']         ?? '',
            $data['travaux_donnes']  ?? null,
            $data['observations']    ?? null,
        ]);
        return (int) $this->pdo->lastInsertId();
    }

    public function signer(int $id, string $signatureData): bool {
        $stmt = $this->pdo->prepare("
            UPDATE cahiers_texte
            SET statut_signature = 'signe', signature_data = ?, date_signature = NOW()
            WHERE id = ?
        ");
        return $stmt->execute([$signatureData, $id]);
    }

    public function delete(int $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM cahiers_texte WHERE id = ?");
        return $stmt->execute([$id]);
    }
}