<?php
// ============================================================
//  EduSchedule Pro — Réponses API standardisées
//  backend/utils/Response.php
// ============================================================

class Response {

    // Succès avec données
    public static function success(mixed $data = null, string $message = '', int $code = 200): void {
        http_response_code($code);
        $response = ['success' => true];
        if ($message)            $response['message'] = $message;
        if ($data !== null)      $response['data']    = $data;
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Erreur client (4xx)
    public static function error(string $message, int $code = 400, array $details = []): void {
        http_response_code($code);
        $response = ['success' => false, 'error' => $message];
        if (!empty($details)) $response['details'] = $details;
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Ressource créée
    public static function created(mixed $data = null, string $message = 'Créé avec succès.'): void {
        self::success($data, $message, 201);
    }

    // 404 Not Found
    public static function notFound(string $message = 'Ressource introuvable.'): void {
        self::error($message, 404);
    }

    // 401 Non autorisé
    public static function unauthorized(string $message = 'Non autorisé.'): void {
        self::error($message, 401);
    }

    // 403 Interdit
    public static function forbidden(string $message = 'Accès interdit.'): void {
        self::error($message, 403);
    }

    // 500 Erreur serveur
    public static function serverError(string $message = 'Erreur serveur interne.'): void {
        self::error($message, 500);
    }
}