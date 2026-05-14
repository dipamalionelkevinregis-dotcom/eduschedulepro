import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Import sécurisé du thème
let useTheme = () => ({ dark: false, toggle: () => {} });
try { useTheme = require('../context/ThemeContext').useTheme; } catch(_) {}
import { useAuth } from '../context/AuthContext';
import { useNotif } from '../context/NotifContext';

const REDIRECT = {
  admin:'dashboard', enseignant:'dashboard', delegue:'dashboard',
  surveillant:'dashboard', comptable:'dashboard', etudiant:'emploi-temps'
};

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { login }  = useAuth();
  const { error, success } = useNotif();
  const navigate   = useNavigate();
  const { dark, toggle } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { error('Veuillez remplir tous les champs'); return; }
    setLoading(true);
    try {
      const user = await login(email, password);
      success('Bienvenue, ' + user.nom + ' !');
      navigate('/' + (REDIRECT[user.role] || 'dashboard'));
    } catch(err) { error(err.message || 'Identifiants incorrects'); }
    finally { setLoading(false); }
  };

  const isMobile = window.innerWidth < 480;

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      background: 'linear-gradient(135deg, #3B0764 0%, #5B21B6 40%, #7C3AED 70%, #A78BFA 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Bouton toggle thème */}
      <button onClick={toggle} title={dark ? 'Mode clair' : 'Mode sombre'}
        style={{
          position:'absolute', top:16, right:16, zIndex:10,
          width:42, height:42, borderRadius:12,
          background: dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.2)',
          border:'1.5px solid rgba(255,255,255,0.3)',
          cursor:'pointer', fontSize:'1.3rem', backdropFilter:'blur(8px)',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform='scale(1.1)'; e.currentTarget.style.background='rgba(255,255,255,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.background= dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.2)'; }}
      >
        {dark ? '☀️' : '🌙'}
      </button>

      {/* Cercles décoratifs en arrière-plan */}
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'rgba(255,255,255,0.04)', top:-100, right:-100 }} />
      <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,0.04)', bottom:-80, left:-80 }} />
      <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.06)', top:'40%', left:'10%' }} />

      {/* Carte de connexion */}
      <div style={{
        width: '100%', maxWidth: 420, position: 'relative', zIndex: 1,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        padding: isMobile ? '28px 20px' : '44px 40px',
        boxShadow: '0 32px 80px rgba(59,7,100,0.4), 0 0 0 1px rgba(255,255,255,0.2)',
      }}>

        {/* Logo et titre */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 20, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #6D28D9, #A78BFA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem',
            boxShadow: '0 12px 32px rgba(109,40,217,0.4)',
          }}>📚</div>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 900, margin: '0 0 6px',
            background: 'linear-gradient(135deg, #3B0764, #7C3AED)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em',
          }}>
            EduSchedule Pro
          </h1>
          <p style={{ color: '#7C3AED', fontSize: '0.82rem', fontWeight: 500, margin: 0 }}>
            ISGE — Gestion Pédagogique 2025-2026
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: 'block', fontSize: '0.8rem', fontWeight: 700,
              color: '#5B21B6', marginBottom: 6, letterSpacing: '0.02em',
            }}>
              Adresse email
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                fontSize: '1rem', color: '#A78BFA',
              }}>✉</span>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.bf" autoComplete="email" autoFocus
                style={{
                  width: '100%', padding: isMobile ? '10px 10px 10px 38px' : '11px 14px 11px 40px',
                  border: '2px solid #DDD6FE', borderRadius: 10,
                  fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none',
                  background: '#FAFAFE', color: '#1E1B4B',
                  transition: 'all 0.15s', boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor='#7C3AED'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.15)'; e.target.style.background='#fff'; }}
                onBlur={e  => { e.target.style.borderColor='#DDD6FE'; e.target.style.boxShadow='none'; e.target.style.background='#FAFAFE'; }}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: 28 }}>
            <label style={{
              display: 'block', fontSize: '0.8rem', fontWeight: 700,
              color: '#5B21B6', marginBottom: 6, letterSpacing: '0.02em',
            }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                fontSize: '1rem', color: '#A78BFA',
              }}>🔒</span>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                style={{
                  width: '100%', padding: '11px 46px 11px 40px',
                  border: '2px solid #DDD6FE', borderRadius: 10,
                  fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none',
                  background: '#FAFAFE', color: '#1E1B4B',
                  transition: 'all 0.15s', boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor='#7C3AED'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.15)'; e.target.style.background='#fff'; }}
                onBlur={e  => { e.target.style.borderColor='#DDD6FE'; e.target.style.boxShadow='none'; e.target.style.background='#FAFAFE'; }}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#A78BFA', fontSize: '1rem', padding: 0,
                }}>
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Bouton connexion */}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px',
            background: loading
              ? '#C4B5FD'
              : 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 50%, #8B5CF6 100%)',
            color: '#fff', border: 'none', borderRadius: 12,
            fontWeight: 800, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', letterSpacing: '0.02em',
            boxShadow: loading ? 'none' : '0 8px 24px rgba(109,40,217,0.4)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { if (!loading) { e.target.style.transform='translateY(-1px)'; e.target.style.boxShadow='0 12px 32px rgba(109,40,217,0.5)'; }}}
            onMouseLeave={e => { e.target.style.transform=''; e.target.style.boxShadow=loading?'none':'0 8px 24px rgba(109,40,217,0.4)'; }}
          >
            {loading ? (
              <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' }} />
                Connexion en cours...
              </span>
            ) : 'Se connecter →'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign:'center', marginTop:24 }}>
          <p style={{ fontSize:'0.72rem', color:'#A78BFA', margin:0 }}>
            © 2025-2026 ISGE · EduSchedule Pro · RST
          </p>
        </div>
      </div>
    </div>
  );
}
