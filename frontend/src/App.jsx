/**
 * App.jsx — Point d'entrée principal de l'application React
 * ===============================================================
 * Configure le routeur, le contexte d'authentification,
 * et la gestion du dark/light mode persistant.
 *
 * Structure des routes :
 *   /login          → Page de connexion (public)
 *   /dashboard      → Tableau de bord (tous rôles connectés)
 *   /classes        → Gestion des classes
 *   /enseignants    → Gestion des enseignants
 *   /matieres       → Gestion des matières
 *   /emploi-temps   → Emploi du temps
 *   /pointage       → Pointage QR
 *   /cahier-texte   → Cahier de texte
 *   /vacations      → Fiches de vacation
 * ===============================================================
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

// ─── Import des pages ──────────────────────────────────────────
import LoginPage       from './pages/LoginPage';
import DashboardPage   from './pages/DashboardPage';
import ClassesPage     from './pages/ClassesPage';
import EnseignantsPage from './pages/EnseignantsPage';
import MatieresPage    from './pages/MatieresPage';
import EmploiTempsPage from './pages/EmploiTempsPage';
import PointagePage    from './pages/PointagePage';
import CahierTextePage from './pages/CahierTextePage';
import VacationPage    from './pages/VacationPage';

// ─── Import du composant Navbar ───────────────────────────────
import Navbar from './components/Navbar';

// ─── Navigation latérale : items selon le rôle ───────────────
const NAV_ITEMS = [
  { path: '/dashboard',    icon: '🏠', label: 'Dashboard',       roles: ['admin','enseignant','surveillant','delegue','comptable','etudiant'] },
  { path: '/classes',      icon: '🎓', label: 'Classes',         roles: ['admin','enseignant','surveillant','delegue'] },
  { path: '/enseignants',  icon: '👨‍🏫', label: 'Enseignants',     roles: ['admin','surveillant'] },
  { path: '/matieres',     icon: '📚', label: 'Matières',        roles: ['admin','enseignant'] },
  { path: '/emploi-temps', icon: '📅', label: 'Emploi du temps', roles: ['admin','enseignant','delegue','etudiant'] },
  { path: '/pointage',     icon: '📍', label: 'Pointage',        roles: ['admin','surveillant','enseignant'] },
  { path: '/cahier-texte', icon: '📓', label: 'Cahier de texte', roles: ['admin','enseignant','delegue','surveillant'] },
  { path: '/vacations',    icon: '💰', label: 'Vacations',       roles: ['admin','enseignant','comptable'] },
];

/**
 * ProtectedLayout — Enveloppe les routes privées
 * Redirige vers /login si l'utilisateur n'est pas connecté.
 * Affiche la sidebar + navbar pour les pages internes.
 */
function ProtectedLayout({ children, darkMode, toggleDark }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Attendre la fin du chargement du token JWT
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  // Rediriger vers login si non authentifié
  if (!user) return <Navigate to="/login" replace />;

  // Filtrer les items de nav selon le rôle de l'utilisateur
  const navItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'column',
        minHeight:     '100vh',
        background:    darkMode ? '#11111b' : '#f0f4f8',
        color:         darkMode ? '#cdd6f4' : '#1a1a2e',
        transition:    'background 0.3s, color 0.3s',
      }}
    >
      {/* Barre de navigation du haut */}
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />

      <div style={{ display: 'flex', flex: 1 }}>

        {/* ─── Sidebar ──────────────────────────────────────── */}
        <aside
          style={{
            width:      220,
            flexShrink: 0,
            background: darkMode ? '#1e1e2e' : '#ffffff',
            borderRight: `1px solid ${darkMode ? '#313244' : '#e2e8f0'}`,
            padding:    '1rem 0',
          }}
        >
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display:     'flex',
                  alignItems:  'center',
                  gap:         10,
                  width:       '100%',
                  padding:     '10px 20px',
                  border:      'none',
                  background:  isActive
                    ? (darkMode ? '#313244' : '#e8f0fe')
                    : 'transparent',
                  color: isActive
                    ? '#4a90d9'
                    : (darkMode ? '#cdd6f4' : '#4a5568'),
                  fontWeight:  isActive ? 700 : 400,
                  cursor:      'pointer',
                  textAlign:   'left',
                  borderLeft:  isActive ? '3px solid #4a90d9' : '3px solid transparent',
                  transition:  'all 0.2s',
                  fontSize:    '0.9rem',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* ─── Contenu principal ────────────────────────────── */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * AppRoutes — Définit toutes les routes de l'application
 */
function AppRoutes() {
  // ─── Dark mode persistant (localStorage) ─────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('esp_dark') === 'true';
  });

  const toggleDark = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('esp_dark', next);
      return next;
    });
  };

  return (
    <Routes>
      {/* Page de login — publique */}
      <Route path="/login" element={<LoginPage darkMode={darkMode} />} />

      {/* Pages protégées — nécessitent une connexion */}
      <Route path="/dashboard" element={
        <ProtectedLayout darkMode={darkMode} toggleDark={toggleDark}>
          <DashboardPage />
        </ProtectedLayout>
      } />
      <Route path="/classes" element={
        <ProtectedLayout darkMode={darkMode} toggleDark={toggleDark}>
          <ClassesPage />
        </ProtectedLayout>
      } />
      <Route path="/enseignants" element={
        <ProtectedLayout darkMode={darkMode} toggleDark={toggleDark}>
          <EnseignantsPage />
        </ProtectedLayout>
      } />
      <Route path="/matieres" element={
        <ProtectedLayout darkMode={darkMode} toggleDark={toggleDark}>
          <MatieresPage />
        </ProtectedLayout>
      } />
      <Route path="/emploi-temps" element={
        <ProtectedLayout darkMode={darkMode} toggleDark={toggleDark}>
          <EmploiTempsPage />
        </ProtectedLayout>
      } />
      <Route path="/pointage" element={
        <ProtectedLayout darkMode={darkMode} toggleDark={toggleDark}>
          <PointagePage />
        </ProtectedLayout>
      } />
      <Route path="/cahier-texte" element={
        <ProtectedLayout darkMode={darkMode} toggleDark={toggleDark}>
          <CahierTextePage />
        </ProtectedLayout>
      } />
      <Route path="/vacations" element={
        <ProtectedLayout darkMode={darkMode} toggleDark={toggleDark}>
          <VacationPage />
        </ProtectedLayout>
      } />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

/**
 * App — Composant racine
 * Enveloppe tout dans AuthProvider + BrowserRouter
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}