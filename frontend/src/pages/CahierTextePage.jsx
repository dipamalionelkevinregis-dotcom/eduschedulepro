/**
 * CahierTextePage.jsx — Cahier de texte numérique
 * ===============================================================
 * Permet aux enseignants de saisir le contenu de leurs séances.
 * Le délégué peut consulter et signer les entrées.
 * Le surveillant et l'admin peuvent voir tout.
 *
 * Rôles autorisés à créer   : enseignant
 * Rôles autorisés à signer  : délégué
 * Rôles autorisés à voir    : tous sauf étudiant (accès lecture seule)
 * ===============================================================
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

export default function CahierTextePage() {
  // ─── Contexte utilisateur ─────────────────────────────────────
  const { user, apiUrl } = useAuth();

  // ─── États principaux ─────────────────────────────────────────
  const [cahiers, setCahiers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [msg, setMsg]             = useState('');
  const [showModal, setShowModal] = useState(false);

  // ─── Formulaire de création d'entrée ─────────────────────────
  const emptyForm = {
    id_creneau:     '',
    contenu:        '',
    travaux_donnes: '',
    observations:   '',
  };
  const [form, setForm] = useState(emptyForm);

  // ─── Créneaux disponibles (pour le select) ────────────────────
  const [creneaux, setCreneaux] = useState([]);

  // ─── Chargement initial ───────────────────────────────────────
  useEffect(() => {
    loadCahiers();
    // Les enseignants ont besoin des créneaux pour créer une entrée
    if (user?.role === 'enseignant') loadCreneaux();
  }, []);

  /**
   * Charge la liste des cahiers depuis le backend
   */
  const loadCahiers = async () => {
    setLoading(true);
    try {
      const r = await axios.get(apiUrl('api/cahiers'));
      setCahiers(r.data.data || []);
    } catch {
      setMsg('Erreur lors du chargement du cahier de texte.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Charge les créneaux assignés à l'enseignant connecté
   */
  const loadCreneaux = async () => {
    try {
      const r = await axios.get(apiUrl('api/creneaux'));
      setCreneaux(r.data.data || []);
    } catch {
      // Silencieux si les créneaux ne se chargent pas
    }
  };

  /**
   * Crée une nouvelle entrée dans le cahier de texte
   * Réservé à l'enseignant
   */
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(apiUrl('api/cahiers'), form);
      setMsg('✅ Entrée enregistrée dans le cahier de texte.');
      setShowModal(false);
      setForm(emptyForm);
      loadCahiers();
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.error || 'Erreur lors de l\'enregistrement.'}`);
    }
  };

  /**
   * Signature d'une entrée par le délégué de classe
   */
  const handleSigner = async (id) => {
    if (!window.confirm('Confirmer la signature de cette séance ?')) return;
    try {
      await axios.post(apiUrl(`api/cahiers/${id}/signer`));
      setMsg('✅ Séance signée par le délégué.');
      loadCahiers();
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.error || 'Erreur lors de la signature.'}`);
    }
  };

  // ─── Formatage de la date ─────────────────────────────────────
  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  // ─── Rendu ────────────────────────────────────────────────────
  return (
    <div>
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">📓 Cahier de texte</h2>
          <small className="text-muted">{cahiers.length} séance(s) enregistrée(s)</small>
        </div>
        {/* Bouton visible uniquement pour l'enseignant */}
        {user?.role === 'enseignant' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Nouvelle séance
          </button>
        )}
      </div>

      {/* Message de retour */}
      {msg && (
        <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-danger'} alert-dismissible`}>
          {msg}
          <button className="btn-close" onClick={() => setMsg('')} />
        </div>
      )}

      {/* Indicateur de chargement */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : cahiers.length === 0 ? (
        /* État vide */
        <div className="text-center py-5 text-muted">
          <div style={{ fontSize: 48 }}>📓</div>
          <p>Aucune séance enregistrée dans le cahier.</p>
          {user?.role === 'enseignant' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Saisir ma première séance
            </button>
          )}
        </div>
      ) : (
        /* Liste des entrées du cahier */
        <div className="d-flex flex-column gap-3">
          {cahiers.map(c => (
            <div key={c.id} className="card border-0 shadow-sm">
              <div className="card-body">

                {/* En-tête de la carte : infos séance */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6 className="fw-bold mb-1">
                      📚 {c.intitule_matiere || `Créneau #${c.id_creneau}`}
                    </h6>
                    <small className="text-muted">
                      👨‍🏫 {c.prenom_enseignant} {c.nom_enseignant} —{' '}
                      {formatDate(c.date_seance || c.created_at)}
                    </small>
                  </div>
                  {/* Badge signature */}
                  <span className={`badge ${c.signe_delegue ? 'bg-success' : 'bg-warning text-dark'}`}>
                    {c.signe_delegue ? '✅ Signé' : '⏳ Non signé'}
                  </span>
                </div>

                {/* Contenu de la séance */}
                <div className="mb-2">
                  <strong className="small text-muted">CONTENU DU COURS</strong>
                  <p className="mb-0 mt-1">{c.contenu || '—'}</p>
                </div>

                {/* Travaux donnés */}
                {c.travaux_donnes && (
                  <div className="mb-2 p-2 bg-light rounded">
                    <strong className="small text-muted">📋 TRAVAUX DONNÉS</strong>
                    <p className="mb-0 mt-1">{c.travaux_donnes}</p>
                  </div>
                )}

                {/* Observations */}
                {c.observations && (
                  <div className="mb-2">
                    <strong className="small text-muted">💬 OBSERVATIONS</strong>
                    <p className="mb-0 mt-1 text-muted fst-italic">{c.observations}</p>
                  </div>
                )}

                {/* Bouton de signature pour le délégué (si non signé) */}
                {user?.role === 'delegue' && !c.signe_delegue && (
                  <button
                    className="btn btn-sm btn-success mt-2"
                    onClick={() => handleSigner(c.id)}
                  >
                    ✍️ Signer cette séance
                  </button>
                )}

                {/* Info de signature si déjà signé */}
                {c.signe_delegue && c.date_signature && (
                  <small className="text-success d-block mt-2">
                    Signé le {formatDate(c.date_signature)}
                  </small>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Modal Nouvelle séance (enseignant uniquement) ─────── */}
      {showModal && user?.role === 'enseignant' && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">📝 Saisir une séance</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">

                  {/* Sélection du créneau */}
                  <div className="mb-3">
                    <label className="form-label">Créneau <span className="text-danger">*</span></label>
                    {creneaux.length > 0 ? (
                      <select
                        className="form-select"
                        value={form.id_creneau}
                        onChange={e => setForm({ ...form, id_creneau: e.target.value })}
                        required
                      >
                        <option value="">— Sélectionner un créneau —</option>
                        {creneaux.map(cr => (
                          <option key={cr.id} value={cr.id}>
                            {cr.intitule_matiere} — {cr.jour} {cr.heure_debut}–{cr.heure_fin}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        className="form-control"
                        placeholder="ID du créneau"
                        value={form.id_creneau}
                        onChange={e => setForm({ ...form, id_creneau: e.target.value })}
                        required
                      />
                    )}
                  </div>

                  {/* Contenu du cours */}
                  <div className="mb-3">
                    <label className="form-label">Contenu du cours <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Décrivez le contenu enseigné durant cette séance…"
                      value={form.contenu}
                      onChange={e => setForm({ ...form, contenu: e.target.value })}
                      required
                    />
                  </div>

                  {/* Travaux donnés */}
                  <div className="mb-3">
                    <label className="form-label">Travaux donnés aux étudiants</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Exercices, devoirs, lectures…"
                      value={form.travaux_donnes}
                      onChange={e => setForm({ ...form, travaux_donnes: e.target.value })}
                    />
                  </div>

                  {/* Observations */}
                  <div className="mb-3">
                    <label className="form-label">Observations</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Remarques sur la séance, l'ambiance, les difficultés…"
                      value={form.observations}
                      onChange={e => setForm({ ...form, observations: e.target.value })}
                    />
                  </div>

                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    💾 Enregistrer la séance
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