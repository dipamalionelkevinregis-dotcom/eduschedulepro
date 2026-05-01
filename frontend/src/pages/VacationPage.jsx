/**
 * VacationPage.jsx — Gestion des vacations (paiements enseignants)
 * ===============================================================
 * Permet aux enseignants de soumettre leurs fiches de vacation.
 * Le comptable et l'admin peuvent valider, rejeter ou exporter.
 *
 * Rôles autorisés à soumettre : enseignant
 * Rôles autorisés à valider   : comptable, admin
 * Rôles autorisés à voir      : enseignant (ses fiches), admin, comptable, surveillant
 * ===============================================================
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

export default function VacationPage() {
  // ─── Contexte utilisateur ─────────────────────────────────────
  const { user, apiUrl } = useAuth();

  // ─── États principaux ─────────────────────────────────────────
  const [vacations, setVacations]  = useState([]);
  const [loading, setLoading]      = useState(true);
  const [msg, setMsg]              = useState('');
  const [showModal, setShowModal]  = useState(false);
  const [filterStatut, setFilter]  = useState('tous'); // filtre sur le statut

  // ─── Formulaire de soumission ─────────────────────────────────
  const emptyForm = {
    periode_debut:  '',
    periode_fin:    '',
    nb_heures_cm:   0,
    nb_heures_td:   0,
    nb_heures_tp:   0,
    taux_horaire:   5000, // tarif par défaut en FCFA
    observations:   '',
  };
  const [form, setForm] = useState(emptyForm);

  // ─── Chargement initial ───────────────────────────────────────
  useEffect(() => { loadVacations(); }, []);

  /**
   * Charge les fiches de vacation
   * Le backend filtre automatiquement selon le rôle (JWT)
   */
  const loadVacations = async () => {
    setLoading(true);
    try {
      const r = await axios.get(apiUrl('api/vacations'));
      setVacations(r.data.data || []);
    } catch {
      setMsg('Erreur lors du chargement des vacations.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtre les vacations selon le statut sélectionné
   */
  const filtered = filterStatut === 'tous'
    ? vacations
    : vacations.filter(v => v.statut === filterStatut);

  /**
   * Calcule le montant total d'une fiche de vacation
   */
  const calcMontant = (v) => {
    const total = ((v.nb_heures_cm || 0) + (v.nb_heures_td || 0) + (v.nb_heures_tp || 0));
    return total * (v.taux_horaire || 5000);
  };

  /**
   * Soumet une nouvelle fiche de vacation
   * Réservé à l'enseignant
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(apiUrl('api/vacations'), form);
      setMsg('✅ Fiche de vacation soumise. En attente de validation.');
      setShowModal(false);
      setForm(emptyForm);
      loadVacations();
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.error || 'Erreur lors de la soumission.'}`);
    }
  };

  /**
   * Valide ou rejette une fiche (comptable / admin)
   */
  const handleAction = async (id, action) => {
    const labels = { valider: 'valider', rejeter: 'rejeter' };
    if (!window.confirm(`Confirmer : ${labels[action]} cette fiche ?`)) return;
    try {
      await axios.post(apiUrl(`api/vacations/${id}/${action}`));
      setMsg(`✅ Fiche ${action === 'valider' ? 'validée' : 'rejetée'} avec succès.`);
      loadVacations();
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.error || 'Erreur.'}`);
    }
  };

  /**
   * Télécharge le PDF d'une fiche (comptable / admin)
   */
  const handlePDF = async (id) => {
    try {
      window.open(apiUrl(`api/vacations/${id}/pdf`), '_blank');
    } catch {
      setMsg('Erreur lors de la génération du PDF.');
    }
  };

  // ─── Badge couleur selon le statut ───────────────────────────
  const statutBadge = (statut) => {
    const map = {
      en_attente: { cls: 'bg-warning text-dark', label: '⏳ En attente' },
      validee:    { cls: 'bg-success',            label: '✅ Validée' },
      rejetee:    { cls: 'bg-danger',             label: '❌ Rejetée' },
    };
    return map[statut] || { cls: 'bg-secondary', label: statut };
  };

  // ─── Formatage date ───────────────────────────────────────────
  const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

  // ─── Formatage montant FCFA ───────────────────────────────────
  const fmtMontant = (n) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);

  // ─── Rendu ────────────────────────────────────────────────────
  return (
    <div>
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">💰 Vacations</h2>
          <small className="text-muted">{filtered.length} fiche(s)</small>
        </div>
        {/* Bouton de soumission réservé à l'enseignant */}
        {user?.role === 'enseignant' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Soumettre une fiche
          </button>
        )}
      </div>

      {/* Filtres par statut */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {['tous', 'en_attente', 'validee', 'rejetee'].map(s => (
          <button
            key={s}
            className={`btn btn-sm ${filterStatut === s ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter(s)}
          >
            {s === 'tous' ? 'Toutes' : statutBadge(s).label}
          </button>
        ))}
      </div>

      {/* Message */}
      {msg && (
        <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-danger'} alert-dismissible`}>
          {msg}
          <button className="btn-close" onClick={() => setMsg('')} />
        </div>
      )}

      {/* Chargement */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <div style={{ fontSize: 48 }}>💰</div>
          <p>Aucune fiche de vacation trouvée.</p>
          {user?.role === 'enseignant' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Soumettre ma première fiche
            </button>
          )}
        </div>
      ) : (
        /* Tableau des vacations */
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Enseignant</th>
                <th>Période</th>
                <th>Heures (CM/TD/TP)</th>
                <th>Montant</th>
                <th>Statut</th>
                {/* Actions pour comptable et admin uniquement */}
                {['admin', 'comptable'].includes(user?.role) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => {
                const badge = statutBadge(v.statut);
                const montant = calcMontant(v);
                return (
                  <tr key={v.id}>
                    <td>
                      <div className="fw-bold">{v.prenom_enseignant} {v.nom_enseignant}</div>
                      <small className="text-muted">{v.email_enseignant}</small>
                    </td>
                    <td>
                      <small>{fmt(v.periode_debut)} → {fmt(v.periode_fin)}</small>
                    </td>
                    <td>
                      <small>
                        CM: <strong>{v.nb_heures_cm}h</strong> |{' '}
                        TD: <strong>{v.nb_heures_td}h</strong> |{' '}
                        TP: <strong>{v.nb_heures_tp}h</strong>
                      </small>
                    </td>
                    <td>
                      <strong className="text-success">{fmtMontant(montant)}</strong>
                    </td>
                    <td>
                      <span className={`badge ${badge.cls}`}>{badge.label}</span>
                    </td>
                    {/* Actions comptable / admin */}
                    {['admin', 'comptable'].includes(user?.role) && (
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {/* Valider — seulement si en attente */}
                          {v.statut === 'en_attente' && (
                            <>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleAction(v.id, 'valider')}
                              >
                                ✅ Valider
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleAction(v.id, 'rejeter')}
                              >
                                ❌ Rejeter
                              </button>
                            </>
                          )}
                          {/* PDF — toujours disponible */}
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handlePDF(v.id)}
                          >
                            📄 PDF
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Modal Soumission (enseignant uniquement) ──────────── */}
      {showModal && user?.role === 'enseignant' && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">💰 Nouvelle fiche de vacation</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* Période */}
                    <div className="col-6">
                      <label className="form-label">Début de période <span className="text-danger">*</span></label>
                      <input type="date" className="form-control" value={form.periode_debut}
                        onChange={e => setForm({ ...form, periode_debut: e.target.value })} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Fin de période <span className="text-danger">*</span></label>
                      <input type="date" className="form-control" value={form.periode_fin}
                        onChange={e => setForm({ ...form, periode_fin: e.target.value })} required />
                    </div>

                    {/* Heures par type */}
                    <div className="col-4">
                      <label className="form-label">Heures CM</label>
                      <input type="number" min="0" className="form-control" value={form.nb_heures_cm}
                        onChange={e => setForm({ ...form, nb_heures_cm: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="col-4">
                      <label className="form-label">Heures TD</label>
                      <input type="number" min="0" className="form-control" value={form.nb_heures_td}
                        onChange={e => setForm({ ...form, nb_heures_td: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="col-4">
                      <label className="form-label">Heures TP</label>
                      <input type="number" min="0" className="form-control" value={form.nb_heures_tp}
                        onChange={e => setForm({ ...form, nb_heures_tp: parseInt(e.target.value) || 0 })} />
                    </div>

                    {/* Taux horaire */}
                    <div className="col-12">
                      <label className="form-label">Taux horaire (FCFA/h)</label>
                      <input type="number" min="0" className="form-control" value={form.taux_horaire}
                        onChange={e => setForm({ ...form, taux_horaire: parseInt(e.target.value) || 0 })} />
                    </div>

                    {/* Montant estimé (calculé en temps réel) */}
                    <div className="col-12">
                      <div className="alert alert-info mb-0">
                        💰 Montant estimé :{' '}
                        <strong>
                          {fmtMontant(
                            (form.nb_heures_cm + form.nb_heures_td + form.nb_heures_tp) * form.taux_horaire
                          )}
                        </strong>
                      </div>
                    </div>

                    {/* Observations */}
                    <div className="col-12">
                      <label className="form-label">Observations</label>
                      <textarea className="form-control" rows="2"
                        placeholder="Remarques ou précisions…"
                        value={form.observations}
                        onChange={e => setForm({ ...form, observations: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    📤 Soumettre la fiche
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}