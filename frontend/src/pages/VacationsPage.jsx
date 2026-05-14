import { useState, useEffect, useRef } from 'react';
import { api, formatMoney, formatDate } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';

function SignaturePad({ onSave, label }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const getPos = (e, c) => { const r=c.getBoundingClientRect(), t=e.touches?e.touches[0]:e; return {x:t.clientX-r.left,y:t.clientY-r.top}; };
  const start = (e) => { e.preventDefault(); const c=canvasRef.current,ctx=c.getContext('2d'),p=getPos(e,c); ctx.beginPath(); ctx.moveTo(p.x,p.y); setDrawing(true); };
  const draw = (e) => { if(!drawing) return; e.preventDefault(); const c=canvasRef.current,ctx=c.getContext('2d'); ctx.lineWidth=2; ctx.lineCap='round'; ctx.strokeStyle='#1d4ed8'; const p=getPos(e,c); ctx.lineTo(p.x,p.y); ctx.stroke(); setHasDrawn(true); };
  const stop = (e) => { e.preventDefault(); setDrawing(false); };
  return (
    <div style={{ border:'2px solid #e2e8f0', borderRadius:8, padding:12, background:'#f8fafc', marginTop:12 }}>
      <p style={{ margin:'0 0 6px', fontSize:'0.8rem', fontWeight:600 }}>{label}</p>
      <canvas ref={canvasRef} width={380} height={100} style={{ border:'1px solid #cbd5e1', borderRadius:6, background:'#fff', width:'100%', touchAction:'none', cursor:'crosshair' }}
        onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop} onTouchStart={start} onTouchMove={draw} onTouchEnd={stop} />
      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        <button onClick={() => { canvasRef.current.getContext('2d').clearRect(0,0,380,100); setHasDrawn(false); }} style={{ padding:'5px 12px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:6, cursor:'pointer', fontSize:'0.78rem' }}>Effacer</button>
        <button onClick={() => hasDrawn && onSave(canvasRef.current.toDataURL())} disabled={!hasDrawn}
          style={{ padding:'5px 12px', background:hasDrawn?'#1d4ed8':'#94a3b8', color:'#fff', border:'none', borderRadius:6, cursor:hasDrawn?'pointer':'not-allowed', fontSize:'0.78rem', fontWeight:600 }}>
          Valider
        </button>
      </div>
    </div>
  );
}

const MOIS = ['','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const STATUT_INFO = {
  generee:            { label:'Générée',          color:'#f1f5f9', text:'#64748b' },
  signee_enseignant:  { label:'Signée Enseignant', color:'#dbeafe', text:'#1d4ed8' },
  visee_surveillant:  { label:'Visée Surveillant', color:'#fef3c7', text:'#d97706' },
  approuvee_comptable:{ label:'Approuvée ✅',      color:'#dcfce7', text:'#16a34a' },
};

export default function VacationsPage() {
  const { user } = useAuth();
  const { success, error } = useNotif();
  const [vacations, setVacations] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genForm, setGenForm] = useState({ id_enseignant:'', mois: new Date().getMonth()+1, annee: new Date().getFullYear() });
  const [showGen, setShowGen] = useState(false);
  const [showSign, setShowSign] = useState(false);
  const [commentaire, setCommentaire] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/vacations').then(d => setVacations(d)).catch(e => error(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    if (user.role === 'admin' || user.role === 'surveillant' || user.role === 'comptable') {
      api.get('/enseignants').then(d => setEnseignants(d)).catch(() => {});
    }
  }, []);

  const loadDetail = async (id) => {
    try { const d = await api.get('/vacations?id='+id); setSelected(d); setShowSign(false); setCommentaire(''); } catch(e) { error(e.message); }
  };

  const generer = async () => {
    if (!genForm.id_enseignant) { error('Enseignant requis'); return; }
    setSaving(true);
    try {
      await api.post('/vacations?action=generer', genForm);
      success('Fiche générée !');
      setShowGen(false);
      load();
    } catch(e) { error(e.message); }
    finally { setSaving(false); }
  };

  const valider = async (sig) => {
    if (!selected) return;
    setSaving(true);
    try {
      if (user.role === 'enseignant') {
        await api.post('/vacations?id='+selected.id+'&action=signer', { visa_base64: sig });
        success('Fiche signée !');
      } else if (user.role === 'surveillant') {
        await api.post('/vacations?id='+selected.id+'&action=valider', { visa_base64: sig, commentaire });
        success('Visa apposé !');
      } else if (user.role === 'comptable') {
        await api.post('/vacations?id='+selected.id+'&action=approuver', { commentaire });
        success('Fiche approuvée !');
      }
      setShowSign(false);
      load();
      loadDetail(selected.id);
    } catch(e) { error(e.message); }
    finally { setSaving(false); }
  };

  const canSign = () => {
    if (!selected) return false;
    if (user.role === 'enseignant' && selected.statut === 'generee') return true;
    if (user.role === 'surveillant' && selected.statut === 'signee_enseignant') return true;
    if (user.role === 'comptable' && selected.statut === 'visee_surveillant') return true;
    return false;
  };

  const btnLabel = { enseignant:'✍️ Signer la fiche', surveillant:'🔍 Apposer le visa', comptable:'✅ Approuver et valider' };

  const printPDF = () => {
    if (!selected) return;
    const win = window.open('','_blank');
    win.document.write('<html><head><title>Fiche Vacation '+selected.nom+' '+selected.prenom+'</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccc;padding:8px;font-size:13px}th{background:#f1f5f9}h1{font-size:18px}h2{font-size:14px;border-bottom:2px solid #1d4ed8;padding-bottom:4px}footer{margin-top:40px;display:flex;justify-content:space-between}</style></head><body>');
    win.document.write('<h1>FICHE DE VACATION — '+MOIS[selected.mois]+' '+selected.annee+'</h1>');
    win.document.write('<h2>Enseignant : '+selected.prenom+' '+selected.nom+' ('+selected.matricule+')</h2>');
    win.document.write('<table><tr><th>Jour</th><th>Matière</th><th>Classe</th><th>Heure début</th><th>Heure fin</th><th>Durée (h)</th><th>Taux (FCFA)</th><th>Montant</th></tr>');
    (selected.lignes||[]).forEach(l => {
      win.document.write('<tr><td>'+l.jour+'</td><td>'+l.matiere+'</td><td>'+l.classe+'</td><td>'+l.heure_debut?.slice(0,5)+'</td><td>'+l.heure_fin?.slice(0,5)+'</td><td>'+l.duree_heures+'</td><td>'+Number(l.taux).toLocaleString('fr-FR')+'</td><td>'+Number(l.montant).toLocaleString('fr-FR')+'</td></tr>');
    });
    win.document.write('<tr style="font-weight:bold"><td colspan="5" style="text-align:right">TOTAL</td><td>'+selected.lignes?.reduce((a,l)=>a+parseFloat(l.duree_heures),0).toFixed(2)+'h</td><td></td><td>'+Number(selected.montant_net).toLocaleString('fr-FR')+' FCFA</td></tr>');
    win.document.write('</table><footer><div><strong>Signature Enseignant</strong><br/><br/></div><div><strong>Visa Surveillant</strong><br/><br/></div><div><strong>Approbation Comptable</strong><br/><br/></div></footer>');
    win.document.write('</body></html>');
    win.document.close(); win.print();
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:'1.4rem', fontWeight:800, color:'#0f172a' }}>💰 Fiches de Vacation</h1>
        {(user.role==='admin'||user.role==='surveillant') && (
          <button onClick={() => setShowGen(!showGen)} style={{ background:'#1d4ed8', color:'#fff', border:'none', borderRadius:8, padding:'9px 18px', fontWeight:600, cursor:'pointer', fontSize:'0.85rem' }}>
            {showGen ? '✕ Fermer' : '+ Générer une fiche'}
          </button>
        )}
      </div>

      {showGen && (
        <div style={{ background:'#fff', borderRadius:12, padding:20, marginBottom:20, boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin:'0 0 14px', fontSize:'1rem', fontWeight:700 }}>Générer une fiche de vacation</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:12, alignItems:'end' }}>
            <div>
              <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, marginBottom:4 }}>Enseignant</label>
              <select value={genForm.id_enseignant} onChange={e => setGenForm({...genForm, id_enseignant:e.target.value})}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.82rem' }}>
                <option value="">Choisir...</option>
                {enseignants.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom} ({e.statut})</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, marginBottom:4 }}>Mois</label>
              <select value={genForm.mois} onChange={e => setGenForm({...genForm, mois:parseInt(e.target.value)})}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.82rem' }}>
                {MOIS.slice(1).map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, marginBottom:4 }}>Année</label>
              <input type="number" value={genForm.annee} onChange={e => setGenForm({...genForm, annee:parseInt(e.target.value)})}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.82rem' }} />
            </div>
            <button onClick={generer} disabled={saving} style={{ padding:'9px 18px', background: saving?'#94a3b8':'#16a34a', color:'#fff', border:'none', borderRadius:8, cursor: saving?'not-allowed':'pointer', fontWeight:700 }}>
              {saving ? '⏳' : '✓ Générer'}
            </button>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 1.8fr' : '1fr', gap:16 }}>
        {/* Liste */}
        <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', overflow:'hidden' }}>
          {loading ? <div style={{ padding:40, textAlign:'center', color:'#64748b' }}>⏳</div>
          : vacations.length === 0 ? <div style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>Aucune fiche disponible</div>
          : vacations.map(v => {
            const si = STATUT_INFO[v.statut] || STATUT_INFO.generee;
            return (
              <div key={v.id} onClick={() => loadDetail(v.id)} style={{
                padding:'14px 16px', borderBottom:'1px solid #f1f5f9', cursor:'pointer',
                background: selected?.id===v.id ? '#eff6ff' : 'transparent',
                borderLeft: selected?.id===v.id ? '3px solid #1d4ed8' : '3px solid transparent',
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontWeight:700, fontSize:'0.85rem' }}>{v.prenom} {v.nom}</span>
                  <span style={{ padding:'2px 8px', borderRadius:20, fontSize:'0.7rem', fontWeight:600, background:si.color, color:si.text }}>{si.label}</span>
                </div>
                <div style={{ fontSize:'0.78rem', color:'#64748b' }}>{MOIS[v.mois]} {v.annee}</div>
                <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#16a34a', marginTop:2 }}>{formatMoney(v.montant_net)}</div>
              </div>
            );
          })}
        </div>

        {/* Détail */}
        {selected && (
          <div style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <h3 style={{ margin:0, fontSize:'1.05rem', fontWeight:800 }}>{selected.prenom} {selected.nom}</h3>
                <p style={{ margin:'2px 0 0', fontSize:'0.78rem', color:'#64748b' }}>Matricule: {selected.matricule} — {MOIS[selected.mois]} {selected.annee}</p>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={printPDF} style={{ padding:'6px 12px', background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:6, cursor:'pointer', fontSize:'0.78rem', fontWeight:600 }}>🖨️ PDF</button>
                <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer', color:'#94a3b8' }}>✕</button>
              </div>
            </div>

            {/* Tableau lignes */}
            <div style={{ overflowX:'auto', marginBottom:14 }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.78rem' }}>
                <thead>
                  <tr style={{ background:'#f8fafc' }}>
                    {['Jour','Matière','Classe','Début','Fin','Durée','Taux','Montant'].map(h => (
                      <th key={h} style={{ padding:'8px 10px', textAlign:'left', fontWeight:600, color:'#64748b', borderBottom:'2px solid #e2e8f0', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(selected.lignes||[]).map((l,i) => (
                    <tr key={i} style={{ borderBottom:'1px solid #f1f5f9' }}>
                      <td style={{ padding:'8px 10px', textTransform:'capitalize' }}>{l.jour}</td>
                      <td style={{ padding:'8px 10px' }}>{l.matiere}</td>
                      <td style={{ padding:'8px 10px', color:'#64748b' }}>{l.classe}</td>
                      <td style={{ padding:'8px 10px' }}>{l.heure_debut?.slice(0,5)}</td>
                      <td style={{ padding:'8px 10px' }}>{l.heure_fin?.slice(0,5)}</td>
                      <td style={{ padding:'8px 10px', fontWeight:600 }}>{l.duree_heures}h</td>
                      <td style={{ padding:'8px 10px', color:'#64748b' }}>{Number(l.taux).toLocaleString('fr-FR')}</td>
                      <td style={{ padding:'8px 10px', fontWeight:700, color:'#16a34a' }}>{Number(l.montant).toLocaleString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background:'#f8fafc', fontWeight:700 }}>
                    <td colSpan={5} style={{ padding:'10px', textAlign:'right', fontSize:'0.85rem' }}>TOTAL</td>
                    <td style={{ padding:'10px' }}>{(selected.lignes||[]).reduce((a,l)=>a+parseFloat(l.duree_heures||0),0).toFixed(2)}h</td>
                    <td></td>
                    <td style={{ padding:'10px', color:'#16a34a', fontSize:'0.9rem' }}>{formatMoney(selected.montant_net)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Résumé */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>
              {[['Montant brut', formatMoney(selected.montant_brut),'#374151'],['Retenues', formatMoney(selected.retenues),'#dc2626'],['Net à payer', formatMoney(selected.montant_net),'#16a34a']].map(([l,v,c]) => (
                <div key={l} style={{ background:'#f8fafc', borderRadius:8, padding:12, textAlign:'center' }}>
                  <div style={{ fontSize:'0.7rem', color:'#94a3b8', marginBottom:4 }}>{l}</div>
                  <div style={{ fontSize:'1rem', fontWeight:800, color:c }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Validations */}
            {(selected.validations||[]).length > 0 && (
              <div style={{ marginBottom:14 }}>
                <div style={{ fontWeight:600, fontSize:'0.82rem', marginBottom:8 }}>📋 Historique des validations</div>
                {selected.validations.map((v,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'#f8fafc', borderRadius:8, marginBottom:6, fontSize:'0.8rem' }}>
                    <div>
                      <span style={{ fontWeight:600, textTransform:'capitalize' }}>{v.role_validateur}</span>
                      <span style={{ color:'#64748b', marginLeft:8 }}>{v.nom_complet}</span>
                      {v.commentaire && <span style={{ color:'#94a3b8', marginLeft:8 }}>— {v.commentaire}</span>}
                    </div>
                    <span style={{ color:'#94a3b8' }}>{new Date(v.date_validation).toLocaleDateString('fr-FR')}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action signature */}
            {canSign() && (
              <div>
                {!showSign ? (
                  <button onClick={() => setShowSign(true)} style={{ width:'100%', padding:'10px', background:'#1d4ed8', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:'0.9rem' }}>
                    {btnLabel[user.role]}
                  </button>
                ) : (
                  <div>
                    {(user.role==='surveillant'||user.role==='comptable') && (
                      <textarea value={commentaire} onChange={e => setCommentaire(e.target.value)}
                        placeholder="Commentaire (optionnel)"
                        style={{ width:'100%', padding:10, borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.82rem', boxSizing:'border-box', marginBottom:8, minHeight:60 }} />
                    )}
                    {user.role !== 'comptable'
                      ? <SignaturePad label="Votre signature" onSave={valider} />
                      : <button onClick={() => valider('')} disabled={saving} style={{ width:'100%', padding:'10px', background:saving?'#94a3b8':'#16a34a', color:'#fff', border:'none', borderRadius:8, cursor:saving?'not-allowed':'pointer', fontWeight:700, marginTop:8 }}>
                          {saving ? '⏳...' : "✅ Confirmer l'approbation"}
                        </button>
                    }
                    <button onClick={() => setShowSign(false)} style={{ width:'100%', padding:'8px', background:'none', border:'1px solid #e2e8f0', borderRadius:8, cursor:'pointer', marginTop:8, fontSize:'0.82rem' }}>Annuler</button>
                  </div>
                )}
              </div>
            )}
            {selected.statut==='approuvee_comptable' && (
              <div style={{ textAlign:'center', padding:14, background:'#dcfce7', borderRadius:8, color:'#15803d', fontWeight:700 }}>✅ Fiche approuvée — Paiement autorisé</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
