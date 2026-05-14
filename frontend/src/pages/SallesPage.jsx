import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNotif } from '../context/NotifContext';

export default function SallesPage() {
  const { success, error } = useNotif();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({'code': '', 'libelle': '', 'capacite': '', 'equipements': '', 'batiment': ''});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/salles').then(d => setRows(d)).catch(e => error(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({'code': '', 'libelle': '', 'capacite': '', 'equipements': '', 'batiment': ''}); setShowForm(true); };
  const openEdit = row => { setEditing(row); setForm({...row}); setShowForm(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await api.put('/salles?id='+editing.id, form);
      else await api.post('/salles', form);
      success(editing ? 'Mis à jour !' : 'Créé !');
      setShowForm(false); load();
    } catch(e) { error(e.message); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    try { await api.del('/salles?id='+id); success('Supprimé !'); load(); }
    catch(e) { error(e.message); }
  };

  const filtered = rows.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h1 style={{margin:0,fontSize:'1.4rem',fontWeight:800,color:'#0f172a'}}>🏫 Salles</h1>
        <div style={{display:'flex',gap:10}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
            style={{padding:'8px 14px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:'0.85rem',width:200}} />
          <button onClick={openCreate} style={{background:'#1d4ed8',color:'#fff',border:'none',borderRadius:8,padding:'9px 18px',fontWeight:600,cursor:'pointer',fontSize:'0.85rem'}}>+ Nouveau</button>
        </div>
      </div>

      {showForm && (
        <div style={{background:'#fff',borderRadius:12,padding:24,marginBottom:20,boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
          <h3 style={{margin:'0 0 16px',fontSize:'1rem',fontWeight:700}}>{editing ? 'Modifier' : 'Nouveau'}</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
            <div>
              <label style={{display:'block',fontSize:'0.8rem',fontWeight:600,marginBottom:4}}>Code</label>
              <input type="text" value={form.code||''} onChange={e=>setForm(p=>({...p,code:e.target.value}))}
                style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:'0.82rem',boxSizing:'border-box'}} />
            </div>
<div>
              <label style={{display:'block',fontSize:'0.8rem',fontWeight:600,marginBottom:4}}>Libellé</label>
              <input type="text" value={form.libelle||''} onChange={e=>setForm(p=>({...p,libelle:e.target.value}))}
                style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:'0.82rem',boxSizing:'border-box'}} />
            </div>
<div>
              <label style={{display:'block',fontSize:'0.8rem',fontWeight:600,marginBottom:4}}>Capacité</label>
              <input type="number" value={form.capacite||''} onChange={e=>setForm(p=>({...p,capacite:e.target.value}))}
                style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:'0.82rem',boxSizing:'border-box'}} />
            </div>
<div>
              <label style={{display:'block',fontSize:'0.8rem',fontWeight:600,marginBottom:4}}>Équipements</label>
              <input type="text" value={form.equipements||''} onChange={e=>setForm(p=>({...p,equipements:e.target.value}))}
                style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:'0.82rem',boxSizing:'border-box'}} />
            </div>
<div>
              <label style={{display:'block',fontSize:'0.8rem',fontWeight:600,marginBottom:4}}>Bâtiment</label>
              <input type="text" value={form.batiment||''} onChange={e=>setForm(p=>({...p,batiment:e.target.value}))}
                style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1px solid #e2e8f0',fontSize:'0.82rem',boxSizing:'border-box'}} />
            </div>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={save} disabled={saving} style={{background:saving?'#94a3b8':'#16a34a',color:'#fff',border:'none',borderRadius:8,padding:'9px 20px',fontWeight:700,cursor:saving?'not-allowed':'pointer'}}>
              {saving ? '⏳...' : '✓ Enregistrer'}
            </button>
            <button onClick={()=>setShowForm(false)} style={{background:'#f1f5f9',border:'none',borderRadius:8,padding:'9px 16px',cursor:'pointer',fontWeight:600}}>Annuler</button>
          </div>
        </div>
      )}

      <div style={{background:'#fff',borderRadius:12,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',overflow:'hidden'}}>
        {loading ? <div style={{padding:40,textAlign:'center',color:'#64748b'}}>⏳</div> :
        filtered.length===0 ? <div style={{padding:40,textAlign:'center',color:'#94a3b8'}}>Aucun résultat</div> : (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#f8fafc',borderBottom:'2px solid #e2e8f0'}}><th style={{padding:'8px 12px',textAlign:'left',color:'#64748b',fontWeight:600,fontSize:'0.82rem'}}>Code</th><th style={{padding:'8px 12px',textAlign:'left',color:'#64748b',fontWeight:600,fontSize:'0.82rem'}}>Libellé</th><th style={{padding:'8px 12px',textAlign:'left',color:'#64748b',fontWeight:600,fontSize:'0.82rem'}}>Capacité</th><th style={{padding:'8px 12px',textAlign:'left',color:'#64748b',fontWeight:600,fontSize:'0.82rem'}}>Équipements</th><th style={{padding:'8px 12px',textAlign:'left',color:'#64748b',fontWeight:600,fontSize:'0.82rem'}}>Bâtiment</th><th></th></tr></thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                  <td style={{padding:'8px 12px',fontSize:'0.82rem'}}>{row.code}</td><td style={{padding:'8px 12px',fontSize:'0.82rem'}}>{row.libelle}</td><td style={{padding:'8px 12px',fontSize:'0.82rem'}}>{row.capacite}</td><td style={{padding:'8px 12px',fontSize:'0.82rem'}}>{row.equipements}</td><td style={{padding:'8px 12px',fontSize:'0.82rem'}}>{row.batiment}</td>
                  <td style={{padding:'8px 12px'}}>
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>openEdit(row)} style={{padding:'5px 10px',background:'#dbeafe',color:'#1d4ed8',border:'none',borderRadius:6,cursor:'pointer',fontSize:'0.78rem',fontWeight:600}}>Modifier</button>
                      <button onClick={()=>del(row.id)} style={{padding:'5px 10px',background:'#fee2e2',color:'#dc2626',border:'none',borderRadius:6,cursor:'pointer',fontSize:'0.78rem',fontWeight:600}}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
