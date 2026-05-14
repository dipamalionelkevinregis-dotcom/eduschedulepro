import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNotif } from '../context/NotifContext';

const ROLES = ['admin','enseignant','delegue','surveillant','comptable','etudiant'];
const ROLES_FR = { admin:'Administrateur', enseignant:'Enseignant', delegue:'Delegue', surveillant:'Surveillant', comptable:'Comptable', etudiant:'Etudiant' };
const ROLE_COLORS = { admin:'#6366f1', enseignant:'#0891b2', delegue:'#7c3aed', surveillant:'#ea580c', comptable:'#16a34a', etudiant:'#64748b' };

export default function UtilisateursPage() {
  const { success, error } = useNotif();
  const [rows,     setRows]     = useState([]);
  const [classes,  setClasses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [search,   setSearch]   = useState('');
  const [form, setForm] = useState({ email:'', password:'password', role:'etudiant', nom_complet:'', id_classe:'', id_lien:'', actif:1 });

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/utilisateurs'), api.get('/classes')])
      .then(([u, c]) => { setRows(u); setClasses(c); })
      .catch(e => error(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const emptyForm = { email:'', password:'password', role:'etudiant', nom_complet:'', id_classe:'', id_lien:'', actif:1 };
  const setField  = (k, v) => setForm(prev => Object.assign({}, prev, { [k]: v }));
  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit   = row  => { setEditing(row); setForm(Object.assign({}, row, { password:'' })); setShowForm(true); };

  const save = async () => {
    if (!form.email || !form.role) { error('Email et role sont requis'); return; }
    setSaving(true);
    try {
      const payload = Object.assign({}, form);
      if (!editing && !payload.password) payload.password = 'password';
      if (editing) await api.put('/utilisateurs?id=' + editing.id, payload);
      else         await api.post('/utilisateurs', payload);
      success(editing ? 'Utilisateur mis a jour !' : 'Utilisateur cree ! Mot de passe par defaut : password');
      setShowForm(false); load();
    } catch(e) { error(e.message); }
    finally { setSaving(false); }
  };

  const resetMdp = async (id, email) => {
    if (!window.confirm('Reinitialiser le mot de passe de ' + email + ' a "password" ?')) return;
    try {
      await api.post('/utilisateurs?id=' + id + '&action=reset-mdp', {});
      success('Mot de passe reinitialise a "password"');
    } catch(e) { error(e.message); }
  };

  const toggleActif = async (id, actif) => {
    if (actif) {
      // Désactiver
      if (!window.confirm('Désactiver cet utilisateur ?')) return;
      try {
        await api.del('/utilisateurs?id=' + id);
        success('Utilisateur désactivé');
        load();
      } catch(e) { error(e.message); }
    } else {
      // Réactiver
      try {
        await api.put('/utilisateurs?id=' + id + '&action=reactiver', {});
        success('Utilisateur réactivé !');
        load();
      } catch(e) { error(e.message); }
    }
  };

  const filtered = rows.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
  const inp = { width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'0.82rem', boxSizing:'border-box' };
  const lbl = { display:'block', fontSize:'0.8rem', fontWeight:600, marginBottom:'4px', color:'#374151' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h1 style={{ margin:0, fontSize:'1.4rem', fontWeight:800, color:'#0f172a' }}>Utilisateurs</h1>
          <p style={{ margin:'4px 0 0', fontSize:'0.8rem', color:'#64748b' }}>Les nouveaux comptes ont le mot de passe par defaut : <strong>password</strong></p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            style={{ padding:'8px 14px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.85rem', width:200 }} />
          <button onClick={openCreate}
            style={{ background:'#1d4ed8', color:'#fff', border:'none', borderRadius:8, padding:'9px 18px', fontWeight:600, cursor:'pointer' }}>
            + Nouveau
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ background:'#fff', borderRadius:12, padding:24, marginBottom:20, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', border:'2px solid #dbeafe' }}>
          <h3 style={{ margin:'0 0 16px', fontSize:'1rem', fontWeight:700 }}>{editing ? 'Modifier utilisateur' : 'Nouvel utilisateur'}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            <div>
              <label style={lbl}>Nom complet</label>
              <input type="text" value={form.nom_complet} onChange={e => setField('nom_complet', e.target.value)} style={inp} placeholder="Prenom Nom" />
            </div>
            <div>
              <label style={lbl}>Email *</label>
              <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} style={inp} placeholder="email@isge.bf" />
            </div>
            <div>
              <label style={lbl}>Role *</label>
              <select value={form.role} onChange={e => setField('role', e.target.value)} style={inp}>
                {ROLES.map(r => <option key={r} value={r}>{ROLES_FR[r]}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>{editing ? 'Nouveau mot de passe (laisser vide = inchange)' : 'Mot de passe (defaut: password)'}</label>
              <input type="password" value={form.password} onChange={e => setField('password', e.target.value)} style={inp} placeholder={editing ? 'Laisser vide pour ne pas changer' : 'password'} />
            </div>
            {(form.role === 'delegue' || form.role === 'etudiant') && (
              <div>
                <label style={lbl}>Classe</label>
                <select value={form.id_classe} onChange={e => setField('id_classe', e.target.value)} style={inp}>
                  <option value="">-- Choisir --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.code} - {c.libelle}</option>)}
                </select>
              </div>
            )}
            {editing && (
              <div>
                <label style={lbl}>Statut</label>
                <select value={form.actif} onChange={e => setField('actif', parseInt(e.target.value))} style={inp}>
                  <option value={1}>Actif</option>
                  <option value={0}>Inactif</option>
                </select>
              </div>
            )}
          </div>
          {!editing && (
            <div style={{ background:'#fef3c7', border:'1px solid #fcd34d', borderRadius:8, padding:'10px 14px', marginBottom:14, fontSize:'0.82rem', color:'#92400e' }}>
              Le compte sera cree avec le mot de passe : <strong>{form.password || 'password'}</strong> — l utilisateur pourra le changer depuis son profil.
            </div>
          )}
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={save} disabled={saving}
              style={{ background: saving ? '#94a3b8' : '#16a34a', color:'#fff', border:'none', borderRadius:8, padding:'9px 20px', fontWeight:700, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:8, padding:'9px 16px', cursor:'pointer', fontWeight:600 }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:'#64748b' }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>Aucun resultat</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f8fafc', borderBottom:'2px solid #e2e8f0' }}>
                  {['Nom','Email','Role','Classe','Statut','Actions'].map(h => (
                    <th key={h} style={{ padding:'10px 12px', textAlign:'left', color:'#64748b', fontWeight:600, fontSize:'0.82rem', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.id} style={{ borderBottom:'1px solid #f1f5f9', opacity: row.actif ? 1 : 0.5 }}>
                    <td style={{ padding:'9px 12px', fontSize:'0.82rem', fontWeight:600 }}>{row.nom_complet || '-'}</td>
                    <td style={{ padding:'9px 12px', fontSize:'0.82rem', color:'#64748b' }}>{row.email}</td>
                    <td style={{ padding:'9px 12px' }}>
                      <span style={{ padding:'2px 8px', borderRadius:20, fontSize:'0.72rem', fontWeight:600,
                        background: (ROLE_COLORS[row.role]||'#64748b')+'20',
                        color: ROLE_COLORS[row.role]||'#64748b' }}>
                        {ROLES_FR[row.role]||row.role}
                      </span>
                    </td>
                    <td style={{ padding:'9px 12px', fontSize:'0.82rem', color:'#64748b' }}>
                      {row.id_classe ? (classes.find(c => c.id == row.id_classe)?.code || '-') : '-'}
                    </td>
                    <td style={{ padding:'9px 12px' }}>
                      <span style={{ padding:'2px 8px', borderRadius:20, fontSize:'0.72rem', fontWeight:600,
                        background: row.actif ? '#dcfce7' : '#fee2e2',
                        color:      row.actif ? '#16a34a' : '#dc2626' }}>
                        {row.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={{ padding:'9px 12px' }}>
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                        <button onClick={() => openEdit(row)}
                          style={{ padding:'4px 8px', background:'#dbeafe', color:'#1d4ed8', border:'none', borderRadius:5, cursor:'pointer', fontSize:'0.75rem', fontWeight:600 }}>
                          Modifier
                        </button>
                        <button onClick={() => resetMdp(row.id, row.email)}
                          style={{ padding:'4px 8px', background:'#fef3c7', color:'#d97706', border:'none', borderRadius:5, cursor:'pointer', fontSize:'0.75rem', fontWeight:600 }}>
                          Reset mdp
                        </button>
                        <button onClick={() => toggleActif(row.id, row.actif)}
                          style={{ padding:'4px 8px', background: row.actif ? '#fee2e2' : '#dcfce7', color: row.actif ? '#dc2626' : '#16a34a', border:'none', borderRadius:5, cursor:'pointer', fontSize:'0.75rem', fontWeight:600 }}>
                          {row.actif ? 'Desactiver' : 'Reactiver'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
