<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

function handleEmploiTemps(string $method, ?string $id, ?string $action): void {
    $pdo = Database::getInstance()->getPdo();

    // Actions spéciales
    if ($id && $action) {
        if ($action === 'publier') {
            $pdo->prepare("UPDATE emploi_temps SET statut_publication='publié' WHERE id=?")->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Publié.']); return;
        }
        if ($action === 'depublier') {
            $pdo->prepare("UPDATE emploi_temps SET statut_publication='brouillon' WHERE id=?")->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Dépublié.']); return;
        }
        if ($action === 'dupliquer') {
            $stmt = $pdo->prepare('SELECT * FROM emploi_temps WHERE id=?');
            $stmt->execute([$id]);
            $et = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($et) {
                $stmt2 = $pdo->prepare("INSERT INTO emploi_temps (id_classe, semaine_debut, statut_publication, cree_par) VALUES (?, DATE_ADD(?, INTERVAL 7 DAY), 'brouillon', ?)");
                $stmt2->execute([$et['id_classe'], $et['semaine_debut'], $et['cree_par']]);
                echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            }
            return;
        }
    }

    if ($method === 'GET') {
        if ($id) {
            $stmt = $pdo->prepare('SELECT et.*, c.libelle as classe_nom FROM emploi_temps et LEFT JOIN classes c ON et.id_classe=c.id WHERE et.id=?');
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'data' => $stmt->fetch(PDO::FETCH_ASSOC)]);
        } else {
            $where = ''; $params = [];
            if (!empty($_GET['id_classe'])) {
                $where = 'WHERE et.id_classe=?';
                $params[] = $_GET['id_classe'];
            }
            $stmt = $pdo->prepare("
                SELECT et.*, c.libelle as classe_nom,
                       et.semaine_debut as semaine_debut,
                       et.semaine_debut as semaine_fin,
                       et.statut_publication as statut
                FROM emploi_temps et
                LEFT JOIN classes c ON et.id_classe=c.id
                $where
                ORDER BY et.semaine_debut DESC
            ");
            $stmt->execute($params);
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }
        return;
    }

    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO emploi_temps (id_classe, semaine_debut, statut_publication, cree_par) VALUES (?, ?, 'brouillon', 1)");
        $stmt->execute([$body['id_classe'], $body['semaine_debut'] ?? date('Y-m-d')]);
        echo json_encode(['success' => true, 'message' => 'Emploi du temps créé.', 'id' => $pdo->lastInsertId()]);
        return;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
}