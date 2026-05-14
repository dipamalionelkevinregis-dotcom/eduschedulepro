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
if ($method === 'GET' && !$id) {
    $where = '1=1'; $params = [];
    if ($c = $_GET['id_creneau'] ?? '') { $where .= ' AND ct.id_creneau=?'; $params[]=$c; }
    if ($cl = $_GET['id_classe'] ?? '') { $where .= ' AND et.id_classe=?'; $params[]=$cl; }
    if ($m = $_GET['mois'] ?? '') {
        $where .= ' AND MONTH(ct.date_creation)=? AND YEAR(ct.date_creation)=?';
        $params[] = $m; $params[] = $_GET['annee'] ?? date('Y');
    }
    $sql = "SELECT ct.*, cr.jour, cr.heure_debut, cr.heure_fin, m.libelle AS matiere,
            cl.libelle AS classe, e.nom AS ens_nom, e.prenom AS ens_prenom,
            u.nom_complet AS delegue_nom
            FROM cahiers_texte ct
            JOIN creneaux cr ON ct.id_creneau=cr.id
            JOIN emploi_temps et ON cr.id_emploi_temps=et.id
            JOIN matieres m ON cr.id_matiere=m.id
            JOIN classes cl ON et.id_classe=cl.id
            JOIN enseignants e ON cr.id_enseignant=e.id
            JOIN utilisateurs u ON ct.id_delegue=u.id
            WHERE $where ORDER BY ct.date_creation DESC";
    $rows = $db->prepare($sql); $rows->execute($params);
    respond($rows->fetchAll());
}

// GET single avec signatures et travaux
if ($method === 'GET' && $id && !$action) {
    $stmt = $db->prepare("SELECT ct.*, cr.jour, cr.heure_debut, cr.heure_fin, m.libelle AS matiere,
        cl.libelle AS classe, e.nom AS ens_nom, e.prenom AS ens_prenom,
        u.nom_complet AS delegue_nom
        FROM cahiers_texte ct JOIN creneaux cr ON ct.id_creneau=cr.id
        JOIN emploi_temps et ON cr.id_emploi_temps=et.id
        JOIN matieres m ON cr.id_matiere=m.id JOIN classes cl ON et.id_classe=cl.id
        JOIN enseignants e ON cr.id_enseignant=e.id JOIN utilisateurs u ON ct.id_delegue=u.id
        WHERE ct.id=?");
    $stmt->execute([$id]); $ct = $stmt->fetch();
    if (!$ct) respond(['error'=>'Non trouvé'],404);
    $ct['contenu_json'] = json_decode($ct['contenu_json'] ?? '[]', true);
    $sigs = $db->prepare("SELECT s.*, u.nom_complet FROM signatures s JOIN utilisateurs u ON s.id_utilisateur=u.id WHERE s.id_cahier=?");
    $sigs->execute([$id]); $ct['signatures'] = $sigs->fetchAll();
    $trav = $db->prepare("SELECT * FROM travaux_demandes WHERE id_cahier=? ORDER BY date_limite");
    $trav->execute([$id]); $ct['travaux'] = $trav->fetchAll();
    respond($ct);
}

// POST créer
if ($method === 'POST' && !$action) {
    requireAuth(['delegue']);
    $b = jsonBody();
    if (!($b['id_creneau']??0)) respond(['error'=>'id_creneau requis'],400);
    $db->prepare("INSERT INTO cahiers_texte (id_creneau,id_delegue,titre_cours,contenu_json,niveau_avancement,observations,statut) VALUES (?,?,?,?,?,?,'brouillon')")
       ->execute([$b['id_creneau'],$user['id'],$b['titre_cours']??'',json_encode($b['contenu_json']??[]),$b['niveau_avancement']??'',$b['observations']??'']);
    $cahierId = $db->lastInsertId();
    if (!empty($b['travaux'])) {
        foreach ($b['travaux'] as $t) {
            $db->prepare("INSERT INTO travaux_demandes (id_cahier,description,date_limite,type) VALUES (?,?,?,?)")
               ->execute([$cahierId,$t['description'],$t['date_limite']??null,$t['type']??'devoir']);
        }
    }
    respond(['id'=>$cahierId,'message'=>'Cahier créé'],201);
}

// PUT modifier
if ($method === 'PUT' && $id && !$action) {
    requireAuth(['delegue']);
    $b = jsonBody();
    $ct = $db->prepare("SELECT statut FROM cahiers_texte WHERE id=?")->execute([$id]);
    $ct = $db->query("SELECT statut FROM cahiers_texte WHERE id=$id")->fetch();
    if ($ct && $ct['statut'] === 'cloture') respond(['error'=>'Cahier clôturé, non modifiable'],403);
    $db->prepare("UPDATE cahiers_texte SET titre_cours=?,contenu_json=?,niveau_avancement=?,observations=? WHERE id=?")
       ->execute([$b['titre_cours']??'',$b['contenu_json']??'[]',$b['niveau_avancement']??'',$b['observations']??'',$id]);
    respond(['message'=>'Cahier mis à jour']);
}

// POST signer
if ($method === 'POST' && $id && $action === 'signer') {
    requireAuth(['delegue','enseignant']);
    $b = jsonBody();
    if (!($b['signature_base64']??'')) respond(['error'=>'Signature requise'],400);
    $type = $user['role'] === 'delegue' ? 'delegue' : 'enseignant';
    $db->prepare("INSERT INTO signatures (id_cahier,type_signataire,id_utilisateur,signature_base64) VALUES (?,?,?,?)")
       ->execute([$id,$type,$user['id'],$b['signature_base64']]);
    if ($type === 'delegue') $db->prepare("UPDATE cahiers_texte SET statut='signe_delegue' WHERE id=?")->execute([$id]);
    respond(['message'=>'Signature apposée']);
}

// POST clôturer
if ($method === 'POST' && $id && $action === 'cloture') {
    requireAuth(['enseignant']);
    $b = jsonBody();
    $db->prepare("UPDATE cahiers_texte SET heure_fin_reelle=?,statut='cloture',date_cloture=NOW() WHERE id=?")->execute([$b['heure_fin']??date('H:i:s'),$id]);
    if (!empty($b['signature_base64'])) {
        $db->prepare("INSERT INTO signatures (id_cahier,type_signataire,id_utilisateur,signature_base64) VALUES (?,'enseignant',?,?)")
           ->execute([$id,$user['id'],$b['signature_base64']]);
    }
    respond(['message'=>'Séance clôturée']);
}

respond(['error'=>'Route inconnue'],404);
