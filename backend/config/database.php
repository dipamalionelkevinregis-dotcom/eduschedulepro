<?php
// ============================================================
//  EduSchedule Pro — Connexion Base de Données
//  backend/config/database.php
// ============================================================

class Database {
    private static $instance = null;
    private $pdo;

    private string $host     = 'localhost';
    private string $dbname   = 'eduschedulepro';
    private string $user     = 'root';
    private string $password = '';
    private string $charset  = 'utf8mb4';

    private function __construct() {
        $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset={$this->charset}";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $this->pdo = new PDO($dsn, $this->user, $this->password, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur de connexion à la base de données.']);
            exit;
        }
    }

    // Singleton : une seule connexion partagée
    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getPdo(): PDO {
        return $this->pdo;
    }
}