// ============================================================
//  EduSchedule Pro — ClassesPage.jsx
//  Gestion des classes (admin uniquement)
// ============================================================

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

export default function ClassesPage() {
  const { apiUrl } = useAuth();
  const [classes, setClasses]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm] = useState({ nom: '', niveau: 'Licence 1', annee_academique: '2025-2026' });
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    axios.get(apiUrl('api/classes')).then(r => setClasses(r.data.data || [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(apiUrl('api/classes'), form);
      setMsg('Classe créée !'); setShowModal(false);
      setForm({ nom: '', niveau: 'Licence 1', annee_academique: '2025-2026' });
      load();
    } catch (err) { setMsg(err.response?.data?.error || 'Erreur'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette classe ?')) return;
    await axios.delete(apiUrl(`api/classes/${id}`));
    load();
  };

  return (
    <div>
      <div className="card-header-custom">
        <div>
          <h1 className="page-title">🏫 Classes</h1>
          <p className="page-subtitle">{classes.length} classe(s)</p>
        </div>
        <button className="btn-primary-custom" onClick={() => setShowModal(true)}>+ Nouvelle classe</button>
      </div>
      {msg && <div className={`alert-custom ${msg.includes('!') ? 'alert-success' : 'alert-danger'}`} onClick={() => setMsg('')}>{msg}</div>}
      <div className="card">
        {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
          <table className="table-custom">
            <thead><tr><th>Nom</th><th>Niveau</th><th>Année</th><th>Effectif</th><th>Action</th></tr></thead>
            <tbody>
              {classes.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.nom || c.libelle}</strong></td>
                  <td><span className="badge-custom badge-primary">{c.niveau}</span></td>
                  <td>{c.annee_academique}</td>
                  <td>{c.effectif || 0} étudiants</td>
                  <td>
                    <button onClick={() => handleDelete(c.id)}
                      style={{ background: '#FEE2E2', border: 'none', color: '#991B1B', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                      🗑️ Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>Aucune classe.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Nouvelle classe</h3>
            <form onSubmit={handleSave}>
              <div className="form-group"><label className="form-label">Nom de la classe</label>
                <input className="form-control-custom" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} placeholder="ex: L3-RST" required />
              </div>
              <div className="form-group"><label className="form-label">Niveau</label>
                <select className="form-control-custom" value={form.niveau} onChange={e => setForm({...form, niveau: e.target.value})}>
                  <option>Licence 1</option><option>Licence 2</option><option>Licence 3</option>
                  <option>Master 1</option><option>Master 2</option><option>Ingénieur</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Année académique</label>
                <input className="form-control-custom" value={form.annee_academique} onChange={e => setForm({...form, annee_academique: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn-secondary-custom" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn-primary-custom">✅ Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}