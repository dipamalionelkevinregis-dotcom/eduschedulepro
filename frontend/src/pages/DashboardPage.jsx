// ============================================================
//  EduSchedule Pro — DashboardPage.jsx
//  Tableau de bord — contenu adapté selon le rôle connecté
//  Rôles : admin, enseignant, delegue, surveillant, comptable, etudiant
// ============================================================

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function DashboardPage() {
  const { user, apiUrl } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les statistiques du backend
  useEffect(() => {
    axios.get(apiUrl('api/dashboard'))
      .then(r => setStats(r.data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  // Cartes de stats filtrées par rôle
  const STAT_CARDS = [
    { key: 'total_classes',     label: 'Classes',        icon: '🏫', color: '#EEF2FF', link: '/classes',      roles: ['admin'] },
    { key: 'total_enseignants', label: 'Enseignants',    icon: '👨‍🏫', color: '#D1FAE5', link: '/enseignants',  roles: ['admin'] },
    { key: 'total_etudiants',   label: 'Étudiants',      icon: '🎓', color: '#FEF3C7', link: null,            roles: ['admin'] },
    { key: 'total_matieres',    label: 'Matières',       icon: '📚', color: '#DBEAFE', link: '/matieres',     roles: ['admin'] },
    { key: 'creneaux_semaine',  label: 'Créneaux/sem.',  icon: '📅', color: '#F3E8FF', link: '/emploi-temps', roles: ['admin','enseignant','delegue'] },
    { key: 'pointages_jour',    label: 'Pointages auj.', icon: '✅', color: '#D1FAE5', link: '/pointage',     roles: ['admin','surveillant','enseignant'] },
  ].filter(c => c.roles.includes(user?.role));

  // Raccourcis rapides par rôle
  const RACCOURCIS = {
    admin:       [{ label: '📅 Emploi du temps', link: '/emploi-temps', color: '#5B4FE9' }, { label: '📷 Pointage QR', link: '/pointage', color: '#10B981' }, { label: '📝 Cahier de texte', link: '/cahier', color: '#F59E0B' }, { label: '💰 Vacations', link: '/vacations', color: '#8B5CF6' }],
    enseignant:  [{ label: '📅 Mon planning',    link: '/emploi-temps', color: '#5B4FE9' }, { label: '📷 Pointer ma présence', link: '/pointage', color: '#10B981' }, { label: '📝 Cahier de texte', link: '/cahier', color: '#F59E0B' }, { label: '💰 Mes vacations', link: '/vacations', color: '#8B5CF6' }],
    delegue:     [{ label: '📅 Emploi du temps', link: '/emploi-temps', color: '#5B4FE9' }, { label: '📝 Cahier de texte', link: '/cahier', color: '#F59E0B' }],
    surveillant: [{ label: '📷 Pointages',       link: '/pointage',     color: '#10B981' }, { label: '📅 Emploi du temps', link: '/emploi-temps', color: '#5B4FE9' }],
    comptable:   [{ label: '💰 Fiches vacation', link: '/vacations',    color: '#8B5CF6' }],
    etudiant:    [{ label: '📅 Mon emploi du temps', link: '/emploi-temps', color: '#5B4FE9' }],
  };
  const raccourcis = RACCOURCIS[user?.role] || [];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Bonjour, {user?.prenom} 👋</h1>
        <p className="page-subtitle">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          &nbsp;— Rôle : <strong style={{ textTransform: 'capitalize' }}>{user?.role}</strong>
        </p>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div> Chargement...</div>
      ) : (
        <>
          {/* Cartes statistiques */}
          {STAT_CARDS.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {STAT_CARDS.map(s => (
                <div key={s.key} className="stat-card"
                  onClick={() => s.link && navigate(s.link)}
                  style={{ cursor: s.link ? 'pointer' : 'default', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onMouseOver={e => { if (s.link) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'; }}}
                  onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                  <div className="stat-icon" style={{ background: s.color }}>
                    <span style={{ fontSize: '22px' }}>{s.icon}</span>
                  </div>
                  <div>
                    <div className="stat-value">{stats?.[s.key] ?? '0'}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Raccourcis rapides */}
          {raccourcis.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '28px' }}>
              {raccourcis.map(r => (
                <button key={r.link} onClick={() => navigate(r.link)}
                  style={{ background: r.color, color: '#fff', border: 'none', borderRadius: '10px', padding: '16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s', textAlign: 'left' }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                  {r.label}
                </button>
              ))}
            </div>
          )}

          {/* Alertes et activité (admin et surveillant uniquement) */}
          {['admin','surveillant'].includes(user?.role) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="card">
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>🔔 Alertes récentes</h3>
                {stats?.alertes?.length > 0
                  ? stats.alertes.map((a, i) => <div key={i} className="alert-custom alert-warning" style={{ marginBottom: '8px' }}>⚠️ {a.message}</div>)
                  : <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Aucune alerte ✅</p>
                }
              </div>
              <div className="card">
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>📋 Activité récente</h3>
                {stats?.activite_recente?.length > 0 ? (
                  <table className="table-custom">
                    <tbody>
                      {stats.activite_recente.slice(0, 6).map((a, i) => (
                        <tr key={i}><td>{a.action}</td><td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{a.created_at}</td></tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Aucune activité récente.</p>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}