<?php
// ============================================================
//  EduSchedule Pro — Middleware Authentification & Rôles
//  backend/middleware/auth.php
// ============================================================

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../utils/JWT.php';

class AuthMiddleware {

    // ----------------------------------------------------------
    // Vérifier que la requête contient un token valide
    // Retourne le payload du token
    // ----------------------------------------------------------
    public static function requireAuth(): array {
        $token = JWT::getFromHeader();

        if (!$token) {
            self::unauthorized('Token manquant. Veuillez vous connecter.');
        }

        try {
            $payload = JWT::verify($token);
        } catch (Exception $e) {
            self::unauthorized($e->getMessage());
        }

        return $payload;
    }

    // ----------------------------------------------------------
    // Vérifier le rôle de l'utilisateur connecté
    // $roles : tableau des rôles autorisés
    // ex: AuthMiddleware::requireRole(['admin', 'surveillant'])
    // ----------------------------------------------------------
    public static function requireRole(array $roles): array {
        $payload = self::requireAuth();

        if (!in_array($payload['role'], $roles, true)) {
            self::forbidden("Accès refusé. Rôle requis : " . implode(' ou ', $roles));
        }

        return $payload;
    }

    // ----------------------------------------------------------
    // Réponses d'erreur standardisées
    // ----------------------------------------------------------
    private static function unauthorized(string $message): void {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error'   => $message
        ]);
        exit;
    }

    private static function forbidden(string $message): void {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error'   => $message
        ]);
        exit;
    }
}