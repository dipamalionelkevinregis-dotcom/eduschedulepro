/**
 * context/NotifContext.jsx — Contexte global de notifications toast
 * ===============================================================
 * Fournit un système de notifications (toasts) accessible depuis
 * n'importe quel composant de l'application.
 *
 * Usage dans un composant :
 *   const { notif } = useNotif();
 *   notif('success', 'Enregistrement réussi !');
 *   notif('error',   'Une erreur est survenue.');
 *   notif('info',    'Connexion en cours…');
 *   notif('warning', 'Champ requis manquant.');
 *
 * Mise en place dans main.jsx ou App.jsx :
 *   <NotifProvider>
 *     <App />
 *   </NotifProvider>
 * ===============================================================
 */

import { createContext, useContext, useState, useCallback } from 'react';

// ─── Contexte ────────────────────────────────────────────────
const NotifContext = createContext(null);

/**
 * Provider — à placer autour de l'application dans App.jsx ou main.jsx
 */
export function NotifProvider({ children }) {
  // Liste des notifications actives
  const [notifs, setNotifs] = useState([]);

  /**
   * Ajoute une notification et la retire automatiquement après 4s
   * @param {'success'|'error'|'info'|'warning'} type
   * @param {string} message
   */
  const notif = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setNotifs(prev => [...prev, { id, type, message }]);

    // Auto-suppression après 4 secondes
    setTimeout(() => {
      setNotifs(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  /**
   * Supprime manuellement une notification par son id
   */
  const dismiss = useCallback((id) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  }, []);

  // ─── Correspondance type → classe Bootstrap ───────────────
  const classeParType = {
    success: 'alert-success',
    error:   'alert-danger',
    info:    'alert-info',
    warning: 'alert-warning',
  };

  const iconeParType = {
    success: '✅',
    error:   '❌',
    info:    'ℹ️',
    warning: '⚠️',
  };

  return (
    <NotifContext.Provider value={{ notif }}>
      {children}

      {/* ─── Conteneur des toasts (coin supérieur droit) ─────── */}
      <div
        style={{
          position:  'fixed',
          top:       20,
          right:     20,
          zIndex:    9999,
          display:   'flex',
          flexDirection: 'column',
          gap:       8,
          maxWidth:  360,
        }}
      >
        {notifs.map(n => (
          <div
            key={n.id}
            className={`alert ${classeParType[n.type] || 'alert-info'} alert-dismissible shadow`}
            style={{
              animation:    'slideIn 0.3s ease',
              marginBottom: 0,
              borderRadius: 10,
            }}
          >
            {iconeParType[n.type]} {n.message}
            <button
              className="btn-close"
              onClick={() => dismiss(n.id)}
              style={{ padding: '0.5rem' }}
            />
          </div>
        ))}
      </div>

      {/* ─── Animation CSS inline ─────────────────────────────── */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(50px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </NotifContext.Provider>
  );
}

/**
 * Hook pour utiliser les notifications dans un composant
 * @returns {{ notif: Function }}
 */
export function useNotif() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotif doit être utilisé dans un NotifProvider');
  return ctx;
}