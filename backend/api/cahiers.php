<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

function handleCahiers(string $method, ?string $id): void {
    $pdo = Database::getInstance()->getPdo();

    if ($method === 'GET') {
        $stmt = $pdo->query("
            SELECT ct.*, ct.titre_cours as contenu_cours, ct.date_creation as created_at,
                   m.libelle as matiere_nom,
                   CONCAT(e.prenom,' ',e.nom) as enseignant_nom
            FROM cahiers_texte ct
            LEFT JOIN creneaux cr ON ct.id_creneau = cr.id
            LEFT JOIN matieres m ON cr.id_matiere = m.id
            LEFT JOIN enseignants e ON cr.id_enseignant = e.id
            ORDER BY ct.date_creation DESC
        ");
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        return;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        $contenu = $body['contenu_cours'] ?? $body['titre_cours'] ?? '';
        $stmt = $pdo->prepare("INSERT INTO cahiers_texte (id_creneau, id_delegue, titre_cours, contenu_json, statut) VALUES (?, ?, ?, ?, 'brouillon')");
        $stmt->execute([
            $body['id_creneau'] ?? 0,
            $body['id_delegue'] ?? 1,
            $contenu,
            json_encode(['travaux' => $body['travaux_demandes'] ?? ''])
        ]);
        echo json_encode(['success' => true, 'message' => 'Entrée créée.', 'id' => $pdo->lastInsertId()]);
        return;
    }

    if ($method === 'PUT' && $id) {
        $body = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('UPDATE cahiers_texte SET titre_cours=? WHERE id=?');
        $stmt->execute([$body['contenu_cours'] ?? $body['titre_cours'], $id]);
        echo json_encode(['success' => true, 'message' => 'Cahier modifié.']);
        return;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
}

function handleCahierSigner(string $id): void {
    $pdo = Database::getInstance()->getPdo();
    $stmt = $pdo->prepare("UPDATE cahiers_texte SET statut='clôturé' WHERE id=?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Cahier signé.']);
}