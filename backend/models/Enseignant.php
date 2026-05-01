<?php
/**
 * models/Enseignant.php
 * =====================
 * Modèle métier — Enseignant
 *
 * Encapsule toutes les opérations sur la table `enseignants`.
 * Utilisé par api/enseignants.php pour séparer la logique métier
 * de la couche HTTP (principe MVC).
 *
 * Méthodes disponibles :
 *   - Enseignant::findAll()         → tous les enseignants
 *   - Enseignant::findById($id)     → un enseignant par ID
 *   - Enseignant::findByEmail($email)  → par email
 *   - Enseignant::create($data)     → créer
 *   - Enseignant::update($id, $data)→ mettre à jour
 *   - Enseignant::delete($id)       → supprimer
 *
 * Dépendances :
 *   - config/database.php → Database::getInstance()->getPdo()
 */

require_once __DIR__ . '/../config/database.php';

class Enseignant {

    // ──────────────────────────────────────────────────────────────
    // Récupérer tous les enseignants (triés par nom)
    // ──────────────────────────────────────────────────────────────
    public static function findAll(): array {
        $pdo  = Database::getInstance()->getPdo();
        $stmt = $pdo->query('
            SELECT id, nom, prenom, email, specialite, statut,
                   type_enseignant, taux_horaire, created_at
            FROM enseignants
            ORDER BY nom, prenom
        ');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ──────────────────────────────────────────────────────────────
    // Récupérer un enseignant par son ID
    // Retourne null si introuvable
    // ──────────────────────────────────────────────────────────────
    public static function findById(int $id): ?array {
        $pdo  = Database::getInstance()->getPdo();
        $stmt = $pdo->prepare('SELECT * FROM enseignants WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row  = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    // ──────────────────────────────────────────────────────────────
    // Récupérer un enseignant par son email
    // ──────────────────────────────────────────────────────────────
    public static function findByEmail(string $email): ?array {
        $pdo  = Database::getInstance()->getPdo();
        $stmt = $pdo->prepare('SELECT * FROM enseignants WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $row  = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    // ──────────────────────────────────────────────────────────────
    // Créer un nouvel enseignant
    // $data : tableau associatif avec les champs requis
    // Retourne l'ID inséré
    // ──────────────────────────────────────────────────────────────
    public static function create(array $data): int {
        $pdo  = Database::getInstance()->getPdo();
        $stmt = $pdo->prepare('
            INSERT INTO enseignants
                (nom, prenom, email, specialite, statut, type_enseignant, taux_horaire, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ');
        $stmt->execute([
            $data['nom']             ?? '',
            $data['prenom']          ?? '',
            $data['email']           ?? '',
            $data['specialite']      ?? '',
            $data['statut']          ?? 'actif',
            $data['type_enseignant'] ?? 'vacataire',
            $data['taux_horaire']    ?? 5000,
        ]);
        return (int)$pdo->lastInsertId();
    }

    // ──────────────────────────────────────────────────────────────
    // Mettre à jour un enseignant existant
    // Retourne true si au moins 1 ligne modifiée
    // ──────────────────────────────────────────────────────────────
    public static function update(int $id, array $data): bool {
        $pdo  = Database::getInstance()->getPdo();
        $stmt = $pdo->prepare('
            UPDATE enseignants
            SET nom = ?, prenom = ?, email = ?, specialite = ?,
                statut = ?, type_enseignant = ?, taux_horaire = ?
            WHERE id = ?
        ');
        $stmt->execute([
            $data['nom']             ?? '',
            $data['prenom']          ?? '',
            $data['email']           ?? '',
            $data['specialite']      ?? '',
            $data['statut']          ?? 'actif',
            $data['type_enseignant'] ?? 'vacataire',
            $data['taux_horaire']    ?? 5000,
            $id,
        ]);
        return $stmt->rowCount() > 0;
    }

    // ──────────────────────────────────────────────────────────────
    // Supprimer un enseignant
    // ──────────────────────────────────────────────────────────────
    public static function delete(int $id): bool {
        $pdo  = Database::getInstance()->getPdo();
        $stmt = $pdo->prepare('DELETE FROM enseignants WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    // ──────────────────────────────────────────────────────────────
    // Compter le total des enseignants (pour les stats dashboard)
    // ──────────────────────────────────────────────────────────────
    public static function count(): int {
        $pdo = Database::getInstance()->getPdo();
        return (int)$pdo->query('SELECT COUNT(*) FROM enseignants')->fetchColumn();
    }
}