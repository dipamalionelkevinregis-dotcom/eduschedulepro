import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNotif } from '../context/NotifContext';

// ── Composant réutilisable Table ──
function DataTable({ cols, rows, onEdit, onDel }) {
  return (
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead>
        <tr style={{ background:'#f8fafc', borderBottom:'2px solid #e2e8f0' }}>
          {cols.map(c => (
            <th key={c} style={{ padding:'10px 12px', textAlign:'left', color:'#64748b', fontWeight:600, fontSize:'0.82rem' }}>{c}</th>
          ))}
          <th style={{ padding:'10px 12px', textAlign:'left', color:'#64748b', fontWeight:600, fontSize:'0.82rem' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
            {cols.map(c => (
              <td key={c} style={{ padding:'9px 12px', fontSize:'0.82rem' }}>{row[c.toLowerCase().replace(/ /g,'_')] ?? row[Object.keys(row)[cols.indexOf(c)]]}</td>
            ))}
            <td style={{ padding:'9px 12px' }}>
              <div style={{ display:'flex', gap:'6px' }}>
                <button onClick={() => onEdit(row)} style={{ padding:'5px 10px', background:'#dbeafe', color:'#1d4ed8', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.78rem', fontWeight:600 }}>Modifier</button>
                <button onClick={() => onDel(row.id)} style={{ padding:'5px 10px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.78rem', fontWeight:600 }}>Supprimer</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Section Classes ──
function ClassesSection({ notif }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code:'', libelle:'', niveau:'', annee_academique:'2025-2026' });

  const load = () => {
    setLoading(true);
    api.get('/classes').then(d => setRows(d)).catch(e => notif.error(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const emptyForm = { code:'', libelle:'', niveau:'', annee_academique:'2025-2026' };
  const setField = (k, v) => setForm(prev => Object.assign({}, prev, { [k]: v }));
  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = row => { setEditing(row); setForm(Object.assign({}, row)); setShowForm(true); };

  const save = async () => {
    if (!form.code || !form.libelle || !form.niveau) { notif.error('Tous les champs sont requis'); return; }
    setSaving(true);
    try {
      if (editing) await api.put('/classes?id=' + editing.id, form);
      else await api.post('/classes', form);
      notif.success(editing ? 'Classe mise a jour !' : 'Classe creee !');
      setShowForm(false); load();
    } catch(e) { notif.error(e.message); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!window.confirm('Supprimer cette classe ?')) return;
    try { await api.del('/classes?id=' + id); notif.success('Classe supprimee !'); load(); }
    catch(e) { notif.error(e.message); }
  };

  const inp = { width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'0.82rem', boxSizing:'border-box' };
  const lbl = { display:'block', fontSize:'0.8rem', fontWeight:600, marginBottom:'4px', color:'#374151' };

  return (
    <div style={{ background:'#fff', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', marginBottom:'24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
        <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700, color:'#0f172a' }}>🎓 Classes</h2>
        <button onClick={openCreate} style={{ background:'#1d4ed8', color:'#fff', border:'none', borderRadius:'8px', padding:'8px 16px', fontWeight:600, cursor:'pointer', fontSize:'0.85rem' }}>
          + Nouvelle classe
        </button>
      </div>

      {showForm && (
        <div style={{ background:'#f8fafc', borderRadius:'10px', padding:'20px', marginBottom:'16px', border:'1px solid #e2e8f0' }}>
          <h3 style={{ margin:'0 0 14px', fontSize:'0.95rem', fontWeight:700 }}>{editing ? 'Modifier la classe' : 'Nouvelle classe'}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
            <div>
              <label style={lbl}>Code *</label>
              <input type="text" value={form.code} onChange={e => setField('code', e.target.value)} style={inp} placeholder="Ex: RST-L1" />
            </div>
            <div>
              <label style={lbl}>Libelle *</label>
              <input type="text" value={form.libelle} onChange={e => setField('libelle', e.target.value)} style={inp} placeholder="Ex: Licence 1 RST" />
            </div>
            <div>
              <label style={lbl}>Niveau *</label>
              <select value={form.niveau} onChange={e => setField('niveau', e.target.value)} style={inp}>
                <option value="">-- Choisir --</option>
                <option value="Licence 1">Licence 1</option>
                <option value="Licence 2">Licence 2</option>
                <option value="Licence 3">Licence 3</option>
                <option value="Master 1">Master 1</option>
                <option value="Master 2">Master 2</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Annee academique</label>
              <input type="text" value={form.annee_academique} onChange={e => setField('annee_academique', e.target.value)} style={inp} placeholder="2025-2026" />
            </div>
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            <button onClick={save} disabled={saving} style={{ background: saving ? '#94a3b8' : '#16a34a', color:'#fff', border:'none', borderRadius:'8px', padding:'9px 20px', fontWeight:700, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'9px 16px', cursor:'pointer', fontWeight:600 }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding:'30px', textAlign:'center', color:'#64748b' }}>Chargement...</div>
      ) : rows.length === 0 ? (
        <div style={{ padding:'30px', textAlign:'center', color:'#94a3b8' }}>Aucune classe enregistree</div>
      ) : (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc', borderBottom:'2px solid #e2e8f0' }}>
                {['Code','Libelle','Niveau','Annee','Actions'].map(h => (
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', color:'#64748b', fontWeight:600, fontSize:'0.82rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                  <td style={{ padding:'9px 12px', fontSize:'0.82rem', fontWeight:600 }}>{row.code}</td>
                  <td style={{ padding:'9px 12px', fontSize:'0.82rem' }}>{row.libelle}</td>
                  <td style={{ padding:'9px 12px', fontSize:'0.82rem' }}>{row.niveau}</td>
                  <td style={{ padding:'9px 12px', fontSize:'0.82rem', color:'#64748b' }}>{row.annee_academique}</td>
                  <td style={{ padding:'9px 12px' }}>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button onClick={() => openEdit(row)} style={{ padding:'5px 10px', background:'#dbeafe', color:'#1d4ed8', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.78rem', fontWeight:600 }}>Modifier</button>
                      <button onClick={() => del(row.id)} style={{ padding:'5px 10px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.78rem', fontWeight:600 }}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Section Matieres ──
function MatieresSection({ notif }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code:'', libelle:'', volume_horaire_total:'', coefficient:'1' });

  const load = () => {
    setLoading(true);
    api.get('/matieres').then(d => setRows(d)).catch(e => notif.error(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const emptyForm = { code:'', libelle:'', volume_horaire_total:'', coefficient:'1' };
  const setField = (k, v) => setForm(prev => Object.assign({}, prev, { [k]: v }));
  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = row => { setEditing(row); setForm(Object.assign({}, row)); setShowForm(true); };

  const save = async () => {
    if (!form.code || !form.libelle) { notif.error('Le code et le libelle sont requis'); return; }
    setSaving(true);
    try {
      if (editing) await api.put('/matieres?id=' + editing.id, form);
      else await api.post('/matieres', form);
      notif.success(editing ? 'Matiere mise a jour !' : 'Matiere creee !');
      setShowForm(false); load();
    } catch(e) { notif.error(e.message); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!window.confirm('Supprimer cette matiere ?')) return;
    try { await api.del('/matieres?id=' + id); notif.success('Matiere supprimee !'); load(); }
    catch(e) { notif.error(e.message); }
  };

  const inp = { width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid #e2e8f0', fontSize:'0.82rem', boxSizing:'border-box' };
  const lbl = { display:'block', fontSize:'0.8rem', fontWeight:600, marginBottom:'4px', color:'#374151' };

  return (
    <div style={{ background:'#fff', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
        <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700, color:'#0f172a' }}>📚 Matieres</h2>
        <button onClick={openCreate} style={{ background:'#7c3aed', color:'#fff', border:'none', borderRadius:'8px', padding:'8px 16px', fontWeight:600, cursor:'pointer', fontSize:'0.85rem' }}>
          + Nouvelle matiere
        </button>
      </div>

      {showForm && (
        <div style={{ background:'#f8fafc', borderRadius:'10px', padding:'20px', marginBottom:'16px', border:'1px solid #e2e8f0' }}>
          <h3 style={{ margin:'0 0 14px', fontSize:'0.95rem', fontWeight:700 }}>{editing ? 'Modifier la matiere' : 'Nouvelle matiere'}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
            <div>
              <label style={lbl}>Code *</label>
              <input type="text" value={form.code} onChange={e => setField('code', e.target.value)} style={inp} placeholder="Ex: WEB101" />
            </div>
            <div>
              <label style={lbl}>Libelle *</label>
              <input type="text" value={form.libelle} onChange={e => setField('libelle', e.target.value)} style={inp} placeholder="Ex: Developpement Web" />
            </div>
            <div>
              <label style={lbl}>Volume horaire total (h)</label>
              <input type="number" value={form.volume_horaire_total} onChange={e => setField('volume_horaire_total', e.target.value)} style={inp} placeholder="Ex: 60" />
            </div>
            <div>
              <label style={lbl}>Coefficient</label>
              <input type="number" value={form.coefficient} onChange={e => setField('coefficient', e.target.value)} style={inp} min="1" max="10" />
            </div>
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            <button onClick={save} disabled={saving} style={{ background: saving ? '#94a3b8' : '#7c3aed', color:'#fff', border:'none', borderRadius:'8px', padding:'9px 20px', fontWeight:700, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'9px 16px', cursor:'pointer', fontWeight:600 }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding:'30px', textAlign:'center', color:'#64748b' }}>Chargement...</div>
      ) : rows.length === 0 ? (
        <div style={{ padding:'30px', textAlign:'center', color:'#94a3b8' }}>Aucune matiere enregistree</div>
      ) : (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc', borderBottom:'2px solid #e2e8f0' }}>
                {['Code','Libelle','Volume horaire','Coefficient','Actions'].map(h => (
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', color:'#64748b', fontWeight:600, fontSize:'0.82rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                  <td style={{ padding:'9px 12px', fontSize:'0.82rem', fontWeight:600 }}>{row.code}</td>
                  <td style={{ padding:'9px 12px', fontSize:'0.82rem' }}>{row.libelle}</td>
                  <td style={{ padding:'9px 12px', fontSize:'0.82rem' }}>{row.volume_horaire_total}h</td>
                  <td style={{ padding:'9px 12px', fontSize:'0.82rem' }}>
                    <span style={{ background:'#ede9fe', color:'#7c3aed', padding:'2px 8px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:600 }}>
                      Coef. {row.coefficient}
                    </span>
                  </td>
                  <td style={{ padding:'9px 12px' }}>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button onClick={() => openEdit(row)} style={{ padding:'5px 10px', background:'#dbeafe', color:'#1d4ed8', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.78rem', fontWeight:600 }}>Modifier</button>
                      <button onClick={() => del(row.id)} style={{ padding:'5px 10px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.78rem', fontWeight:600 }}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Page principale ──
export default function ClassesPage() {
  const notif = useNotif();
  return (
    <div>
      <h1 style={{ margin:'0 0 24px', fontSize:'1.5rem', fontWeight:800, color:'#0f172a' }}>Classes et Matieres</h1>
      <ClassesSection notif={notif} />
      <MatieresSection notif={notif} />
    </div>
  );
}
