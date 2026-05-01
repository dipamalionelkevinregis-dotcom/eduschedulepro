<?php
// ============================================================
//  EduSchedule Pro — Générateur & Validateur de QR-Codes
//  backend/utils/QRCodeManager.php
// ============================================================

class QRCodeManager {

    // ----------------------------------------------------------
    // Générer un token QR sécurisé pour un créneau
    // Contient : id_creneau + horodatage + hash HMAC
    // ----------------------------------------------------------
    public static function generateToken(int $idCreneau): string {
        $timestamp = time();
        $data      = $idCreneau . '|' . $timestamp;
        $signature = hash_hmac('sha256', $data, QR_SECRET_KEY);

        // Token final : base64url(id|timestamp|signature)
        $raw   = $idCreneau . '|' . $timestamp . '|' . $signature;
        $token = base64_encode($raw);
        $token = rtrim(strtr($token, '+/', '-_'), '='); // URL-safe

        return $token;
    }

    // ----------------------------------------------------------
    // Valider un token QR
    // Retourne l'id_creneau si valide, lève une exception sinon
    // ----------------------------------------------------------
    public static function validateToken(string $token): int {
        // Décoder le token
        $raw  = base64_decode(strtr($token, '-_', '+/'));
        $parts = explode('|', $raw);

        if (count($parts) !== 3) {
            throw new Exception('QR-Code invalide ou corrompu.', 400);
        }

        [$idCreneau, $timestamp, $signature] = $parts;
        $idCreneau = (int) $idCreneau;

        // Vérifier la signature HMAC
        $data             = $idCreneau . '|' . $timestamp;
        $expectedSig      = hash_hmac('sha256', $data, QR_SECRET_KEY);

        if (!hash_equals($expectedSig, $signature)) {
            throw new Exception('QR-Code falsifié — signature invalide.', 401);
        }

        // Vérifier la fenêtre horaire (± QR_WINDOW_MINUTES)
        $now        = time();
        $windowSecs = QR_WINDOW_MINUTES * 60;

        if (abs($now - (int)$timestamp) > $windowSecs) {
            throw new Exception('QR-Code expiré. La fenêtre de ' . QR_WINDOW_MINUTES . ' minutes est dépassée.', 410);
        }

        return $idCreneau;
    }

    // ----------------------------------------------------------
    // Générer l'image QR-Code en PNG (base64) sans bibliothèque
    // On utilise une API externe en fallback, ou Google Charts
    // Pour la prod : installer chillerlan/php-qrcode via Composer
    // ----------------------------------------------------------
    public static function generateImageUrl(string $token): string {
        // URL de scan que l'enseignant va scanner
        $scanUrl = BACKEND_URL . '/api/pointages/scan?token=' . urlencode($token);

        // Génération via Google Charts (simple, fonctionne sans Composer)
        $qrUrl = 'https://chart.googleapis.com/chart?'
               . 'cht=qr'
               . '&chs=300x300'
               . '&chl=' . urlencode($scanUrl)
               . '&choe=UTF-8';

        return $qrUrl;
    }

    // ----------------------------------------------------------
    // Calculer la date d'expiration du QR
    // ----------------------------------------------------------
    public static function getExpireDateTime(string $heureDebut, string $dateSeance): string {
        // Expiration = heure de début + fenêtre horaire
        $dateTime = new DateTime($dateSeance . ' ' . $heureDebut);
        $dateTime->modify('+' . QR_WINDOW_MINUTES . ' minutes');
        return $dateTime->format('Y-m-d H:i:s');
    }
}