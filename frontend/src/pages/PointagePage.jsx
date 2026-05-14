import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';

export default function PointagePage() {
  const { user }   = useAuth();
  const { success, error } = useNotif();

  const [mode,        setMode]        = useState('camera');
  const [scanning,    setScanning]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [result,      setResult]      = useState(null);
  const [tokenManuel, setTokenManuel] = useState('');
  const [seances,     setSeances]     = useState([]);
  const [cameraError, setCameraError] = useState('');
  const [scannerReady, setScannerReady] = useState(false);

  const instanceRef = useRef(null);
  const readerBoxId = 'qr-reader-box-' + Date.now();

  useEffect(() => {
    if (user.role !== 'enseignant' || !user.id_lien) return;
    api.get('/emploi-temps')
      .then(d => {
        const crs = d
          .filter(et => et.statut_publication === 'publie')
          .flatMap(et => (et.creneaux || [])
            .filter(c => c.id_enseignant == user.id_lien)
            .map(c => ({ ...c, classe: et.classe_libelle }))
          );
        setSeances(crs);
      }).catch(() => {});
  }, [user]);

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  const stopScanner = async () => {
    if (instanceRef.current) {
      try {
        const Html5Qrcode = (await import('html5-qrcode')).Html5Qrcode;
        const state = instanceRef.current.getState();
        if (state === 2) await instanceRef.current.stop();
      } catch (_) {}
      instanceRef.current = null;
    }
    setScanning(false);
    setScannerReady(false);
  };

  const startScanner = async () => {
    setCameraError('');
    setResult(null);

    // Vérifier que la caméra est disponible
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Votre navigateur ne supporte pas la caméra. Utilisez Chrome ou Firefox.');
      return;
    }

    // Vérifier permission caméra d'abord
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop()); // libérer immédiatement
    } catch (e) {
      setCameraError(
        e.name === 'NotAllowedError'
          ? 'Permission caméra refusée. Allez dans les paramètres de votre navigateur et autorisez la caméra.'
          : e.name === 'NotFoundError'
          ? 'Aucune caméra détectée sur cet appareil.'
          : 'Caméra inaccessible : ' + (e.message || e.name)
      );
      return;
    }

    setScanning(true);
    await new Promise(r => setTimeout(r, 300)); // attendre le DOM

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-scan-region');
      instanceRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decoded) => {
          stopScanner();
          handleQRResult(decoded);
        },
        () => {}
      );
      setScannerReady(true);
    } catch(e) {
      setScanning(false);
      setCameraError('Impossible de démarrer le scanner : ' + (e.message || String(e)));
    }
  };

  const handleQRResult = (text) => {
    let token = text;
    try {
      const parsed = JSON.parse(text);
      token = parsed.token || text;
    } catch (_) {}
    doPointage(token);
  };

  const doPointage = async (token) => {
    if (!token?.trim()) { error('Token vide'); return; }
    setLoading(true);
    try {
      const data = await api.post('/pointages', { token_qr: token.trim() });
      setResult(data);
      success(data.statut === 'ok' ? 'Pointage enregistré !' : 'Pointage enregistré avec retard');
    } catch(e) {
      error(e.message);
    } finally { setLoading(false); }
  };

  const reset = () => { setResult(null); setTokenManuel(''); setCameraError(''); };

  // ── Résultat ──
  if (result) {
    const ok = result.statut === 'ok';
    return (
      <div style={{ maxWidth:480, margin:'0 auto', padding:'20px 0' }}>
        <div style={{
          borderRadius:16, padding:32, textAlign:'center',
          background: ok ? '#F0FDF4' : '#FFFBEB',
          border: '3px solid ' + (ok ? '#059669' : '#D97706'),
        }}>
          <div style={{ fontSize:'4rem', marginBottom:12 }}>{ok ? '✅' : '⏰'}</div>
          <h2 style={{ margin:'0 0 8px', color: ok ? '#059669' : '#D97706', fontSize:'1.3rem', fontWeight:800 }}>
            {ok ? 'Présence enregistrée !' : 'Retard signalé'}
          </h2>
          <div style={{ background:'#fff', borderRadius:10, padding:16, margin:'16px 0', textAlign:'left' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:'0.85rem' }}>
              {[['Matière', result.creneau?.matiere], ['Classe', result.creneau?.classe], ['Salle', result.creneau?.salle], ['Heure', result.heure_pointage]].map(([k,v]) => (
                <div key={k} style={{ background:'#F8FAFC', borderRadius:8, padding:'8px 12px' }}>
                  <div style={{ fontSize:'0.68rem', color:'#94A3B8', marginBottom:2 }}>{k.toUpperCase()}</div>
                  <div style={{ fontWeight:700 }}>{v || '-'}</div>
                </div>
              ))}
            </div>
            {result.retard_minutes > 0 && (
              <div style={{ marginTop:10, background:'#FEF3C7', borderRadius:8, padding:'8px 12px', color:'#D97706', fontWeight:600, fontSize:'0.85rem', textAlign:'center' }}>
                ⏱ Retard de {result.retard_minutes} minute(s)
              </div>
            )}
          </div>
          <button onClick={reset} className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }}>
            Nouveau pointage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:520, margin:'0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">📱 Pointage QR-Code</h1>
          <p className="page-sub">Scannez le QR code affiché en salle</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom:20 }}>
        {[['camera','📷 Scanner'], ['manuel','⌨️ Manuel']].map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); stopScanner(); setCameraError(''); }}
            className={'tab ' + (mode === m ? 'tab-active' : 'tab-inactive')}>
            {label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding:24, marginBottom:20 }}>

        {/* ── Mode Caméra ── */}
        {mode === 'camera' && (
          <div>
            {!scanning ? (
              <div style={{ textAlign:'center', padding:'10px 0' }}>
                <div style={{ fontSize:'4rem', marginBottom:16, opacity:0.8 }}>📷</div>
                <p style={{ color:'var(--text-2)', fontSize:'0.85rem', marginBottom:20, lineHeight:1.6 }}>
                  Activez la caméra et pointez-la vers le QR code affiché dans la salle de cours.
                </p>
                {cameraError && (
                  <div className="alert alert-danger" style={{ marginBottom:16, textAlign:'left', borderRadius:10 }}>
                    ⚠️ {cameraError}
                  </div>
                )}
                <button onClick={startScanner} className="btn btn-primary btn-lg" style={{ width:'100%', justifyContent:'center' }}>
                  📷 Activer la caméra
                </button>
                <p style={{ color:'var(--text-4)', fontSize:'0.74rem', marginTop:10 }}>
                  Autorisez l'accès à la caméra si votre navigateur le demande
                </p>
              </div>
            ) : (
              <div>
                <p style={{ textAlign:'center', color:'var(--text-2)', fontSize:'0.82rem', marginBottom:12 }}>
                  📷 Pointez vers le QR code...
                </p>
                {/* Zone scanner — ID fixe */}
                <div style={{ position:'relative', maxWidth:300, margin:'0 auto 16px' }}>
                  <div id="qr-scan-region" style={{ width:'100%', borderRadius:12, overflow:'hidden', border:'3px solid var(--primary)' }}></div>
                  {/* Cadre de visée */}
                  {scannerReady && (
                    <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:180, height:180, border:'3px solid #22C55E', borderRadius:10, pointerEvents:'none', boxShadow:'0 0 0 2000px rgba(0,0,0,0.35)' }}>
                      {/* Coins du cadre */}
                      {[['0,0','top,left'],['0,auto','top,right'],['auto,0','bottom,left'],['auto,auto','bottom,right']].map(([pos, corners], i) => {
                        const [t,l,b,r] = [pos.split(',')[0]==='0'?0:'auto', pos.split(',')[1]==='0'?0:'auto', pos.split(',')[0]==='auto'?0:'auto', pos.split(',')[1]==='auto'?0:'auto'];
                        const [ct,cl] = corners.split(',');
                        return <div key={i} style={{ position:'absolute', width:20, height:20, top:t, left:l, bottom:b, right:r, borderTop: ct==='top'?'3px solid #22C55E':'none', borderBottom: ct==='bottom'?'3px solid #22C55E':'none', borderLeft: cl==='left'?'3px solid #22C55E':'none', borderRight: cl==='right'?'3px solid #22C55E':'none' }} />;
                      })}
                    </div>
                  )}
                </div>
                <button onClick={stopScanner} className="btn btn-danger" style={{ width:'100%', justifyContent:'center' }}>
                  ⏹ Arrêter
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Mode Manuel ── */}
        {mode === 'manuel' && (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'3rem', marginBottom:14, opacity:0.7 }}>⌨️</div>
            <label className="label" style={{ textAlign:'left', display:'block', marginBottom:8 }}>
              Token QR de la séance
            </label>
            <textarea
              value={tokenManuel}
              onChange={e => setTokenManuel(e.target.value)}
              placeholder="Collez ici le token fourni par l'administration..."
              rows={4}
              style={{ width:'100%', padding:'10px 14px', border:'2px solid var(--border)', borderRadius:10, fontSize:'0.85rem', marginBottom:14, boxSizing:'border-box', resize:'vertical', fontFamily:'monospace', outline:'none' }}
              onFocus={e => { e.target.style.borderColor='var(--primary)'; }}
              onBlur={e  => { e.target.style.borderColor='var(--border)'; }}
            />
            <button onClick={() => doPointage(tokenManuel)} disabled={loading || !tokenManuel.trim()}
              className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:13 }}>
              {loading ? '⏳ Validation...' : '✓ Valider le pointage'}
            </button>
          </div>
        )}
      </div>

      {/* Séances de l'enseignant */}
      {seances.length > 0 && (
        <div className="card" style={{ padding:20 }}>
          <h3 className="section-title">📅 Mes séances</h3>
          {seances.map((s, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom: i < seances.length-1 ? '1px solid var(--border-l)' : 'none' }}>
              <div>
                <div style={{ fontWeight:600, fontSize:'0.85rem' }}>{s.matiere}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:2 }}>
                  {s.classe} · {s.jour} {s.heure_debut?.slice(0,5)}-{s.heure_fin?.slice(0,5)}
                </div>
              </div>
              <span className={'badge ' + (s.qr_token ? 'badge-success' : 'badge-gray')}>
                {s.qr_token ? '📱 QR actif' : '🔒 Sans QR'}
              </span>
            </div>
          ))}
        </div>
      )}

      {user.role !== 'enseignant' && (
        <div className="alert alert-warning" style={{ borderRadius:10 }}>
          ⚠️ Cette page est réservée aux enseignants pour pointer leur présence.
        </div>
      )}
    </div>
  );
}
