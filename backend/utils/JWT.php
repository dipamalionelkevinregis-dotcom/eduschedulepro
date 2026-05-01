<?php
// ============================================================
//  EduSchedule Pro — Gestion JWT (sans bibliothèque externe)
//  backend/utils/JWT.php
// ============================================================

class JWT {

    // ----------------------------------------------------------
    // Générer un token JWT
    // ----------------------------------------------------------
    public static function generate(array $payload): string {
        // Header
        $header = self::base64url_encode(json_encode([
            'alg' => 'HS256',
            'typ' => 'JWT'
        ]));

        // Payload — on ajoute l'expiration automatiquement
        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRATION;

        $payload_encoded = self::base64url_encode(json_encode($payload));

        // Signature HMAC-SHA256
        $signature = hash_hmac(
            'sha256',
            "$header.$payload_encoded",
            JWT_SECRET,
            true
        );
        $signature_encoded = self::base64url_encode($signature);

        return "$header.$payload_encoded.$signature_encoded";
    }

    // ----------------------------------------------------------
    // Vérifier et décoder un token JWT
    // Retourne le payload ou lève une exception
    // ----------------------------------------------------------
    public static function verify(string $token): array {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            throw new Exception('Token JWT malformé.', 401);
        }

        [$header, $payload_encoded, $signature_encoded] = $parts;

        // Recalculer la signature attendue
        $expected_sig = self::base64url_encode(
            hash_hmac('sha256', "$header.$payload_encoded", JWT_SECRET, true)
        );

        // Comparaison sécurisée (résistante aux timing attacks)
        if (!hash_equals($expected_sig, $signature_encoded)) {
            throw new Exception('Signature JWT invalide.', 401);
        }

        // Décoder le payload
        $payload = json_decode(self::base64url_decode($payload_encoded), true);

        if (!$payload) {
            throw new Exception('Payload JWT illisible.', 401);
        }

        // Vérifier l'expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new Exception('Token JWT expiré.', 401);
        }

        return $payload;
    }

    // ----------------------------------------------------------
    // Extraire le token depuis le header Authorization
    // ----------------------------------------------------------
    public static function getFromHeader(): ?string {
        $headers = getallheaders();
        $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (preg_match('/Bearer\s+(.+)$/i', $auth, $matches)) {
            return $matches[1];
        }
        return null;
    }

    // ----------------------------------------------------------
    // Encodage base64 URL-safe
    // ----------------------------------------------------------
    private static function base64url_encode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64url_decode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}