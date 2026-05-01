/**
 * PointagePage.jsx — Pointage par QR Code
 * ===============================================================
 * Permet au surveillant de scanner les QR codes des créneaux
 * pour enregistrer le pointage des enseignants.
 *
 * L'enseignant peut voir son propre historique de pointages.
 * L'admin peut voir tous les pointages.
 *
 * Rôles autorisés à scanner : surveillant
 * Rôles autorisés à voir    : admin, surveillant, enseignant
 * Étudiant/délégué          : accès refusé
 * ===============================================================
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

export default function PointagePage() {
  // ─── Contexte utilisateur ─────────────────────────────────────
  const { user, apiUrl } = useAuth();

  // ─── États principaux ─────────────────────────────────────────
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [msg, setMsg]             = useState('');
  const [token, setToken]         = useState('');  // token QR saisi manuellement
  const [scanning, setScanning]   = useState(false); // état du scan en cours

  // ─── Accès refusé pour étudiant et délégué ───────────────────
  if (['etudiant', 'delegue'].includes(user?.role)) {
    return (
      <div className="text-center py-5">
        <div style={{ fontSize: 64 }}>🚫</div>
        <h4 className="mt-3">Accès refusé</h4>
        <p className="text-muted">Cette section est réservée au surveillant et à l'administration.</p>
      </div>
    );
  }

  // ─── Chargement initial ───────────────────────────────────────
  useEffect(() => { loadPointages(); }, []);

  /**
   * Charge la liste des pointages depuis l'API
   * L'API filtre automatiquement selon le rôle (JWT)
   */
  const loadPointages = async () => {
    setLoading(true);
    try {
      const r = await axios.get(apiUrl('api/pointages'));
      setPointages(r.data.data || []);
    } catch {
      setMsg('Erreur lors du chargement des pointages.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Envoie le token QR pour valider le pointage
   * Réservé au rôle "surveillant"
   */
  const handleScan = async () => {
    if (!token.trim()) return;
    setScanning(true);
    try {
      const r = await axios.post(apiUrl('api/pointages/scan'), { token: token.trim() });
      setMsg(`✅ Pointage enregistré — ${r.data.data?.enseignant || 'Enseignant inconnu'}`);
      setToken('');
      loadPointages(); // rafraîchir la liste après scan
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.error || 'Token invalide ou expiré.'}`);
    } finally {
      setScanning(false);
    }
  };

  /**
   * Changer le statut d'un pointage (admin uniquement)
   */
  const handleStatut = async (id, statut) => {
    try {
      await axios.patch(apiUrl(`api/pointages/${id}/statut`), { statut });
      setMsg(`Statut mis à jour : ${statut}`);
      loadPointages();
    } catch {
      setMsg('Erreur lors de la mise à jour du statut.');
    }
  };

  // ─── Badge couleur selon le statut ───────────────────────────
  const statutBadge = (statut) => {
    const map = {
      present:  { cls: 'bg-success', label: '✅ Présent' },
      absent:   { cls: 'bg-danger',  label: '❌ Absent' },
      retard:   { cls: 'bg-warning text-dark', label: '⏰ Retard' },
    };
    return map[statut] || { cls: 'bg-secondary', label: statut };
  };

  // ─── Formatage de la date/heure ───────────────────────────────
  const formatDateTime = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // ─── Rendu ────────────────────────────────────────────────────
  return (
    <div>
      {/* En-tête */}
      <div className="mb-4">
        <h2 className="fw-bold mb-0">📍 Pointage</h2>
        <small className="text-muted">{pointages.length} enregistrement(s)</small>
      </div>

      {/* Message de retour */}
      {msg && (
        <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : msg.startsWith('❌') ? 'alert-danger' : 'alert-info'} alert-dismissible`}>
          {msg}
          <button className="btn-close" onClick={() => setMsg('')} />
        </div>
      )}

      {/* ─── Zone de scan QR (réservée au surveillant) ─────────── */}
      {user?.role === 'surveillant' && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title fw-bold">📷 Scanner un QR Code</h5>
            <p className="text-muted small">
              Saisissez le token QR du créneau (affiché dans l'emploi du temps).
            </p>
            <div className="input-group">
              <input
                className="form-control form-control-lg"
                placeholder="Coller ou saisir le token QR ici…"
                value={token}
                onChange={e => setToken(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
              />
              <button
                className="btn btn-success btn-lg"
                onClick={handleScan}
                disabled={scanning || !token.trim()}
              >
                {scanning ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Traitement…</>
                ) : '✅ Valider'}
              </button>
            </div>
            <small className="text-muted mt-2 d-block">
              💡 Appuyez sur Entrée pour valider rapidement
            </small>
          </div>
        </div>
      )}

      {/* ─── Tableau des pointages ─────────────────────────────── */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : pointages.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <div style={{ fontSize: 48 }}>📋</div>
          <p>Aucun pointage enregistré.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Enseignant</th>
                <th>Créneau</th>
                <th>Heure réelle</th>
                <th>Statut</th>
                {/* Colonne action visible pour admin uniquement */}
                {user?.role === 'admin' && <th>Modifier statut</th>}
              </tr>
            </thead>
            <tbody>
              {pointages.map(p => {
                const badge = statutBadge(p.statut);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="fw-bold">{p.prenom_enseignant} {p.nom_enseignant}</div>
                      <small className="text-muted">{p.email_enseignant}</small>
                    </td>
                    <td>
                      <div>{p.intitule_matiere || `Créneau #${p.id_creneau}`}</div>
                      <small className="text-muted">{p.jour} {p.heure_debut}–{p.heure_fin}</small>
                    </td>
                    <td>
                      <small>{formatDateTime(p.heure_pointage_reelle)}</small>
                    </td>
                    <td>
                      <span className={`badge ${badge.cls}`}>{badge.label}</span>
                    </td>
                    {/* Sélecteur de statut réservé à l'admin */}
                    {user?.role === 'admin' && (
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={p.statut}
                          onChange={e => handleStatut(p.id, e.target.value)}
                          style={{ width: 130 }}
                        >
                          <option value="present">Présent</option>
                          <option value="absent">Absent</option>
                          <option value="retard">Retard</option>
                        </select>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}