import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNotif } from '../context/NotifContext';

const API_BASE = 'http://localhost/eduschedulepro/backend/api';

export default function QRCodesPage() {
  const { error } = useNotif();
  const [emplois,  setEmplois]  = useState([]);
  const [classes,  setClasses]  = useState([]);
  const [selected, setSelected] = useState('');
  const [currentET, setCurrentET] = useState(null);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    api.get('/classes').then(d => setClasses(d)).catch(e => error(e.message));
  }, []);

  useEffect(() => {
    if (!selected) { setEmplois([]); setCurrentET(null); return; }
    setLoading(true);
    api.get('/emploi-temps?id_classe=' + selected)
      .then(d => {
        const publies = d.filter(e => e.statut_publication === 'publie');
        setEmplois(publies);
        setCurrentET(publies[0] || null);
      })
      .catch(e => error(e.message))
      .finally(() => setLoading(false));
  }, [selected]);

  const qrUrl = (creneau) =>
    API_BASE + '/creneaux.php?id=' + creneau.id + '&action=qr';

  const printAll = () => window.print();

  const creneaux = currentET?.creneaux?.filter(c => c.qr_token) || [];

  return (
    <div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .qr-card { break-inside: avoid; page-break-inside: avoid; }
          body { background: white; }
        }
      `}</style>

      {/* Header */}
      <div className="no-print" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ margin:0, fontSize:'1.4rem', fontWeight:800, color:'#0f172a' }}>🖨️ QR Codes des Séances</h1>
          <p style={{ color:'#64748b', fontSize:'0.85rem', marginTop:4 }}>
            Imprimez et affichez ces QR codes dans les salles de cours
          </p>
        </div>
        {creneaux.length > 0 && (
          <button onClick={printAll}
            style={{ background:'#1d4ed8', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontSize:'0.9rem' }}>
            🖨️ Imprimer tout
          </button>
        )}
      </div>

      {/* Sélecteur */}
      <div className="no-print" style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:200 }}>
          <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#374151', marginBottom:6 }}>Classe</label>
          <select value={selected} onChange={e => setSelected(e.target.value)}
            style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.85rem' }}>
            <option value="">-- Choisir une classe --</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.code} — {c.libelle}</option>)}
          </select>
        </div>
        {emplois.length > 1 && (
          <div style={{ flex:1, minWidth:200 }}>
            <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#374151', marginBottom:6 }}>Semaine</label>
            <select value={currentET?.id || ''} onChange={e => setCurrentET(emplois.find(et => et.id == e.target.value))}
              style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.85rem' }}>
              {emplois.map(et => (
                <option key={et.id} value={et.id}>
                  Semaine du {new Date(et.semaine_debut + 'T12:00:00').toLocaleDateString('fr-FR')}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Message si pas de sélection */}
      {!selected && (
        <div style={{ textAlign:'center', padding:60, background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', color:'#94a3b8' }}>
          <div style={{ fontSize:'3rem', marginBottom:12 }}>📋</div>
          <p style={{ fontSize:'1rem', fontWeight:600 }}>Sélectionnez une classe</p>
          <p style={{ fontSize:'0.85rem' }}>Les QR codes des créneaux publiés s'afficheront ici</p>
        </div>
      )}

      {/* Message si aucun ET publié */}
      {selected && !loading && emplois.length === 0 && (
        <div style={{ textAlign:'center', padding:40, background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', color:'#94a3b8' }}>
          <div style={{ fontSize:'2rem', marginBottom:8 }}>⚠️</div>
          <p style={{ fontWeight:600 }}>Aucun emploi du temps publié pour cette classe</p>
          <p style={{ fontSize:'0.85rem' }}>Publiez d'abord un emploi du temps pour générer les QR codes</p>
        </div>
      )}

      {loading && (
        <div style={{ textAlign:'center', padding:40, color:'#64748b' }}>⏳ Chargement...</div>
      )}

      {/* Grille QR codes */}
      {creneaux.length > 0 && (
        <>
          <div className="no-print" style={{ marginBottom:16, padding:'10px 16px', background:'#dbeafe', borderRadius:8, fontSize:'0.85rem', color:'#1d4ed8', fontWeight:500 }}>
            ✅ {creneaux.length} QR code(s) disponibles — Emploi du temps de {currentET?.classe_libelle}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 }}>
            {creneaux.map((cr, i) => (
              <div key={cr.id} className="qr-card" style={{
                background:'#fff', borderRadius:12, padding:20, boxShadow:'0 2px 8px rgba(0,0,0,0.1)',
                border:'2px solid #e2e8f0', textAlign:'center',
              }}>
                {/* En-tête carte */}
                <div style={{ background:'#0f172a', borderRadius:8, padding:'10px 14px', marginBottom:14 }}>
                  <div style={{ color:'#fff', fontWeight:800, fontSize:'0.95rem' }}>EduSchedule Pro</div>
                  <div style={{ color:'#94a3b8', fontSize:'0.72rem' }}>ISGE — Pointage Séance</div>
                </div>

                {/* Infos séance */}
                <div style={{ marginBottom:14, textAlign:'left' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:'0.8rem' }}>
                    <div style={{ background:'#f8fafc', borderRadius:6, padding:'6px 10px' }}>
                      <div style={{ color:'#94a3b8', fontSize:'0.68rem', marginBottom:2 }}>MATIÈRE</div>
                      <div style={{ fontWeight:700, color:'#0f172a' }}>{cr.mat_code || cr.matiere?.slice(0,15)}</div>
                    </div>
                    <div style={{ background:'#f8fafc', borderRadius:6, padding:'6px 10px' }}>
                      <div style={{ color:'#94a3b8', fontSize:'0.68rem', marginBottom:2 }}>JOUR</div>
                      <div style={{ fontWeight:700, color:'#0f172a', textTransform:'capitalize' }}>{cr.jour}</div>
                    </div>
                    <div style={{ background:'#f8fafc', borderRadius:6, padding:'6px 10px' }}>
                      <div style={{ color:'#94a3b8', fontSize:'0.68rem', marginBottom:2 }}>HORAIRE</div>
                      <div style={{ fontWeight:700, color:'#0f172a' }}>{cr.heure_debut?.slice(0,5)} – {cr.heure_fin?.slice(0,5)}</div>
                    </div>
                    <div style={{ background:'#f8fafc', borderRadius:6, padding:'6px 10px' }}>
                      <div style={{ color:'#94a3b8', fontSize:'0.68rem', marginBottom:2 }}>SALLE</div>
                      <div style={{ fontWeight:700, color:'#0f172a' }}>{cr.salle_code || cr.salle}</div>
                    </div>
                  </div>
                  <div style={{ background:'#f8fafc', borderRadius:6, padding:'6px 10px', marginTop:8, fontSize:'0.8rem' }}>
                    <div style={{ color:'#94a3b8', fontSize:'0.68rem', marginBottom:2 }}>ENSEIGNANT</div>
                    <div style={{ fontWeight:600, color:'#0f172a' }}>{cr.prenom} {cr.nom}</div>
                  </div>
                </div>

                {/* Image QR */}
                <div style={{ background:'#f8fafc', borderRadius:8, padding:12, marginBottom:12, display:'inline-block', width:'100%' }}>
                  <img
                    src={qrUrl(cr)}
                    alt={'QR ' + cr.matiere}
                    style={{ width:160, height:160, display:'block', margin:'0 auto', imageRendering:'pixelated' }}
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
                  />
                  <div style={{ display:'none', color:'#dc2626', fontSize:'0.75rem', padding:10 }}>
                    ⚠️ QR non disponible — vérifiez que le backend est actif
                  </div>
                </div>

                {/* Token visible */}
                <div style={{ background:'#f1f5f9', borderRadius:6, padding:'6px 10px', fontSize:'0.65rem', color:'#64748b', wordBreak:'break-all', marginBottom:10 }}>
                  <strong>Token :</strong> {cr.qr_token?.slice(0, 32)}...
                </div>

                {/* Bouton télécharger */}
                <a href={qrUrl(cr)} download={'QR_' + cr.jour + '_' + cr.heure_debut?.slice(0,5) + '.png'}
                  className="no-print"
                  style={{ display:'block', background:'#1d4ed8', color:'#fff', borderRadius:6, padding:'7px', fontSize:'0.8rem', fontWeight:600, textDecoration:'none' }}>
                  ⬇️ Télécharger ce QR
                </a>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Message si ET publié mais aucun QR */}
      {!loading && currentET && creneaux.length === 0 && emplois.length > 0 && (
        <div style={{ textAlign:'center', padding:40, background:'#fff', borderRadius:12, color:'#94a3b8' }}>
          <p>Aucun créneau avec QR actif dans cet emploi du temps.</p>
        </div>
      )}
    </div>
  );
}
