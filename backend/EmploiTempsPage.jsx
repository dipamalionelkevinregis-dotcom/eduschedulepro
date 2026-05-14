import { useState, useEffect, useCallback } from 'react';
import { api, JOURS } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';

const COLORS = ['#6366f1','#0891b2','#16a34a','#d97706','#dc2626','#7c3aed','#ea580c','#0f766e'];

function getMondayOf(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().slice(0, 10);
}

export default function EmploiTempsPage() {
  const { user } = useAuth();
  const { success, error } = useNotif();

  const [emplois, setEmplois]         = useState([]);
  const [classes, setClasses]         = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [matieres, setMatieres]       = useState([]);
  const [salles, setSalles]           = useState([]);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [currentET, setCurrentET]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [publishing, setPublishing]   = useState(false);
  const [formData, setFormData]       = useState({ id_classe:'', semaine_debut: getMondayOf(), creneaux:[] });
  const [newCreneau, setNewCreneau]   = useState({ jour:'lundi', heure_debut:'08:00', heure_fin:'10:00', id_matiere:'', id_enseignant:'', id_salle:'' });

  // Charger référentiels
  useEffect(() => {
    Promise.all([
      api.get('/classes'),
      api.get('/enseignants'),
      api.get('/matieres'),
      api.get('/salles'),
    ]).then(([cl, en, ma, sa]) => {
      setClasses(cl); setEnseignants(en); setMatieres(ma); setSalles(sa);
    }).catch(e => error(e.message));
  }, []);

  // Charger emplois du temps
  const loadEmplois = useCallback(async (classeId) => {
    setLoading(true);
    try {
      let url = '/emploi-temps';
      const params = [];
      if (classeId)         params.push('id_classe=' + classeId);
      if (user.role === 'delegue' && user.id_classe) params.push('id_classe=' + user.id_classe);
      if (params.length)    url += '?' + params.join('&');
      const d = await api.get(url);
      setEmplois(d);
      setCurrentET(prev => {
        if (prev) {
          const updated = d.find(e => e.id === prev.id);
          return updated || d[0] || null;
        }
        return d[0] || null;
      });
    } catch(e) { error(e.message); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { loadEmplois(selectedClasse); }, [selectedClasse, loadEmplois]);

  // Publier
  const publier = async (id) => {
    setPublishing(true);
    try {
      await api.put('/emploi-temps?id=' + id + '&action=publier', {});
      success('Emploi du temps publié et QR générés !');
      await loadEmplois(selectedClasse);
    } catch(e) { error(e.message); }
    finally { setPublishing(false); }
  };

  // Ajouter créneau au formulaire
  const addCreneau = () => {
    if (!newCreneau.id_matiere || !newCreneau.id_enseignant || !newCreneau.id_salle) {
      error('Matière, enseignant et salle sont requis'); return;
    }
    setFormData(prev => ({ ...prev, creneaux: [...prev.creneaux, { ...newCreneau }] }));
    setNewCreneau(prev => ({ ...prev, id_matiere:'', id_enseignant:'', id_salle:'' }));
  };

  // Créer emploi du temps
  const createEmploiTemps = async () => {
    if (!formData.id_classe) { error('Veuillez choisir une classe'); return; }
    if (!formData.semaine_debut) { error('Veuillez choisir une semaine'); return; }
    try {
      const payload = {
        id_classe:     parseInt(formData.id_classe),
        semaine_debut: formData.semaine_debut,
        creneaux:      formData.creneaux,
      };
      await api.post('/emploi-temps', payload);
      success('Emploi du temps créé avec succès !');
      setShowForm(false);
      setFormData({ id_classe:'', semaine_debut: getMondayOf(), creneaux:[] });
      // Recharger SANS filtre de semaine pour voir le nouvel ET
      setSelectedClasse(formData.id_classe);
      await loadEmplois(formData.id_classe);
    } catch(e) { error(e.message); }
  };

  const matColor = (id) => COLORS[(parseInt(id) - 1) % COLORS.length];

  const HOURS = ['07:00','08:00','09:00','10:00','10:30','11:00','12:00',
                 '13:00','14:00','15:00','16:00','17:00','18:00'];

  const inp  = { width:'100%', padding:'8px 10px', borderRadius:'6px', border:'1px solid #e2e8f0', fontSize:'0.82rem', boxSizing:'border-box' };
  const lbl  = { display:'block', fontSize:'0.78rem', fontWeight:600, marginBottom:'3px', color:'#374151' };

  const renderGrille = (et) => {
    if (!et || !et.creneaux || et.creneaux.length === 0) {
      return <p style={{ color:'#94a3b8', textAlign:'center', padding:20 }}>Aucun créneau dans cet emploi du temps.</p>;
    }
    return (
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700, fontSize:'0.78rem' }}>
          <thead>
            <tr>
              <th style={{ padding:'8px 6px', background:'#f8fafc', border:'1px solid #e2e8f0', width:70, textAlign:'center' }}>Heure</th>
              {JOURS.map(j => (
                <th key={j} style={{ padding:'8px 6px', background:'#f8fafc', border:'1px solid #e2e8f0', textTransform:'capitalize', fontWeight:700, textAlign:'center' }}>{j}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(h => (
              <tr key={h}>
                <td style={{ padding:'6px', border:'1px solid #f1f5f9', textAlign:'center', color:'#64748b', fontWeight:600, background:'#f8fafc', whiteSpace:'nowrap' }}>{h}</td>
                {JOURS.map(j => {
                  const cr = et.creneaux.find(c => c.jour === j && c.heure_debut?.slice(0,5) === h);
                  return (
                    <td key={j} style={{ padding:4, border:'1px solid #f1f5f9', verticalAlign:'top', height:50 }}>
                      {cr && (
                        <div style={{ background: matColor(cr.id_matiere), borderRadius:6, padding:'5px 7px', color:'#fff', fontSize:'0.7rem', height:'100%', boxSizing:'border-box' }}>
                          <div style={{ fontWeight:700, marginBottom:1 }}>{cr.mat_code || cr.matiere}</div>
                          <div style={{ opacity:0.9 }}>{cr.prenom} {cr.nom}</div>
                          <div style={{ opacity:0.8 }}>{cr.salle_code} {cr.heure_debut?.slice(0,5)}-{cr.heure_fin?.slice(0,5)}</div>
                          {cr.qr_token && <div style={{ marginTop:2, fontSize:'0.62rem', background:'rgba(255,255,255,0.25)', borderRadius:3, padding:'1px 4px' }}>📱 QR</div>}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:'1.4rem', fontWeight:800, color:'#0f172a' }}>📅 Emplois du Temps</h1>
        {user.role === 'admin' && (
          <button onClick={() => setShowForm(!showForm)}
            style={{ background: showForm ? '#64748b' : '#1d4ed8', color:'#fff', border:'none', borderRadius:8, padding:'9px 18px', fontWeight:600, cursor:'pointer', fontSize:'0.85rem' }}>
            {showForm ? '✕ Fermer' : '+ Nouveau'}
          </button>
        )}
      </div>

      {/* Filtre classe */}
      <div style={{ display:'flex', gap:12, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        {user.role === 'admin' && (
          <select value={selectedClasse} onChange={e => setSelectedClasse(e.target.value)}
            style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.85rem' }}>
            <option value="">Toutes les classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.code} — {c.libelle}</option>)}
          </select>
        )}
        {/* Onglets emplois */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {emplois.map(et => (
            <button key={et.id} onClick={() => setCurrentET(et)} style={{
              padding:'7px 14px', borderRadius:8, border:'2px solid', cursor:'pointer', fontSize:'0.8rem', fontWeight:600,
              background: currentET?.id === et.id ? '#1d4ed8' : '#fff',
              color:      currentET?.id === et.id ? '#fff' : '#1d4ed8',
              borderColor: currentET?.id === et.id ? '#1d4ed8' : '#e2e8f0',
            }}>
              {et.classe_code} — S.{et.semaine_debut?.slice(5,10)} {et.statut_publication === 'publie' ? '✅' : '📝'}
            </button>
          ))}
        </div>
      </div>

      {/* Formulaire création */}
      {showForm && user.role === 'admin' && (
        <div style={{ background:'#fff', borderRadius:12, padding:20, marginBottom:20, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', border:'2px solid #dbeafe' }}>
          <h3 style={{ margin:'0 0 16px', fontSize:'1rem', fontWeight:700, color:'#1d4ed8' }}>Créer un emploi du temps</h3>

          {/* Classe + Semaine */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            <div>
              <label style={lbl}>Classe *</label>
              <select value={formData.id_classe}
                onChange={e => setFormData(prev => Object.assign({}, prev, { id_classe: e.target.value }))}
                style={inp}>
                <option value="">-- Choisir une classe --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.code} — {c.libelle}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Semaine (lundi) *</label>
              <input type="date" value={formData.semaine_debut}
                onChange={e => setFormData(prev => Object.assign({}, prev, { semaine_debut: e.target.value }))}
                style={inp} />
            </div>
          </div>

          {/* Ajouter créneau */}
          <div style={{ background:'#f8fafc', borderRadius:8, padding:14, marginBottom:12, border:'1px solid #e2e8f0' }}>
            <h4 style={{ margin:'0 0 10px', fontSize:'0.85rem', fontWeight:700 }}>➕ Ajouter un créneau</h4>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:8 }}>
              <div>
                <label style={lbl}>Jour</label>
                <select value={newCreneau.jour}
                  onChange={e => setNewCreneau(prev => Object.assign({}, prev, { jour: e.target.value }))}
                  style={inp}>
                  {JOURS.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Heure début</label>
                <input type="time" value={newCreneau.heure_debut}
                  onChange={e => setNewCreneau(prev => Object.assign({}, prev, { heure_debut: e.target.value }))}
                  style={inp} />
              </div>
              <div>
                <label style={lbl}>Heure fin</label>
                <input type="time" value={newCreneau.heure_fin}
                  onChange={e => setNewCreneau(prev => Object.assign({}, prev, { heure_fin: e.target.value }))}
                  style={inp} />
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:10 }}>
              <div>
                <label style={lbl}>Matière</label>
                <select value={newCreneau.id_matiere}
                  onChange={e => setNewCreneau(prev => Object.assign({}, prev, { id_matiere: e.target.value }))}
                  style={inp}>
                  <option value="">-- Matière --</option>
                  {matieres.map(m => <option key={m.id} value={m.id}>{m.libelle}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Enseignant</label>
                <select value={newCreneau.id_enseignant}
                  onChange={e => setNewCreneau(prev => Object.assign({}, prev, { id_enseignant: e.target.value }))}
                  style={inp}>
                  <option value="">-- Enseignant --</option>
                  {enseignants.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Salle</label>
                <select value={newCreneau.id_salle}
                  onChange={e => setNewCreneau(prev => Object.assign({}, prev, { id_salle: e.target.value }))}
                  style={inp}>
                  <option value="">-- Salle --</option>
                  {salles.map(s => <option key={s.id} value={s.id}>{s.code} — {s.libelle}</option>)}
                </select>
              </div>
            </div>
            <button onClick={addCreneau}
              style={{ background:'#0891b2', color:'#fff', border:'none', borderRadius:6, padding:'7px 16px', cursor:'pointer', fontSize:'0.82rem', fontWeight:600 }}>
              + Ajouter ce créneau
            </button>
          </div>

          {/* Liste créneaux ajoutés */}
          {formData.creneaux.length > 0 && (
            <div style={{ marginBottom:14 }}>
              <h4 style={{ fontSize:'0.82rem', fontWeight:600, marginBottom:6 }}>Créneaux ({formData.creneaux.length})</h4>
              {formData.creneaux.map((cr, i) => {
                const m = matieres.find(x => x.id == cr.id_matiere);
                const e = enseignants.find(x => x.id == cr.id_enseignant);
                const s = salles.find(x => x.id == cr.id_salle);
                return (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 12px', background:'#f1f5f9', borderRadius:6, marginBottom:4, fontSize:'0.8rem' }}>
                    <span>
                      <strong style={{ textTransform:'capitalize' }}>{cr.jour}</strong>
                      {' '}{cr.heure_debut}-{cr.heure_fin}
                      {' | '}{m?.libelle || '?'}
                      {' | '}{e?.nom} {e?.prenom}
                      {' | '}{s?.code}
                    </span>
                    <button onClick={() => setFormData(prev => ({ ...prev, creneaux: prev.creneaux.filter((_, j) => j !== i) }))}
                      style={{ background:'none', border:'none', color:'#dc2626', cursor:'pointer', fontSize:'1.1rem', lineHeight:1 }}>✕</button>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display:'flex', gap:10 }}>
            <button onClick={createEmploiTemps}
              style={{ background:'#16a34a', color:'#fff', border:'none', borderRadius:8, padding:'10px 22px', fontWeight:700, cursor:'pointer', fontSize:'0.9rem' }}>
              ✓ Créer l'emploi du temps
            </button>
            <button onClick={() => { setShowForm(false); setFormData({ id_classe:'', semaine_debut: getMondayOf(), creneaux:[] }); }}
              style={{ background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 16px', cursor:'pointer', fontWeight:600 }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Grille */}
      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:'#64748b' }}>⏳ Chargement...</div>
      ) : currentET ? (
        <div style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
            <div>
              <h2 style={{ margin:0, fontSize:'1rem', fontWeight:700 }}>{currentET.classe_libelle}</h2>
              <p style={{ margin:'2px 0 0', fontSize:'0.8rem', color:'#64748b' }}>
                Semaine du {currentET.semaine_debut ? new Date(currentET.semaine_debut + 'T12:00:00').toLocaleDateString('fr-FR') : '-'}
                {' · '}{currentET.creneaux?.length || 0} créneau(x)
              </p>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <span style={{
                padding:'4px 12px', borderRadius:20, fontSize:'0.75rem', fontWeight:600,
                background: currentET.statut_publication === 'publie' ? '#dcfce7' : '#fef3c7',
                color:      currentET.statut_publication === 'publie' ? '#16a34a' : '#d97706',
              }}>
                {currentET.statut_publication === 'publie' ? '✅ Publié' : '📝 Brouillon'}
              </span>
              {user.role === 'admin' && currentET.statut_publication !== 'publie' && (
                <button onClick={() => publier(currentET.id)} disabled={publishing}
                  style={{ background: publishing ? '#94a3b8' : '#16a34a', color:'#fff', border:'none', borderRadius:6, padding:'7px 16px', cursor: publishing ? 'not-allowed' : 'pointer', fontSize:'0.82rem', fontWeight:600 }}>
                  {publishing ? '⏳ Publication...' : '📢 Publier & Générer QR'}
                </button>
              )}
            </div>
          </div>
          {renderGrille(currentET)}
        </div>
      ) : (
        <div style={{ textAlign:'center', padding:60, color:'#94a3b8', background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize:'3rem', marginBottom:12 }}>📅</div>
          <p style={{ fontSize:'1rem', fontWeight:600 }}>Aucun emploi du temps trouvé</p>
          {user.role === 'admin' && <p style={{ fontSize:'0.85rem' }}>Cliquez sur "+ Nouveau" pour en créer un.</p>}
        </div>
      )}
    </div>
  );
}
