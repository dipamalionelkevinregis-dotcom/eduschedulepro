import { useState, useEffect, useRef } from 'react';
import { api, formatDate, formatTime } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';

function SignaturePad({ onSave, label }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const start = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#1d4ed8';
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
    setHasDrawn(true);
  };

  const stop = (e) => { e.preventDefault(); setDrawing(false); };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
    setHasDrawn(false);
  };

  const save = () => {
    if (!hasDrawn) return;
    const data = canvasRef.current.toDataURL('image/png');
    onSave(data);
  };

  return (
    <div style={{ border:'2px solid #e2e8f0', borderRadius:8, padding:12, background:'#f8fafc' }}>
      <p style={{ margin:'0 0 8px', fontSize:'0.82rem', fontWeight:600, color:'#374151' }}>{label}</p>
      <canvas ref={canvasRef} width={400} height={120} style={{ border:'1px solid #cbd5e1', borderRadius:6, background:'#fff', width:'100%', touchAction:'none', cursor:'crosshair' }}
        onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
        onTouchStart={start} onTouchMove={draw} onTouchEnd={stop} />
      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        <button onClick={clear} style={{ padding:'6px 12px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:6, cursor:'pointer', fontSize:'0.78rem' }}>Effacer</button>
        <button onClick={save} disabled={!hasDrawn} style={{ padding:'6px 12px', background: hasDrawn?'#1d4ed8':'#94a3b8', color:'#fff', border:'none', borderRadius:6, cursor: hasDrawn?'pointer':'not-allowed', fontSize:'0.78rem', fontWeight:600 }}>
          Valider ma signature
        </button>
      </div>
    </div>
  );
}

export default function CahiersPage({ nouveau }) {
  const { user } = useAuth();
  const { success, error } = useNotif();
  const [cahiers, setCahiers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [creneaux, setCreneaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(!!nouveau);
  const [form, setForm] = useState({ id_creneau:'', titre_cours:'', niveau_avancement:'', observations:'', contenu_json:[], travaux:[] });
  const [newPoint, setNewPoint] = useState('');
  const [newTravail, setNewTravail] = useState({ description:'', date_limite:'', type:'devoir' });
  const [showSign, setShowSign] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    let url = '/cahiers';
    if (user.role === 'delegue' && user.id_classe) url += '?id_classe='+user.id_classe;
    api.get(url).then(d => setCahiers(d)).catch(e => error(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (showForm && user.role === 'delegue') {
      api.get('/emploi-temps?id_classe='+user.id_classe)
        .then(d => setCreneaux(d.flatMap(et => (et.creneaux||[]).map(c=>({...c, classe:et.classe_libelle, semaine:et.semaine_debut})))))
        .catch(e => error(e.message));
    }
  }, [showForm]);

  const loadDetail = async (id) => {
    try { const d = await api.get('/cahiers?id='+id); setSelected(d); } catch(e) { error(e.message); }
  };

  const addPoint = () => {
    if (!newPoint.trim()) return;
    setForm(prev => ({ ...prev, contenu_json: [...prev.contenu_json, newPoint.trim()] }));
    setNewPoint('');
  };

  const addTravail = () => {
    if (!newTravail.description) return;
    setForm(prev => ({ ...prev, travaux: [...prev.travaux, {...newTravail}] }));
    setNewTravail({ description:'', date_limite:'', type:'devoir' });
  };

  const createCahier = async () => {
    if (!form.id_creneau || !form.titre_cours) { error('Créneau et titre requis'); return; }
    setSaving(true);
    try {
      await api.post('/cahiers', form);
      success('Cahier créé !');
      setShowForm(false);
      setForm({ id_creneau:'', titre_cours:'', niveau_avancement:'', observations:'', contenu_json:[], travaux:[] });
      load();
    } catch(e) { error(e.message); }
    finally { setSaving(false); }
  };

  const signer = async (id, type, sig) => {
    try {
      if (type === 'cloture') {
        await api.post('/cahiers?id='+id+'&action=cloture', { signature_base64: sig, heure_fin: new Date().toTimeString().slice(0,8) });
        success('Séance clôturée !');
      } else {
        await api.post('/cahiers?id='+id+'&action=signer', { signature_base64: sig, type });
        success('Signature apposée !');
      }
      setShowSign(null);
      load();
      if (selected?.id === id) loadDetail(id);
    } catch(e) { error(e.message); }
  };

  const statColor = { brouillon:'#fef3c7', signe_delegue:'#dbeafe', cloture:'#dcfce7' };
  const statLabel = { brouillon:'Brouillon', signe_delegue:'Signé Délégué', cloture:'Clôturé' };
  const statTextColor = { brouillon:'#d97706', signe_delegue:'#1d4ed8', cloture:'#16a34a' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:'1.4rem', fontWeight:800, color:'#0f172a' }}>📓 Cahiers de Texte</h1>
        {user.role==='delegue' && (
          <button onClick={() => setShowForm(!showForm)} style={{ background:'#1d4ed8', color:'#fff', border:'none', borderRadius:8, padding:'9px 18px', fontWeight:600, cursor:'pointer', fontSize:'0.85rem' }}>
            {showForm ? '✕ Fermer' : '+ Nouveau cahier'}
          </button>
        )}
      </div>

      {/* Formulaire */}
      {showForm && user.role==='delegue' && (
        <div style={{ background:'#fff', borderRadius:12, padding:24, marginBottom:20, boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin:'0 0 16px', fontSize:'1rem', fontWeight:700 }}>Nouveau cahier de texte</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
            <div>
              <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, marginBottom:4 }}>Créneau *</label>
              <select value={form.id_creneau} onChange={e => setForm({...form, id_creneau:e.target.value})}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.82rem' }}>
                <option value="">Choisir un créneau</option>
                {creneaux.map(c => <option key={c.id} value={c.id}>{c.jour} {c.heure_debut?.slice(0,5)} — {c.matiere} ({c.classe})</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, marginBottom:4 }}>Titre du cours *</label>
              <input value={form.titre_cours} onChange={e => setForm({...form, titre_cours:e.target.value})}
                placeholder="Ex: Chapitre 3 - Les réseaux TCP/IP"
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.82rem', boxSizing:'border-box' }} />
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, marginBottom:4 }}>Avancement du programme</label>
            <input value={form.niveau_avancement} onChange={e => setForm({...form, niveau_avancement:e.target.value})}
              placeholder="Ex: Chapitre 3/6 — 50%"
              style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.82rem', boxSizing:'border-box' }} />
          </div>
          {/* Points vus */}
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, marginBottom:4 }}>Points abordés</label>
            <div style={{ display:'flex', gap:8, marginBottom:8 }}>
              <input value={newPoint} onChange={e => setNewPoint(e.target.value)} onKeyDown={e => e.key==='Enter' && addPoint()}
                placeholder="Ex: Définition du modèle OSI"
                style={{ flex:1, padding:'8px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.82rem' }} />
              <button onClick={addPoint} style={{ background:'#0891b2', color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontWeight:600, fontSize:'0.82rem' }}>+ Ajouter</button>
            </div>
            {form.contenu_json.map((p,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 10px', background:'#f1f5f9', borderRadius:6, marginBottom:4, fontSize:'0.8rem' }}>
                <span>• {p}</span>
                <button onClick={() => setForm(prev=>({...prev, contenu_json:prev.contenu_json.filter((_,j)=>j!==i)}))}
                  style={{ background:'none', border:'none', color:'#dc2626', cursor:'pointer' }}>✕</button>
              </div>
            ))}
          </div>
          {/* Travaux */}
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, marginBottom:4 }}>Travaux demandés</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:8, marginBottom:8, alignItems:'end' }}>
              <input value={newTravail.description} onChange={e => setNewTravail({...newTravail, description:e.target.value})}
                placeholder="Description du travail" style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.82rem' }} />
              <input type="date" value={newTravail.date_limite} onChange={e => setNewTravail({...newTravail, date_limite:e.target.value})}
                style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.82rem' }} />
              <select value={newTravail.type} onChange={e => setNewTravail({...newTravail, type:e.target.value})}
                style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.82rem' }}>
                {['devoir','exercice','projet','expose','autre'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={addTravail} style={{ background:'#7c3aed', color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontWeight:600, fontSize:'0.82rem' }}>+</button>
            </div>
            {form.travaux.map((t,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 10px', background:'#f1f5f9', borderRadius:6, marginBottom:4, fontSize:'0.8rem' }}>
                <span>{t.type} — {t.description} {t.date_limite && '| ↗ '+t.date_limite}</span>
                <button onClick={() => setForm(prev=>({...prev, travaux:prev.travaux.filter((_,j)=>j!==i)}))}
                  style={{ background:'none', border:'none', color:'#dc2626', cursor:'pointer' }}>✕</button>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, marginBottom:4 }}>Observations</label>
            <textarea value={form.observations} onChange={e => setForm({...form, observations:e.target.value})}
              placeholder="Incidents, absences, retards..."
              style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.82rem', boxSizing:'border-box', minHeight:70, resize:'vertical' }} />
          </div>
          <button onClick={createCahier} disabled={saving} style={{ background: saving?'#94a3b8':'#16a34a', color:'#fff', border:'none', borderRadius:8, padding:'10px 22px', fontWeight:700, cursor: saving?'not-allowed':'pointer', fontSize:'0.9rem' }}>
            {saving ? '⏳ Enregistrement...' : '✓ Créer le cahier'}
          </button>
        </div>
      )}

      {/* Liste + Détail */}
      <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 1.5fr' : '1fr', gap:16 }}>
        {/* Liste */}
        <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', overflow:'hidden' }}>
          {loading ? <div style={{ padding:40, textAlign:'center', color:'#64748b' }}>⏳</div>
          : cahiers.length === 0 ? <div style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>Aucun cahier trouvé</div>
          : cahiers.map(c => (
            <div key={c.id} onClick={() => loadDetail(c.id)} style={{
              padding:'14px 16px', borderBottom:'1px solid #f1f5f9', cursor:'pointer',
              background: selected?.id===c.id ? '#eff6ff' : 'transparent',
              borderLeft: selected?.id===c.id ? '3px solid #1d4ed8' : '3px solid transparent',
              transition:'all 0.15s',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontWeight:700, fontSize:'0.85rem', color:'#0f172a' }}>{c.matiere}</span>
                <span style={{ padding:'2px 8px', borderRadius:20, fontSize:'0.7rem', fontWeight:600, background:statColor[c.statut], color:statTextColor[c.statut] }}>
                  {statLabel[c.statut]}
                </span>
              </div>
              <div style={{ fontSize:'0.78rem', color:'#64748b' }}>{c.classe} — {c.jour} {c.heure_debut?.slice(0,5)}</div>
              <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:2 }}>{c.titre_cours}</div>
            </div>
          ))}
        </div>

        {/* Détail */}
        {selected && (
          <div style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div>
                <h3 style={{ margin:0, fontSize:'1.05rem', fontWeight:800 }}>{selected.matiere}</h3>
                <p style={{ margin:'2px 0 0', fontSize:'0.78rem', color:'#64748b' }}>{selected.classe} — {selected.jour} {selected.heure_debut?.slice(0,5)}-{selected.heure_fin?.slice(0,5)}</p>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <span style={{ padding:'4px 12px', borderRadius:20, fontSize:'0.75rem', fontWeight:600, background:statColor[selected.statut], color:statTextColor[selected.statut] }}>
                  {statLabel[selected.statut]}
                </span>
                <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer', color:'#94a3b8' }}>✕</button>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14, fontSize:'0.82rem' }}>
              <div style={{ background:'#f8fafc', borderRadius:8, padding:10 }}>
                <div style={{ color:'#94a3b8', fontSize:'0.72rem', marginBottom:2 }}>ENSEIGNANT</div>
                <div style={{ fontWeight:600 }}>{selected.ens_prenom} {selected.ens_nom}</div>
              </div>
              <div style={{ background:'#f8fafc', borderRadius:8, padding:10 }}>
                <div style={{ color:'#94a3b8', fontSize:'0.72rem', marginBottom:2 }}>DÉLÉGUÉ</div>
                <div style={{ fontWeight:600 }}>{selected.delegue_nom}</div>
              </div>
              <div style={{ background:'#f8fafc', borderRadius:8, padding:10 }}>
                <div style={{ color:'#94a3b8', fontSize:'0.72rem', marginBottom:2 }}>AVANCEMENT</div>
                <div style={{ fontWeight:600 }}>{selected.niveau_avancement || '-'}</div>
              </div>
              <div style={{ background:'#f8fafc', borderRadius:8, padding:10 }}>
                <div style={{ color:'#94a3b8', fontSize:'0.72rem', marginBottom:2 }}>FIN RÉELLE</div>
                <div style={{ fontWeight:600 }}>{selected.heure_fin_reelle ? selected.heure_fin_reelle.slice(0,5) : '—'}</div>
              </div>
            </div>

            <div style={{ marginBottom:12 }}>
              <div style={{ fontWeight:600, fontSize:'0.82rem', marginBottom:6 }}>📋 Titre : {selected.titre_cours}</div>
              {Array.isArray(selected.contenu_json) && selected.contenu_json.length > 0 && (
                <div>
                  <div style={{ fontSize:'0.78rem', color:'#64748b', marginBottom:4 }}>Points abordés :</div>
                  {selected.contenu_json.map((p,i) => <div key={i} style={{ fontSize:'0.8rem', padding:'3px 0', color:'#374151' }}>• {p}</div>)}
                </div>
              )}
            </div>

            {selected.travaux?.length > 0 && (
              <div style={{ marginBottom:12 }}>
                <div style={{ fontWeight:600, fontSize:'0.82rem', marginBottom:6 }}>📚 Travaux demandés</div>
                {selected.travaux.map((t,i) => (
                  <div key={i} style={{ display:'flex', gap:8, padding:'5px 10px', background:'#fef3c7', borderRadius:6, marginBottom:4, fontSize:'0.78rem' }}>
                    <span style={{ background:'#d97706', color:'#fff', borderRadius:4, padding:'1px 6px', fontWeight:600 }}>{t.type}</span>
                    <span>{t.description}</span>
                    {t.date_limite && <span style={{ color:'#dc2626', marginLeft:'auto' }}>↗ {formatDate(t.date_limite)}</span>}
                  </div>
                ))}
              </div>
            )}

            {selected.observations && (
              <div style={{ marginBottom:12, padding:10, background:'#fff7ed', borderRadius:8, fontSize:'0.8rem', color:'#92400e' }}>
                ⚠️ <strong>Observations :</strong> {selected.observations}
              </div>
            )}

            {/* Signatures */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontWeight:600, fontSize:'0.82rem', marginBottom:8 }}>✍️ Signatures</div>
              <div style={{ display:'flex', gap:10 }}>
                {['delegue','enseignant'].map(type => {
                  const sig = selected.signatures?.find(s=>s.type_signataire===type);
                  return (
                    <div key={type} style={{ flex:1, border:'1px solid', borderColor: sig?'#16a34a':'#e2e8f0', borderRadius:8, padding:10 }}>
                      <div style={{ fontSize:'0.72rem', color:'#64748b', marginBottom:6, fontWeight:600 }}>
                        {type === 'delegue' ? '🎓 DÉLÉGUÉ' : '👨‍🏫 ENSEIGNANT'}
                      </div>
                      {sig ? (
                        <div>
                          <img src={sig.signature_base64} alt="signature" style={{ maxWidth:'100%', maxHeight:60, border:'1px solid #e2e8f0', borderRadius:4 }} />
                          <div style={{ fontSize:'0.68rem', color:'#16a34a', marginTop:4 }}>✓ {new Date(sig.horodatage).toLocaleString('fr-FR')}</div>
                        </div>
                      ) : <div style={{ color:'#94a3b8', fontSize:'0.75rem' }}>Non signé</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions signature */}
            {selected.statut !== 'cloture' && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {user.role==='delegue' && !selected.signatures?.find(s=>s.type_signataire==='delegue') && (
                  showSign === 'delegue'
                    ? <SignaturePad label="Votre signature (délégué)" onSave={sig => signer(selected.id,'delegue',sig)} />
                    : <button onClick={() => setShowSign('delegue')} style={{ padding:'9px', background:'#7c3aed', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:'0.85rem' }}>✍️ Signer en tant que délégué</button>
                )}
                {user.role==='enseignant' && selected.statut==='signe_delegue' && (
                  showSign === 'cloture'
                    ? <SignaturePad label="Votre signature (enseignant) + Clôture" onSave={sig => signer(selected.id,'cloture',sig)} />
                    : <button onClick={() => setShowSign('cloture')} style={{ padding:'9px', background:'#dc2626', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:'0.85rem' }}>🔒 Clôturer et signer</button>
                )}
              </div>
            )}
            {selected.statut === 'cloture' && (
              <div style={{ textAlign:'center', padding:12, background:'#dcfce7', borderRadius:8, color:'#15803d', fontWeight:600, fontSize:'0.85rem' }}>✅ Séance clôturée</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
