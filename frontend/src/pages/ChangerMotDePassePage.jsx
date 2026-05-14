import { useState, useCallback, useRef } from 'react';
import { api } from '../utils/api';
import { useNotif } from '../context/NotifContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// Indicateur de force — composant stable sans re-render du parent
function StrengthBar({ password }) {
  if (!password) return null;
  const score =
    (password.length >= 6  ? 1 : 0) +
    (password.length >= 10 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^a-zA-Z0-9]/.test(password) ? 1 : 0);

  const labels = ['Très faible','Faible','Moyen','Fort','Très fort'];
  const colors = ['#DC2626','#EA580C','#D97706','#16A34A','#059669'];
  const color  = colors[score - 1] || '#E2E8F0';

  const checks = [
    { ok: password.length >= 6,          label: '6+ chars' },
    { ok: /[A-Z]/.test(password),        label: 'Majuscule' },
    { ok: /[0-9]/.test(password),        label: 'Chiffre' },
    { ok: /[^a-zA-Z0-9]/.test(password), label: 'Symbole' },
  ];

  return (
    <div style={{ marginTop:8 }}>
      <div style={{ display:'flex', gap:3, marginBottom:5 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex:1, height:4, borderRadius:99, transition:'background 0.3s',
            background: i <= score ? color : '#E2E8F0' }} />
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:4 }}>
        <span style={{ fontSize:'0.72rem', fontWeight:700, color: score > 0 ? color : '#94A3B8' }}>
          {score > 0 ? labels[score - 1] : ''}
        </span>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {checks.map(c => (
            <span key={c.label} style={{ fontSize:'0.65rem', padding:'1px 7px', borderRadius:99, fontWeight:500,
              background: c.ok ? '#D1FAE5' : '#F1F5F9',
              color:      c.ok ? '#059669' : '#94A3B8' }}>
              {c.ok ? '✓ ' : ''}{c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChangerMotDePassePage() {
  const { user }   = useAuth();
  const { success, error } = useNotif();
  const navigate   = useNavigate();

  // Utiliser useRef pour les valeurs — évite le re-render qui perd le focus
  const ancienRef   = useRef('');
  const nouveauRef  = useRef('');
  const confirmerRef = useRef('');

  // State minimal pour l'UI réactive
  const [nouveauVal,  setNouveauVal]  = useState('');
  const [confirmerVal, setConfirmerVal] = useState('');
  const [show,   setShow]   = useState({ ancien:false, nouveau:false, confirmer:false });
  const [saving, setSaving] = useState(false);
  const [done,   setDone]   = useState(false);

  const toggleShow = useCallback((k) => {
    setShow(prev => Object.assign({}, prev, { [k]: !prev[k] }));
  }, []);

  const save = useCallback(async () => {
    const ancien    = ancienRef.current;
    const nouveau   = nouveauRef.current;
    const confirmer = confirmerRef.current;

    if (!ancien || !nouveau || !confirmer) { error('Tous les champs sont requis'); return; }
    if (nouveau.length < 6) { error('Minimum 6 caractères requis'); return; }
    if (nouveau !== confirmer) { error('Les mots de passe ne correspondent pas'); return; }

    setSaving(true);
    try {
      await api.post('/utilisateurs?action=changer-mdp', {
        ancien_mdp:  ancien,
        nouveau_mdp: nouveau,
      });
      setDone(true);
      success('Mot de passe changé avec succès !');
    } catch(e) { error(e.message); }
    finally { setSaving(false); }
  }, [error, success]);

  // Navigation clavier — Entrée pour passer au champ suivant
  const handleKey = useCallback((e, next) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (next) document.getElementById(next)?.focus();
      else save();
    }
  }, [save]);

  if (done) return (
    <div style={{ maxWidth:420, margin:'40px auto' }}>
      <div className="card" style={{ padding:40, textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'#D1FAE5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.2rem', margin:'0 auto 20px' }}>✓</div>
        <h2 style={{ fontWeight:800, marginBottom:8 }}>Mot de passe changé !</h2>
        <p style={{ color:'var(--text-2)', fontSize:'0.85rem', marginBottom:28 }}>Votre mot de passe a été mis à jour avec succès.</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginBottom:8 }}>
          ← Retour au tableau de bord
        </button>
        <button onClick={() => { setDone(false); setNouveauVal(''); setConfirmerVal(''); ancienRef.current=''; nouveauRef.current=''; confirmerRef.current=''; }}
          className="btn btn-ghost" style={{ width:'100%', justifyContent:'center' }}>
          Changer à nouveau
        </button>
      </div>
    </div>
  );

  const match = nouveauVal && confirmerVal && nouveauVal === confirmerVal;
  const mismatch = nouveauVal && confirmerVal && nouveauVal !== confirmerVal;
  const canSubmit = ancienRef.current && nouveauVal.length >= 6 && match && !saving;

  return (
    <div style={{ maxWidth:500, margin:'0 auto', paddingTop:8 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">🔐 Changer mon mot de passe</h1>
          <p className="page-sub">{user?.nom} · {user?.role}</p>
        </div>
        <Link to="/dashboard" className="btn btn-ghost btn-sm">← Retour</Link>
      </div>

      <div className="card" style={{ padding:28 }}>
        <p style={{ fontSize:'0.8rem', color:'var(--text-3)', marginBottom:20, padding:'8px 12px', background:'var(--primary-l)', borderRadius:8, color:'var(--primary)' }}>
          💡 Appuyez sur <strong>Entrée</strong> pour passer d'un champ à l'autre
        </p>

        {/* Champ: Ancien mot de passe */}
        <div style={{ marginBottom:18 }}>
          <label className="label" htmlFor="inp-ancien">Mot de passe actuel</label>
          <div style={{ position:'relative' }}>
            <input
              id="inp-ancien"
              type={show.ancien ? 'text' : 'password'}
              defaultValue=""
              onChange={e => { ancienRef.current = e.target.value; }}
              onKeyDown={e => handleKey(e, 'inp-nouveau')}
              className="input"
              placeholder="Votre mot de passe actuel"
              style={{ paddingRight:46 }}
              autoComplete="current-password"
              autoFocus
            />
            <button type="button" onClick={() => toggleShow('ancien')}
              style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', fontSize:'1.1rem', padding:0 }}>
              {show.ancien ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <div style={{ borderTop:'1px solid var(--border)', margin:'20px 0' }} />

        {/* Champ: Nouveau mot de passe */}
        <div style={{ marginBottom:18 }}>
          <label className="label" htmlFor="inp-nouveau">Nouveau mot de passe</label>
          <div style={{ position:'relative' }}>
            <input
              id="inp-nouveau"
              type={show.nouveau ? 'text' : 'password'}
              defaultValue=""
              onChange={e => { nouveauRef.current = e.target.value; setNouveauVal(e.target.value); }}
              onKeyDown={e => handleKey(e, 'inp-confirmer')}
              className="input"
              placeholder="Au moins 6 caractères"
              style={{ paddingRight:46 }}
              autoComplete="new-password"
            />
            <button type="button" onClick={() => toggleShow('nouveau')}
              style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', fontSize:'1.1rem', padding:0 }}>
              {show.nouveau ? '🙈' : '👁'}
            </button>
          </div>
          <StrengthBar password={nouveauVal} />
        </div>

        {/* Champ: Confirmer */}
        <div style={{ marginBottom:20 }}>
          <label className="label" htmlFor="inp-confirmer">Confirmer le nouveau mot de passe</label>
          <div style={{ position:'relative' }}>
            <input
              id="inp-confirmer"
              type={show.confirmer ? 'text' : 'password'}
              defaultValue=""
              onChange={e => { confirmerRef.current = e.target.value; setConfirmerVal(e.target.value); }}
              onKeyDown={e => handleKey(e, null)}
              className="input"
              placeholder="Répétez le nouveau mot de passe"
              style={{ paddingRight:46, borderColor: mismatch ? '#DC2626' : match ? '#059669' : undefined }}
              autoComplete="new-password"
            />
            <button type="button" onClick={() => toggleShow('confirmer')}
              style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', fontSize:'1.1rem', padding:0 }}>
              {show.confirmer ? '🙈' : '👁'}
            </button>
          </div>
          {(match || mismatch) && (
            <div style={{ marginTop:6, fontSize:'0.78rem', fontWeight:600, color: match ? '#059669' : '#DC2626', display:'flex', alignItems:'center', gap:4 }}>
              {match ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
            </div>
          )}
        </div>

        {/* Boutons */}
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={save} disabled={!canSubmit} className="btn btn-primary"
            style={{ flex:1, justifyContent:'center', padding:'12px', opacity: canSubmit ? 1 : 0.5 }}>
            {saving ? (
              <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }} />
                Enregistrement...
              </span>
            ) : '🔐 Changer le mot de passe'}
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost">Annuler</button>
        </div>
      </div>
    </div>
  );
}
