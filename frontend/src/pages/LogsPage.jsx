import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNotif } from '../context/NotifContext';

export default function LogsPage() {
  const { error } = useNotif();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [action, setAction] = useState('');

  const load = () => {
    setLoading(true);
    let url = '/logs?';
    if (action) url += 'action='+action+'&';
    if (dateDebut) url += 'date_debut='+dateDebut+'&';
    if (dateFin) url += 'date_fin='+dateFin;
    api.get(url).then(d => setLogs(d)).catch(e => error(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 style={{ margin:'0 0 20px', fontSize:'1.4rem', fontWeight:800, color:'#0f172a' }}>📋 Journal d'activité</h1>
      <div style={{ display:'flex', gap:12, marginBottom:16, flexWrap:'wrap' }}>
        <input type="date" value={dateDebut} onChange={e=>setDateDebut(e.target.value)}
          style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.85rem' }} />
        <input type="date" value={dateFin} onChange={e=>setDateFin(e.target.value)}
          style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.85rem' }} />
        <input value={action} onChange={e=>setAction(e.target.value)} placeholder="Filtrer par action"
          style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:'0.85rem', width:180 }} />
        <button onClick={load} style={{ padding:'8px 16px', background:'#1d4ed8', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:'0.85rem' }}>Filtrer</button>
      </div>
      <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', overflow:'hidden' }}>
        {loading ? <div style={{ padding:40, textAlign:'center', color:'#64748b' }}>⏳</div> : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
            <thead>
              <tr style={{ background:'#f8fafc', borderBottom:'2px solid #e2e8f0' }}>
                {['Date/Heure','Utilisateur','Rôle','Action','IP'].map(h => (
                  <th key={h} style={{ padding:'8px 12px', textAlign:'left', color:'#64748b', fontWeight:600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                  <td style={{ padding:'8px 12px', color:'#64748b', whiteSpace:'nowrap' }}>{new Date(log.date_heure).toLocaleString('fr-FR')}</td>
                  <td style={{ padding:'8px 12px', fontWeight:600 }}>{log.nom_complet || '—'}</td>
                  <td style={{ padding:'8px 12px' }}>
                    <span style={{ padding:'2px 8px', borderRadius:20, background:'#f1f5f9', color:'#64748b', fontSize:'0.72rem', fontWeight:600 }}>{log.role||'—'}</span>
                  </td>
                  <td style={{ padding:'8px 12px' }}><code style={{ background:'#f8fafc', padding:'2px 6px', borderRadius:4, fontSize:'0.75rem' }}>{log.action}</code></td>
                  <td style={{ padding:'8px 12px', color:'#94a3b8', fontSize:'0.75rem' }}>{log.ip}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={5} style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>Aucun log</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
