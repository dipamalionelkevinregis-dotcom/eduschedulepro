/**
 * MatieresPage.jsx — Gestion des matières
 * ===============================================================
 * Liste toutes les matières du département et permet à l'admin
 * de les créer, modifier ou supprimer.
 *
 * Rôles autorisés à voir    : tous
 * Rôles autorisés à modifier : admin uniquement
 * ===============================================================
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

export default function MatieresPage() {
  // ─── Contexte utilisateur ─────────────────────────────────────
  const { user, apiUrl } = useAuth();

  // ─── États principaux ─────────────────────────────────────────
  const [matieres, setMatieres]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [msg, setMsg]             = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [search, setSearch]       = useState('');

  // ─── Formulaire vide ──────────────────────────────────────────
  const emptyForm = {
    code: '', intitule: '', volume_horaire: 30,
    credits: 3, semestre: 'S1', type: 'CM'
  };
  const [form, setForm] = useState(emptyForm);

  // ─── Options des sélecteurs ───────────────────────────────────
  const semestres = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
  const types     = ['CM', 'TD', 'TP', 'Projet'];

  // ─── Chargement initial ───────────────────────────────────────
  useEffect(() => { loadMatieres(); }, []);

  /**
   * Charge toutes les matières depuis l'API
   */
  const loadMatieres = async () => {
    setLoading(true);
    try {
      const r = await axios.get(apiUrl('api/matieres'));
      setMatieres(r.data.data || []);
    } catch {
      setMsg('Erreur lors du chargement des matières.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtre sur le code ou l'intitulé
   */
  const filtered = matieres.filter(m =>
    `${m.code} ${m.intitule}`.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Groupement par semestre ──────────────────────────────────
  const bySemestre = filtered.reduce((acc, m) => {
    const sem = m.semestre || 'Autre';
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(m);
    return acc;
  }, {});

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };

  const openEdit = (m) => {
    setEditItem(m);
    setForm({
      code:          m.code || '',
      intitule:      m.intitule || '',
      volume_horaire: m.volume_horaire || 30,
      credits:       m.credits || 3,
      semestre:      m.semestre || 'S1',
      type:          m.type || 'CM',
    });
    setShowModal(true);
  };

  /**
   * Création ou mise à jour d'une matière
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axios.put(apiUrl(`api/matieres/${editItem.id}`), form);
        setMsg('Matière mise à jour.');
      } else {
        await axios.post(apiUrl('api/matieres'), form);
        setMsg('Matière créée.');
      }
      setShowModal(false);
      loadMatieres();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Erreur.');
    }
  };

  /**
   * Suppression d'une matière
   */
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette matière ?')) return;
    try {
      await axios.delete(apiUrl(`api/matieres/${id}`));
      setMsg('Matière supprimée.');
      loadMatieres();
    } catch { setMsg('Erreur lors de la suppression.'); }
  };

  // ─── Badge couleur par type de séance ────────────────────────
  const typeBadge = (type) => {
    const map = { CM: 'bg-primary', TD: 'bg-success', TP: 'bg-warning text-dark', Projet: 'bg-info' };
    return map[type] || 'bg-secondary';
  };

  // ─── Rendu ────────────────────────────────────────────────────
  return (
    <div>
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">📚 Matières</h2>
          <small className="text-muted">{filtered.length} matière(s)</small>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={openCreate}>+ Nouvelle matière</button>
        )}
      </div>

      {/* Barre de recherche */}
      <input
        className="form-control mb-3"
        placeholder="🔍 Rechercher par code ou intitulé…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Message */}
      {msg && (
        <div className={`alert ${msg.includes('Erreur') ? 'alert-danger' : 'alert-success'} alert-dismissible`}>
          {msg}
          <button className="btn-close" onClick={() => setMsg('')} />
        </div>
      )}

      {/* Chargement */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <div style={{ fontSize: 48 }}>📚</div>
          <p>Aucune matière trouvée.</p>
        </div>
      ) : (
        /* Matières groupées par semestre */
        Object.entries(bySemestre).sort().map(([sem, list]) => (
          <div key={sem} className="mb-4">
            {/* Titre du groupe semestre */}
            <h5 className="fw-bold text-secondary border-bottom pb-2 mb-3">📅 {sem}</h5>
            <div className="row g-3">
              {list.map(m => (
                <div key={m.id} className="col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      {/* Badge type de séance */}
                      <span className={`badge ${typeBadge(m.type)} mb-2`}>{m.type}</span>
                      <h6 className="fw-bold">{m.intitule}</h6>
                      <p className="text-muted mb-1"><small>Code : <strong>{m.code}</strong></small></p>
                      <p className="text-muted mb-1"><small>⏱ {m.volume_horaire}h — {m.credits} crédits</small></p>
                    </div>
                    {/* Actions admin */}
                    {user?.role === 'admin' && (
                      <div className="card-footer d-flex gap-2 bg-transparent border-0">
                        <button className="btn btn-sm btn-outline-primary w-50" onClick={() => openEdit(m)}>
                          ✏️ Modifier
                        </button>
                        <button className="btn btn-sm btn-outline-danger w-50" onClick={() => handleDelete(m.id)}>
                          🗑️ Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* ─── Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editItem ? '✏️ Modifier la matière' : '+ Nouvelle matière'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Code <span className="text-danger">*</span></label>
                    <input className="form-control" value={form.code}
                      onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      placeholder="ex: INF301" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Intitulé <span className="text-danger">*</span></label>
                    <input className="form-control" value={form.intitule}
                      onChange={e => setForm({ ...form, intitule: e.target.value })}
                      placeholder="ex: Architecture des Réseaux" required />
                  </div>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label">Volume horaire (h)</label>
                      <input type="number" min="1" className="form-control" value={form.volume_horaire}
                        onChange={e => setForm({ ...form, volume_horaire: parseInt(e.target.value) })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Crédits</label>
                      <input type="number" min="1" max="10" className="form-control" value={form.credits}
                        onChange={e => setForm({ ...form, credits: parseInt(e.target.value) })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Semestre</label>
                      <select className="form-select" value={form.semestre}
                        onChange={e => setForm({ ...form, semestre: e.target.value })}>
                        {semestres.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Type</label>
                      <select className="form-select" value={form.type}
                        onChange={e => setForm({ ...form, type: e.target.value })}>
                        {types.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary">{editItem ? 'Mettre à jour' : 'Créer'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}