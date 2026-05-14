<?php
// backend/config/helpers.php
function logActivity(PDO $db, ?int $userId, string $action, array $details = []): void {
    try {
        $stmt = $db->prepare("INSERT INTO logs_activite (id_utilisateur, action, details_json, ip, date_heure) VALUES (?, ?, ?, ?, NOW())");
        $stmt->execute([$userId, $action, $details ? json_encode($details) : null, $_SERVER['REMOTE_ADDR'] ?? null]);
    } catch (Exception $e) { /* silencieux */ }
}

function validateRequired(array $data, array $keys): void {
    foreach ($keys as $k) {
        if (!isset($data[$k]) || $data[$k] === '') {
            http_response_code(400);
            echo json_encode(['error' => "Champ requis : $k"]);
            exit;
        }
    }
}
