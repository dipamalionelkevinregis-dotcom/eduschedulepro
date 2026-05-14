import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Import sécurisé du thème
let useTheme = () => ({ dark: false, toggle: () => {} });
try { useTheme = require('../context/ThemeContext').useTheme; } catch(_) {}

const NAV = {
  admin: [
    { to:'/dashboard',    icon:'⊞',  label:'Tableau de bord' },
    { to:'/emploi-temps', icon:'📅',  label:'Emplois du temps' },
    { to:'/qrcodes',      icon:'⬡',  label:'QR Codes' },
    { to:'/cahiers',      icon:'📓',  label:'Cahiers de texte' },
    { to:'/vacations',    icon:'💳',  label:'Vacations' },
    { divider:true, label:'Référentiels' },
    { to:'/enseignants',  icon:'👤',  label:'Enseignants' },
    { to:'/classes',      icon:'🎓',  label:'Classes & Matières' },
    { to:'/salles',       icon:'🏫',  label:'Salles' },
    { to:'/utilisateurs', icon:'👥',  label:'Utilisateurs' },
    { to:'/logs',         icon:'📋',  label:'Journal' },
  ],
  enseignant: [
    { to:'/dashboard',    icon:'⊞',  label:'Tableau de bord' },
    { to:'/emploi-temps', icon:'📅',  label:'Mon planning' },
    { to:'/pointage',     icon:'📱',  label:'Pointage QR' },
    { to:'/cahiers',      icon:'📓',  label:'Cahiers de texte' },
    { to:'/vacations',    icon:'💳',  label:'Mes vacations' },
  ],
  delegue: [
    { to:'/dashboard',       icon:'⊞', label:'Tableau de bord' },
    { to:'/emploi-temps',    icon:'📅', label:'Emploi du temps' },
    { to:'/cahiers',         icon:'📓', label:'Cahiers de texte' },
    { to:'/cahiers/nouveau', icon:'✍️', label:'Nouveau cahier' },
  ],
  surveillant: [
    { to:'/dashboard',    icon:'⊞',  label:'Tableau de bord' },
    { to:'/emploi-temps', icon:'📅',  label:'Emplois du temps' },
    { to:'/qrcodes',      icon:'⬡',  label:'QR Codes' },
    { to:'/cahiers',      icon:'📓',  label:'Cahiers de texte' },
    { to:'/vacations',    icon:'💳',  label:'Contrôle vacations' },
    { to:'/logs',         icon:'📋',  label:'Journal' },
  ],
  comptable: [
    { to:'/dashboard', icon:'⊞', label:'Tableau de bord' },
    { to:'/vacations', icon:'💳', label:'Fiches de vacation' },
  ],
  etudiant: [
    { to:'/emploi-temps', icon:'📅', label:'Mon planning' },
  ],
};

const ROLE_ACCENT = {
  admin:'#6D28D9', enseignant:'#0D9488', delegue:'#7C3AED',
  surveillant:'#EA580C', comptable:'#059669', etudiant:'#64748B',
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const location  = useLocation();
  const navigate  = useNavigate();

  // Détecter la taille d'écran
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < 768);
  const [isTablet,  setIsTablet]  = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
      if (w >= 1024) { setSidebarOpen(true); setMobileMenuOpen(false); }
      else if (w < 768) { setSidebarOpen(false); }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fermer le menu mobile quand on navigue
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = NAV[user?.role] || [];
  const accent   = ROLE_ACCENT[user?.role] || '#6D28D9';
  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (to) => location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));

  const NavItem = ({ item }) => {
    if (item.divider) {
      return sidebarOpen ? (
        <div style={{ padding:'14px 12px 6px', fontSize:'0.62rem', fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
          {item.label}
        </div>
      ) : <div style={{ height:1, background:'rgba(255,255,255,0.08)', margin:'8px 6px' }} />;
    }
    const active = isActive(item.to);
    return (
      <Link to={item.to} style={{ textDecoration:'none' }}>
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          padding: sidebarOpen ? '10px 12px' : '10px',
          borderRadius:9, marginBottom:2, transition:'all 0.12s',
          background: active ? accent : 'transparent',
          color: active ? '#fff' : 'rgba(255,255,255,0.6)',
          boxShadow: active ? '0 4px 12px rgba(0,0,0,0.25)' : 'none',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          cursor:'pointer',
        }}
          onMouseEnter={e => { if (!active) { e.currentTarget.style.background='rgba(139,92,246,0.2)'; e.currentTarget.style.color='#fff'; }}}
          onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.6)'; }}}
        >
          <span style={{ fontSize:'1.1rem', flexShrink:0, width:22, textAlign:'center' }}>{item.icon}</span>
          {sidebarOpen && <span style={{ fontSize:'0.84rem', fontWeight: active?600:400, whiteSpace:'nowrap' }}>{item.label}</span>}
        </div>
      </Link>
    );
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding:'20px 12px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:38, height:38, borderRadius:10, background:accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0, boxShadow:'0 4px 12px rgba(0,0,0,0.3)' }}>📚</div>
        {(sidebarOpen || isMobile) && (
          <div>
            <div style={{ color:'#fff', fontWeight:800, fontSize:'0.9rem', letterSpacing:'-0.02em' }}>EduSchedule</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.62rem' }}>Pro · ISGE 2025-26</div>
          </div>
        )}
        {isMobile && (
          <button onClick={() => setMobileMenuOpen(false)}
            style={{ marginLeft:'auto', background:'none', border:'none', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:'1.3rem', padding:4 }}>
            ✕
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto', overflowX:'hidden' }}>
        {navItems.map((item, i) => <NavItem key={i} item={item} />)}
      </nav>

      {/* User + actions */}
      <div style={{ padding:'10px 8px 16px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
        {(sidebarOpen || isMobile) && (
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 10px', marginBottom:8, background:'rgba(255,255,255,0.06)', borderRadius:9 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', fontWeight:700, color:'#fff', flexShrink:0 }}>
              {(user?.nom||'U')[0].toUpperCase()}
            </div>
            <div style={{ overflow:'hidden', flex:1 }}>
              <div style={{ color:'#fff', fontSize:'0.78rem', fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.nom}</div>
              <div style={{ color:accent, fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase' }}>{user?.role}</div>
            </div>
          </div>
        )}
        <Link to="/changer-mdp" style={{ textDecoration:'none', display:'block', marginBottom:3 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding: (sidebarOpen||isMobile)?'8px 10px':'8px', borderRadius:8, color:'rgba(255,255,255,0.5)', cursor:'pointer', justifyContent:(sidebarOpen||isMobile)?'flex-start':'center', transition:'all 0.12s', fontSize:'0.8rem' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(139,92,246,0.2)'; e.currentTarget.style.color='#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.5)'; }}>
            <span>🔐</span>
            {(sidebarOpen||isMobile) && <span>Mot de passe</span>}
          </div>
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:(sidebarOpen||isMobile)?'8px 10px':'8px', borderRadius:8, color:'rgba(255,255,255,0.5)', cursor:'pointer', justifyContent:(sidebarOpen||isMobile)?'flex-start':'center', transition:'all 0.12s', fontSize:'0.8rem' }}
          onClick={handleLogout}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(220,38,38,0.2)'; e.currentTarget.style.color='#FCA5A5'; }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.5)'; }}>
          <span>🚪</span>
          {(sidebarOpen||isMobile) && <span>Déconnexion</span>}
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>

      {/* ── Sidebar Desktop / Tablette ── */}
      {!isMobile && (
        <aside style={{
          width: sidebarOpen ? 240 : 64, flexShrink:0, transition:'width 0.2s ease',
          background:'linear-gradient(180deg, #1E1B4B 0%, #2D1B69 100%)',
          display:'flex', flexDirection:'column', overflow:'hidden',
          position:'sticky', top:0, height:'100vh',
        }}>
          <SidebarContent />
        </aside>
      )}

      {/* ── Menu Mobile (overlay) ── */}
      {isMobile && mobileMenuOpen && (
        <>
          {/* Overlay sombre */}
          <div onClick={() => setMobileMenuOpen(false)} style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
            zIndex:200, backdropFilter:'blur(2px)',
          }} />
          {/* Drawer */}
          <div style={{
            position:'fixed', top:0, left:0, bottom:0, width:280,
            background:'linear-gradient(180deg, #1E1B4B 0%, #2D1B69 100%)',
            zIndex:201, display:'flex', flexDirection:'column',
            boxShadow:'4px 0 24px rgba(0,0,0,0.4)',
            animation:'slideIn 0.2s ease',
          }}>
            <SidebarContent />
          </div>
        </>
      )}

      {/* ── Main ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>

        {/* Topbar */}
        <header style={{
          background:'var(--surface)', borderBottom:'1px solid var(--border)',
          padding: isMobile ? '10px 16px' : '12px 24px',
          display:'flex', alignItems:'center', gap:10,
          position:'sticky', top:0, zIndex:100,
          boxShadow:'0 1px 8px rgba(109,40,217,0.08)',
        }}>
          {/* Bouton hamburger mobile / toggle desktop */}
          <button
            onClick={() => isMobile ? setMobileMenuOpen(!mobileMenuOpen) : setSidebarOpen(!sidebarOpen)}
            style={{ background:'none', border:'1.5px solid var(--border)', borderRadius:8, cursor:'pointer', padding:'6px 9px', color:'var(--primary)', fontSize:'1rem', display:'flex', alignItems:'center', flexShrink:0 }}>
            {isMobile ? '☰' : (sidebarOpen ? '◀' : '▶')}
          </button>

          {/* Titre page */}
          <div style={{ flex:1, minWidth:0 }}>
            <h2 style={{ margin:0, fontSize: isMobile?'0.9rem':'1rem', fontWeight:700, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {navItems.find(n => !n.divider && isActive(n.to))?.label || 'EduSchedule Pro'}
            </h2>
          </div>

          {/* Infos utilisateur + Toggle thème */}
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            {/* Bouton dark/light mode */}
            <button
              onClick={toggle}
              title={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              style={{
                width:36, height:36, borderRadius:10, border:'1.5px solid var(--border)',
                background: dark ? '#2D1B69' : '#F3F0FF',
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.1rem', transition:'all 0.2s', flexShrink:0,
                boxShadow: dark ? '0 0 12px rgba(139,92,246,0.3)' : 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='scale(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; }}
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#22C55E', boxShadow:'0 0 5px #22C55E' }} />
            {!isMobile && <span style={{ fontSize:'0.78rem', color:'var(--text-2)', fontWeight:500, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.nom}</span>}
            <span style={{ padding:'2px 8px', borderRadius:99, fontSize:'0.68rem', fontWeight:700, background:accent+'20', color:accent, whiteSpace:'nowrap' }}>
              {isMobile ? user?.role?.[0]?.toUpperCase() : user?.role}
            </span>
          </div>
        </header>

        {/* Contenu */}
        <main style={{ flex:1, padding: isMobile?'16px':isTablet?'20px':'24px', overflowY:'auto' }} className="fade-in">
          {children}
        </main>

        {/* ── Barre de navigation mobile en bas ── */}
        {isMobile && (
          <nav style={{
            position:'sticky', bottom:0, background:'var(--surface)',
            borderTop:'1px solid var(--border)', padding:'6px 4px',
            display:'flex', justifyContent:'space-around', alignItems:'center',
            boxShadow:'0 -4px 16px rgba(109,40,217,0.1)', zIndex:100,
          }}>
            {navItems.filter(n => !n.divider).slice(0, 5).map(item => {
              const active = isActive(item.to);
              return (
                <Link key={item.to} to={item.to} style={{ textDecoration:'none', flex:1 }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'6px 4px', borderRadius:8,
                    background: active ? accent+'15' : 'transparent',
                    transition:'all 0.15s',
                  }}>
                    <span style={{ fontSize:'1.2rem', lineHeight:1 }}>{item.icon}</span>
                    <span style={{ fontSize:'0.58rem', fontWeight: active?700:500, color: active?accent:'var(--text-3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:56, textAlign:'center' }}>
                      {item.label.split(' ')[0]}
                    </span>
                    {active && <div style={{ width:16, height:3, borderRadius:99, background:accent }} />}
                  </div>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
