import { createContext, useContext, useState, useCallback } from 'react';

const NotifContext = createContext(null);

export function NotifProvider({ children }) {
  const [notifs, setNotifs] = useState([]);

  const addNotif = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setNotifs(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifs(prev => prev.filter(n => n.id !== id)), duration);
  }, []);

  const success = useCallback((msg) => addNotif(msg, 'success'), [addNotif]);
  const error   = useCallback((msg) => addNotif(msg, 'error'),   [addNotif]);
  const info    = useCallback((msg) => addNotif(msg, 'info'),    [addNotif]);
  const warn    = useCallback((msg) => addNotif(msg, 'warn'),    [addNotif]);

  const colors = { success:'#16a34a', error:'#dc2626', warn:'#d97706', info:'#2563eb' };
  const icons  = { success:'✓ ', error:'✗ ', warn:'⚠ ', info:'ℹ ' };

  return (
    <NotifContext.Provider value={{ notifs, success, error, info, warn }}>
      {children}
      <div style={{ position:'fixed', top:20, right:20, zIndex:9999, display:'flex', flexDirection:'column', gap:8 }}>
        {notifs.map(n => (
          <div key={n.id} style={{
            padding:'12px 20px', borderRadius:8, color:'#fff', fontWeight:500, fontSize:'0.85rem',
            minWidth:280, boxShadow:'0 4px 20px rgba(0,0,0,0.25)',
            background: colors[n.type] || colors.info,
          }}>
            {icons[n.type]}{n.message}
          </div>
        ))}
      </div>
    </NotifContext.Provider>
  );
}

export const useNotif = () => useContext(NotifContext);
