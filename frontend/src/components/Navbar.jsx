/**
 * Navbar.jsx — Barre de navigation principale
 * ===============================================================
 * Affiche le nom de l'utilisateur connecté, son rôle, et les
 * liens de navigation adaptés à son rôle.
 * Inclut le toggle dark/light mode.
 *
 * Props : { darkMode, toggleDark }
 * ===============================================================
 */

import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── Libellés des rôles en français ───────────────────────────
const ROLE_LABELS = {
  admin:       '👑 Administrateur',
  enseignant:  '👨‍🏫 Enseignant',
  surveillant: '👁️ Surveillant',
  delegue:     '📋 Délégué',
  comptable:   '💰 Comptable',
  etudiant:    '🎓 Étudiant',
};

export default function Navbar({ darkMode, toggleDark }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Déconnexion : supprime le token et redirige vers la page login
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg px-4 border-bottom"
      style={{
        background: darkMode ? '#1e1e2e' : '#ffffff',
        color:      darkMode ? '#cdd6f4' : '#1a1a2e',
      }}
    >
      {/* Logo / Titre */}
      <span className="navbar-brand fw-bold" style={{ color: '#4a90d9', fontSize: '1.1rem' }}>
        📆 EduSchedule Pro
      </span>

      {/* Partie droite de la navbar */}
      <div className="ms-auto d-flex align-items-center gap-3">

        {/* Info utilisateur */}
        <div className="text-end d-none d-sm-block">
          <div className="fw-bold small">
            {user?.prenom || user?.email?.split('@')[0]}
          </div>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
            {ROLE_LABELS[user?.role] || user?.role}
          </div>
        </div>

        {/* Toggle Dark/Light Mode */}
        <button
          className="btn btn-sm"
          style={{
            background: darkMode ? '#313244' : '#e9ecef',
            border: 'none',
            borderRadius: 20,
            padding: '4px 12px',
          }}
          onClick={toggleDark}
          title={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          {darkMode ? 'Mode Sombre' : 'Mode Clair'}
        </button>

        {/* Bouton de déconnexion */}
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={handleLogout}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}