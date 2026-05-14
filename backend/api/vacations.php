<?php
require_once __DIR__.'/../config/cors.php';
require_once __DIR__.'/../config/database.php';
require_once __DIR__.'/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$user = requireAuth();
$db = getDB();
$id = (int)($_GET['id'] ?? 0);
$action = $_GET['action'] ?? '';

// GET liste
if ($method === 'GET' && !$id && !$action) {
    $where = '1=1'; $params = [];
    if ($e = $_GET['id_enseignant'] ?? '') { $where .= ' AND v.id_enseignant=?'; $params[]=$e; }
    if ($m = $_GET['mois'] ?? '') { $where .= ' AND v.mois=?'; $params[]=$m; }
    if ($a = $_GET['annee'] ?? '') { $where .= ' AND v.annee=?'; $params[]=$a; }
    // Enseignant ne voit que ses propres fiches
    if ($user['role'] === 'enseignant') { $where .= ' AND v.id_enseignant=?'; $params[]=$user['id_lien']; }
    $sql = "SELECT v.*, e.nom, e.prenom, e.matricule, e.taux_horaire
            FROM vacations v JOIN enseignants e ON v.id_enseignant=e.id
            WHERE $where ORDER BY v.annee DESC, v.mois DESC";
    $rows = $db->prepare($sql); $rows->execute($params);
    respond($rows->fetchAll());
}

// GET détail
if ($method === 'GET' && $id && !$action) {
    $stmt = $db->prepare("SELECT v.*, e.nom, e.prenom, e.matricule, e.taux_horaire FROM vacations v JOIN enseignants e ON v.id_enseignant=e.id WHERE v.id=?");
    $stmt->execute([$id]); $v = $stmt->fetch();
    if (!$v) respond(['error'=>'Non trouvé'],404);
    $lignes = $db->prepare("SELECT vl.*, cr.jour, cr.heure_debut, cr.heure_fin, m.libelle AS matiere, cl.libelle AS classe, et.semaine_debut FROM vacation_lignes vl JOIN creneaux cr ON vl.id_creneau=cr.id JOIN emploi_temps et ON cr.id_emploi_temps=et.id JOIN matieres m ON cr.id_matiere=m.id JOIN classes cl ON et.id_classe=cl.id WHERE vl.id_vacation=?");
    $lignes->execute([$id]); $v['lignes'] = $lignes->fetchAll();
    $vals = $db->prepare("SELECT va.*, u.nom_complet FROM validations va JOIN utilisateurs u ON va.id_validateur=u.id WHERE va.id_vacation=? ORDER BY va.date_validation");
    $vals->execute([$id]); $v['validations'] = $vals->fetchAll();
    respond($v);
}

// POST générer
if ($method === 'POST' && $action === 'generer') {
    requireAuth(['admin','surveillant','comptable']);
    $b = jsonBody();
    $ensId = (int)($b['id_enseignant']??0);
    $mois = (int)($b['mois']??date('n'));
    $annee = (int)($b['annee']??date('Y'));
    if (!$ensId) respond(['error'=>'id_enseignant requis'],400);

    // Vérifier doublon
    $check = $db->prepare("SELECT id FROM vacations WHERE id_enseignant=? AND mois=? AND annee=?");
    $check->execute([$ensId,$mois,$annee]);
    if ($check->fetch()) respond(['error'=>'Fiche déjà générée pour ce mois'],409);

    // Récupérer les séances clôturées du mois
    $seances = $db->prepare("SELECT ct.id AS ct_id, ct.heure_fin_reelle, cr.id AS cr_id, cr.heure_debut, cr.heure_fin, e.taux_horaire, m.libelle AS matiere, cl.libelle AS classe, et.semaine_debut FROM cahiers_texte ct JOIN creneaux cr ON ct.id_creneau=cr.id JOIN emploi_temps et ON cr.id_emploi_temps=et.id JOIN matieres m ON cr.id_matiere=m.id JOIN classes cl ON et.id_classe=cl.id JOIN enseignants e ON cr.id_enseignant=e.id WHERE cr.id_enseignant=? AND ct.statut='cloture' AND MONTH(ct.date_creation)=? AND YEAR(ct.date_creation)=?");
    $seances->execute([$ensId,$mois,$annee]);
    $seancesList = $seances->fetchAll();

    if (empty($seancesList)) respond(['error'=>'Aucune séance clôturée trouvée pour ce mois'],400);

    $totalBrut = 0;
    $lignes = [];
    foreach ($seancesList as $s) {
        $heureDebut = strtotime($s['heure_debut']);
        $heureFin = $s['heure_fin_reelle'] ? strtotime($s['heure_fin_reelle']) : strtotime($s['heure_fin']);
        $duree = round(($heureFin - $heureDebut) / 3600, 2);
        $montant = $duree * $s['taux_horaire'];
        $totalBrut += $montant;
        $lignes[] = ['id_creneau'=>$s['cr_id'],'duree'=>$duree,'taux'=>$s['taux_horaire'],'montant'=>$montant];
    }

    $db->beginTransaction();
    $db->prepare("INSERT INTO vacations (id_enseignant,mois,annee,montant_brut,montant_net,statut) VALUES (?,?,?,?,?,'generee')")
       ->execute([$ensId,$mois,$annee,$totalBrut,$totalBrut]);
    $vacId = $db->lastInsertId();
    foreach ($lignes as $l) {
        $db->prepare("INSERT INTO vacation_lignes (id_vacation,id_creneau,duree_heures,taux,montant) VALUES (?,?,?,?,?)")
           ->execute([$vacId,$l['id_creneau'],$l['duree'],$l['taux'],$l['montant']]);
    }
    $db->commit();
    respond(['id'=>$vacId,'montant_brut'=>$totalBrut,'message'=>'Fiche générée'],201);
}

// POST valider (surveillant)
if ($method === 'POST' && $id && $action === 'valider') {
    requireAuth(['surveillant']);
    $b = jsonBody();
    $db->prepare("INSERT INTO validations (id_vacation,id_validateur,role_validateur,visa_base64,commentaire) VALUES (?,?,'surveillant',?,?)")
       ->execute([$id,$user['id'],$b['visa_base64']??'',$b['commentaire']??'']);
    $db->prepare("UPDATE vacations SET statut='visee_surveillant' WHERE id=?")->execute([$id]);
    respond(['message'=>'Visa apposé']);
}

// POST approuver (comptable)
if ($method === 'POST' && $id && $action === 'approuver') {
    requireAuth(['comptable']);
    $b = jsonBody();
    $db->prepare("INSERT INTO validations (id_vacation,id_validateur,role_validateur,commentaire) VALUES (?,?,'comptable',?)")
       ->execute([$id,$user['id'],$b['commentaire']??'']);
    $db->prepare("UPDATE vacations SET statut='approuvee_comptable' WHERE id=?")->execute([$id]);
    respond(['message'=>'Fiche approuvée']);
}

// POST signer enseignant
if ($method === 'POST' && $id && $action === 'signer') {
    requireAuth(['enseignant']);
    $b = jsonBody();
    $db->prepare("INSERT INTO validations (id_vacation,id_validateur,role_validateur,visa_base64) VALUES (?,?,'enseignant',?)")
       ->execute([$id,$user['id'],$b['visa_base64']??'']);
    $db->prepare("UPDATE vacations SET statut='signee_enseignant' WHERE id=?")->execute([$id]);
    respond(['message'=>'Fiche signée']);
}

// GET PDF (retourne JSON des données — le frontend génère le PDF)
if ($method === 'GET' && $id && $action === 'pdf') {
    $stmt = $db->prepare("SELECT v.*, e.nom, e.prenom, e.matricule, e.taux_horaire FROM vacations v JOIN enseignants e ON v.id_enseignant=e.id WHERE v.id=?");
    $stmt->execute([$id]); $v = $stmt->fetch();
    $lignes = $db->prepare("SELECT vl.*, cr.jour, cr.heure_debut, cr.heure_fin, m.libelle AS matiere, cl.libelle AS classe FROM vacation_lignes vl JOIN creneaux cr ON vl.id_creneau=cr.id JOIN emploi_temps et ON cr.id_emploi_temps=et.id JOIN matieres m ON cr.id_matiere=m.id JOIN classes cl ON et.id_classe=cl.id WHERE vl.id_vacation=?");
    $lignes->execute([$id]); $v['lignes'] = $lignes->fetchAll();
    respond($v);
}

respond(['error'=>'Route inconnue'],404);
