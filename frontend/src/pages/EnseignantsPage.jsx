// ============================================================
//  EduSchedule Pro — EnseignantsPage.jsx
//  Gestion des enseignants (admin uniquement)
// ============================================================

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

export default function EnseignantsPage() {
  const { apiUrl } = useAuth();
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', specialite: '', type_enseignant: 'vacataire', taux_horaire: 5000 });
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    axios.get(apiUrl('api/enseignants')).then(r => setData(r.data.data || [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(apiUrl('api/enseignants'), form);
      setMsg('Enseignant ajouté !'); setShowModal(false); load();
    } catch (err) { setMsg(err.response?.data?.error || 'Erreur'); }
  };

  return (
    <div>
      <div className="card-header-custom">
        <div>
          <h1 className="page-title">👨‍🏫 Enseignants</h1>
          <p className="page-subtitle">{data.length} enseignant(s)</p>
        </div>
        <button className="btn-primary-custom" onClick={() => setShowModal(true)}>+ Ajouter</button>
      </div>
      {msg && <div className={`alert-custom ${msg.includes('!') ? 'alert-success' : 'alert-danger'}`} onClick={() => setMsg('')}>{msg}</div>}
      <div className="card">
        {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
          <table className="table-custom">
            <thead><tr><th>Nom & Prénom</th><th>Email</th><th>Spécialité</th><th>Statut</th><th>Taux/h</th></tr></thead>
            <tbody>
              {data.map(e => (
                <tr key={e.id}>
                  <td><strong>{e.prenom} {e.nom}</strong></td>
                  <td>{e.email}</td>
                  <td>{e.specialite || '—'}</td>
                  <td><span className={`badge-custom ${e.statut === 'permanent' ? 'badge-success' : 'badge-warning'}`}>{e.statut}</span></td>
                  <td>{Number(e.taux_horaire || 0).toLocaleString()} FCFA</td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>Aucun enseignant.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Nouvel enseignant</h3>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label className="form-label">Nom</label><input className="form-control-custom" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">Prénom</label><input className="form-control-custom" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} required /></div>
              </div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-control-custom" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Spécialité</label><input className="form-control-custom" value={form.specialite} onChange={e => setForm({...form, specialite: e.target.value})} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label className="form-label">Statut</label>
                  <select className="form-control-custom" value={form.type_enseignant} onChange={e => setForm({...form, type_enseignant: e.target.value})}>
                    <option value="permanent">Permanent</option><option value="vacataire">Vacataire</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Taux/h (FCFA)</label><input className="form-control-custom" type="number" value={form.taux_horaire} onChange={e => setForm({...form, taux_horaire: e.target.value})} /></div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn-secondary-custom" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn-primary-custom">✅ Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}