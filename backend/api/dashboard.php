<?php
require_once __DIR__.'/../config/cors.php';
require_once __DIR__.'/../config/database.php';
require_once __DIR__.'/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$db = getDB();

if ($method === 'GET') {
    $role = $user['role'];
    $data = [];

    if ($role === 'admin' || $role === 'surveillant') {
        $data['seances_aujourd_hui'] = $db->query("SELECT COUNT(*) FROM creneaux c JOIN emploi_temps et ON c.id_emploi_temps=et.id WHERE et.semaine_debut <= CURDATE() AND et.statut_publication='publie'")->fetchColumn();
        $data['pointages_aujourd_hui'] = $db->query("SELECT COUNT(*) FROM pointages WHERE DATE(heure_pointage_reelle)=CURDATE()")->fetchColumn();
        $data['retards'] = $db->query("SELECT COUNT(*) FROM pointages WHERE statut='retard' AND DATE(heure_pointage_reelle)=CURDATE()")->fetchColumn();
        $data['cahiers_non_signes'] = $db->query("SELECT COUNT(*) FROM cahiers_texte WHERE statut='brouillon'")->fetchColumn();
        $data['vacations_en_attente'] = $db->query("SELECT COUNT(*) FROM vacations WHERE statut NOT IN ('approuvee_comptable')")->fetchColumn();
        $data['classes_count'] = $db->query("SELECT COUNT(*) FROM classes")->fetchColumn();
        $data['enseignants_count'] = $db->query("SELECT COUNT(*) FROM enseignants")->fetchColumn();
        $stmt = $db->query("SELECT e.nom, e.prenom, p.statut, p.heure_pointage_reelle, m.libelle AS matiere FROM pointages p JOIN enseignants e ON p.id_enseignant=e.id JOIN creneaux c ON p.id_creneau=c.id JOIN matieres m ON c.id_matiere=m.id WHERE DATE(p.heure_pointage_reelle)=CURDATE() ORDER BY p.heure_pointage_reelle DESC LIMIT 10");
        $data['pointages_recents'] = $stmt->fetchAll();
        $stats = $db->query("SELECT DATE_FORMAT(date_creation,'%Y-%m') AS mois, COUNT(*) AS total FROM cahiers_texte WHERE date_creation >= DATE_SUB(NOW(),INTERVAL 6 MONTH) GROUP BY mois ORDER BY mois");
        $data['evolution_cahiers'] = $stats->fetchAll();
    }

    if ($role === 'enseignant') {
        $ensId = $user['id_lien'];
        $data['mes_seances_semaine'] = $db->prepare("SELECT c.*, m.libelle AS matiere, cl.libelle AS classe, s.libelle AS salle, (SELECT COUNT(*) FROM pointages WHERE id_creneau=c.id) AS pointe FROM creneaux c JOIN emploi_temps et ON c.id_emploi_temps=et.id JOIN matieres m ON c.id_matiere=m.id JOIN classes cl ON et.id_classe=cl.id JOIN salles s ON c.id_salle=s.id WHERE c.id_enseignant=? AND et.semaine_debut=DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) ORDER BY FIELD(c.jour,'lundi','mardi','mercredi','jeudi','vendredi','samedi'),c.heure_debut");
        $data['mes_seances_semaine']->execute([$ensId]);
        $data['mes_seances_semaine'] = $data['mes_seances_semaine']->fetchAll();
        $data['mes_vacations'] = $db->prepare("SELECT * FROM vacations WHERE id_enseignant=? ORDER BY annee DESC,mois DESC LIMIT 5");
        $data['mes_vacations']->execute([$ensId]);
        $data['mes_vacations'] = $data['mes_vacations']->fetchAll();
        $data['total_heures_mois'] = $db->prepare("SELECT COALESCE(SUM(vl.duree_heures),0) FROM vacation_lignes vl JOIN vacations v ON vl.id_vacation=v.id WHERE v.id_enseignant=? AND v.mois=MONTH(NOW()) AND v.annee=YEAR(NOW())");
        $data['total_heures_mois']->execute([$ensId]);
        $data['total_heures_mois'] = $data['total_heures_mois']->fetchColumn();
    }

    if ($role === 'delegue') {
        $classeId = $user['id_classe'];
        $data['emploi_temps'] = $db->prepare("SELECT et.*, cl.libelle AS classe FROM emploi_temps et JOIN classes cl ON et.id_classe=cl.id WHERE et.id_classe=? AND et.statut_publication='publie' ORDER BY et.semaine_debut DESC LIMIT 1");
        $data['emploi_temps']->execute([$classeId]);
        $data['emploi_temps'] = $data['emploi_temps']->fetch();
        $data['cahiers_a_remplir'] = $db->prepare("SELECT COUNT(*) FROM creneaux c JOIN emploi_temps et ON c.id_emploi_temps=et.id LEFT JOIN cahiers_texte ct ON ct.id_creneau=c.id WHERE et.id_classe=? AND (ct.id IS NULL OR ct.statut='brouillon') AND et.semaine_debut=DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)");
        $data['cahiers_a_remplir']->execute([$classeId]);
        $data['cahiers_a_remplir'] = $data['cahiers_a_remplir']->fetchColumn();
        $data['cahiers_recents'] = $db->prepare("SELECT ct.*, m.libelle AS matiere FROM cahiers_texte ct JOIN creneaux cr ON ct.id_creneau=cr.id JOIN emploi_temps et ON cr.id_emploi_temps=et.id JOIN matieres m ON cr.id_matiere=m.id WHERE et.id_classe=? ORDER BY ct.date_creation DESC LIMIT 8");
        $data['cahiers_recents']->execute([$classeId]);
        $data['cahiers_recents'] = $data['cahiers_recents']->fetchAll();
    }

    respond($data);
}

respond(['error'=>'Méthode non supportée'],405);
