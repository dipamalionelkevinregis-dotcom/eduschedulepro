<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

function handleVacations(string $method, ?string $id): void {
    $pdo = Database::getInstance()->getPdo();

    if ($method === 'GET') {
        if ($id) {
            $stmt = $pdo->prepare("SELECT v.*, CONCAT(e.prenom,' ',e.nom) as enseignant_nom FROM vacations v LEFT JOIN enseignants e ON v.id_enseignant=e.id WHERE v.id=?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'data' => $stmt->fetch(PDO::FETCH_ASSOC)]);
        } else {
            $stmt = $pdo->query("SELECT v.*, CONCAT(e.prenom,' ',e.nom) as enseignant_nom FROM vacations v LEFT JOIN enseignants e ON v.id_enseignant=e.id ORDER BY v.annee DESC, v.mois DESC");
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }
        return;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO vacations (id_enseignant, mois, annee, montant_brut, retenues, statut) VALUES (?,?,?,?,?,'générée')");
        $stmt->execute([
            $body['id_enseignant'],
            $body['mois'] ?? date('n'),
            $body['annee'] ?? date('Y'),
            $body['montant_brut'] ?? 0,
            $body['retenues'] ?? 0
        ]);
        echo json_encode(['success' => true, 'message' => 'Fiche créée.', 'id' => $pdo->lastInsertId()]);
        return;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
}

function handleVacationAction(string $id, string $action): void {
    $pdo = Database::getInstance()->getPdo();
    $statut = $action === 'valider' ? 'visée_surveill.' : 'générée';
    $stmt = $pdo->prepare('UPDATE vacations SET statut=? WHERE id=?');
    $stmt->execute([$statut, $id]);
    echo json_encode(['success' => true, 'message' => $action === 'valider' ? 'Fiche validée.' : 'Fiche rejetée.']);
}

function handleVacationPDF(string $id): void {
    $pdo = Database::getInstance()->getPdo();
    $stmt = $pdo->prepare("SELECT v.*, CONCAT(e.prenom,' ',e.nom) as enseignant_nom FROM vacations v LEFT JOIN enseignants e ON v.id_enseignant=e.id WHERE v.id=?");
    $stmt->execute([$id]);
    $v = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$v) { http_response_code(404); echo json_encode(['error'=>'Non trouvé']); return; }
    header('Content-Type: text/html; charset=utf-8');
    echo "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Fiche Vacation</title></head><body>";
    echo "<h1>Fiche de Vacation — EduSchedule Pro</h1>";
    echo "<p><strong>Enseignant :</strong> {$v['enseignant_nom']}</p>";
    echo "<p><strong>Mois/Année :</strong> {$v['mois']}/{$v['annee']}</p>";
    echo "<p><strong>Montant brut :</strong> ".number_format($v['montant_brut'],0,',',' ')." FCFA</p>";
    echo "<p><strong>Retenues :</strong> ".number_format($v['retenues'],0,',',' ')." FCFA</p>";
    echo "<p><strong>Montant net :</strong> ".number_format($v['montant_net'],0,',',' ')." FCFA</p>";
    echo "<p><strong>Statut :</strong> {$v['statut']}</p>";
    echo "</body></html>";
}