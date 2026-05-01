<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

function handleDashboard(): void {
    $pdo = Database::getInstance()->getPdo();
    try {
        $stats = [];
        $stats['total_classes']     = $pdo->query('SELECT COUNT(*) FROM classes')->fetchColumn();
        $stats['total_enseignants'] = $pdo->query('SELECT COUNT(*) FROM enseignants WHERE actif=1')->fetchColumn();
        $stats['total_matieres']    = $pdo->query('SELECT COUNT(*) FROM matieres')->fetchColumn();
        $stats['total_etudiants']   = $pdo->query('SELECT COALESCE(SUM(effectif),0) FROM classes')->fetchColumn();
        $stats['creneaux_semaine']  = $pdo->query('SELECT COUNT(*) FROM creneaux')->fetchColumn();
        $stats['pointages_jour']    = $pdo->query("SELECT COUNT(*) FROM pointages WHERE DATE(created_at)=CURDATE()")->fetchColumn();
        $stats['alertes']           = [];
        try {
            $stmt = $pdo->query('SELECT action, created_at FROM logs_activite ORDER BY created_at DESC LIMIT 6');
            $stats['activite_recente'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            $stats['activite_recente'] = [];
        }
        echo json_encode(['success' => true, 'data' => $stats]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}