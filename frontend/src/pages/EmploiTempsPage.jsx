// ============================================================
//  EduSchedule Pro — Page Emploi du Temps
//  frontend/src/pages/EmploiTempsPage.jsx
// ============================================================

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

// Jours de la semaine affichés dans la grille
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Palette de couleurs pour distinguer les matières
const COLORS = ['#5B4FE9','#10B981','#F59E0B','#EF4444','#3B82F6','#8B5CF6','#EC4899','#14B8A6'];

export default function EmploiTempsPage() {
  const { apiUrl, user } = useAuth();

  // Seul l'admin peut créer/modifier — délégué et étudiant en lecture seule
  const isAdmin = user?.role === 'admin';

  // ── États principaux ──
  const [classes, setClasses]           = useState([]);
  const [selectedClass, setSelected]    = useState('');
  const [emplois, setEmplois]           = useState([]);
  const [selectedET, setSelectedET]     = useState(null);  // Emploi du temps sélectionné
  const [creneaux, setCreneaux]         = useState([]);
  const [matieres, setMatieres]         = useState([]);    // Pour le formulaire créneau
  const [enseignants, setEnseignants]   = useState([]);    // Pour le formulaire créneau
  const [salles, setSalles]             = useState([]);    // Pour le formulaire créneau
  const [loading, setLoading]           = useState(false);
  const [showNewET, setShowNewET]       = useState(false); // Modal nouvel emploi du temps
  const [showNewCreneau, setShowNewCreneau] = useState(false); // Modal nouveau créneau
  const [formET, setFormET]             = useState({ semaine_debut: '' });
  const [formCreneau, setFormCreneau]   = useState({
    id_matiere: '', id_enseignant: '', id_salle: '',
    jour: 'Lundi', heure_debut: '08:00:00', heure_fin: '10:00:00', type_seance: 'CM'
  });
  const [msg, setMsg] = useState('');

  // ── Chargement initial ──
  useEffect(() => {
    // Charger les classes
    axios.get(apiUrl('api/classes')).then(r => setClasses(r.data.data || []));
    // Charger les matières pour le formulaire créneau
    axios.get(apiUrl('api/matieres')).then(r => setMatieres(r.data.data || []));
    // Charger les enseignants
    axios.get(apiUrl('api/enseignants')).then(r => setEnseignants(r.data.data || []));
    // Charger les salles
    axios.get(apiUrl('api/salles')).then(r => setSalles(r.data.data || []));
  }, []);

  // ── Chargement des emplois quand une classe est sélectionnée ──
  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    setMsg('');
    axios.get(apiUrl(`api/emplois-temps?id_classe=${selectedClass}`))
      .then(r => {
        const list = r.data.data || [];
        setEmplois(list);
        if (list.length > 0) {
          setSelectedET(list[0]);
          loadCreneaux(list[0].id);
        } else {
          setCreneaux([]);
          setSelectedET(null);
        }
      })
      .catch(() => setMsg('Erreur chargement.'))
      .finally(() => setLoading(false));
  }, [selectedClass]);

  // ── Charger les créneaux d'un emploi du temps ──
  const loadCreneaux = (etId) => {
    axios.get(apiUrl(`api/creneaux?id_emploi_temps=${etId}`))
      .then(r => setCreneaux(r.data.data || []))
      .catch(() => setCreneaux([]));
  };

  // ── Créer un emploi du temps ──
  const handleCreateET = async (e) => {
    e.preventDefault();
    try {
      await axios.post(apiUrl('api/emplois-temps'), {
        id_classe:     selectedClass,
        semaine_debut: formET.semaine_debut
      });
      setMsg('Emploi du temps créé !');
      setShowNewET(false);
      setFormET({ semaine_debut: '' });
      // Recharger
      const r = await axios.get(apiUrl(`api/emplois-temps?id_classe=${selectedClass}`));
      const list = r.data.data || [];
      setEmplois(list);
      if (list.length > 0) { setSelectedET(list[0]); loadCreneaux(list[0].id); }
    } catch (err) {
      setMsg(err.response?.data?.error || 'Erreur création.');
    }
  };

  // ── Créer un créneau ──
  const handleCreateCreneau = async (e) => {
    e.preventDefault();
    if (!selectedET) { setMsg('Sélectionnez d\'abord un emploi du temps.'); return; }
    try {
      await axios.post(apiUrl('api/creneaux'), {
        ...formCreneau,
        id_emploi_temps: selectedET.id
      });
      setMsg('Créneau ajouté avec succès !');
      setShowNewCreneau(false);
      // Réinitialiser le formulaire
      setFormCreneau({
        id_matiere: '', id_enseignant: '', id_salle: '',
        jour: 'Lundi', heure_debut: '08:00:00', heure_fin: '10:00:00', type_seance: 'CM'
      });
      loadCreneaux(selectedET.id);
    } catch (err) {
      setMsg(err.response?.data?.error || 'Erreur ajout créneau.');
    }
  };

  // ── Rendu ──
  return (
    <div>
      {/* En-tête */}
      <div className="card-header-custom">
        <div>
          <h1 className="page-title">📅 Emploi du Temps</h1>
          <p className="page-subtitle">Grille hebdomadaire par classe</p>
        </div>
        {/* Boutons visibles uniquement pour l'admin */}
        {isAdmin && (
          <div style={{ display: 'flex', gap: '10px' }}>
            {selectedET && (
              <button className="btn-secondary-custom" onClick={() => setShowNewCreneau(true)}>
                + Ajouter un créneau
              </button>
            )}
            {selectedClass && (
              <button className="btn-primary-custom" onClick={() => setShowNewET(true)}>
                + Nouvel emploi du temps
              </button>
            )}
          </div>
        )}
      </div>

      {/* Message succès/erreur */}
      {msg && (
        <div className={`alert-custom ${msg.includes('succès') || msg.includes('!') ? 'alert-success' : 'alert-danger'}`}>
          {msg}
        </div>
      )}

      {/* Sélecteur de classe */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <label className="form-label">Sélectionner une classe</label>
        <select className="form-control-custom" style={{ maxWidth: '300px' }}
          value={selectedClass} onChange={e => { setSelected(e.target.value); setMsg(''); }}>
          <option value="">-- Choisir une classe --</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.nom || c.libelle} — {c.niveau}</option>
          ))}
        </select>
      </div>

      {/* Liste des semaines */}
      {emplois.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <label className="form-label">Choisir une semaine</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            {emplois.map(et => (
              <button key={et.id}
                onClick={() => { setSelectedET(et); loadCreneaux(et.id); }}
                className={selectedET?.id === et.id ? 'btn-primary-custom' : 'btn-secondary-custom'}
                style={{ fontSize: '12px' }}>
                📅 Semaine du {et.semaine_debut}
                <span className={`badge-custom ${et.statut === 'publié' ? 'badge-success' : 'badge-warning'}`}
                  style={{ marginLeft: '8px' }}>
                  {et.statut === 'publié' ? 'Publié' : 'Brouillon'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grille emploi du temps */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div> Chargement...</div>
      ) : selectedClass && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <div className="planning-grid">
            {/* En-têtes */}
            <div className="planning-header">Horaire</div>
            {JOURS.map(j => <div key={j} className="planning-header">{j}</div>)}

            {/* Corps */}
            {creneaux.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#6B7280', background: 'var(--card)', fontSize: '13px' }}>
                Aucun créneau.
                {/* Bouton visible uniquement pour l'admin */}
                {isAdmin && selectedET && (
                  <button onClick={() => setShowNewCreneau(true)}
                    style={{ marginLeft: '12px', background: 'var(--primary)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                    + Ajouter un créneau
                  </button>
                )}
              </div>
            ) : (
              (() => {
                const heures = [...new Set(creneaux.map(c => `${c.heure_debut}-${c.heure_fin}`))].sort();
                return heures.map((h, i) => {
                  const [deb, fin] = h.split('-');
                  return [
                    <div key={`h-${i}`} className="planning-cell" style={{ background: 'var(--bg2)', fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: 'monospace' }}>
                      {deb}<br />{fin}
                    </div>,
                    ...JOURS.map(jour => {
                      const c = creneaux.find(cr => (cr.jour_semaine || cr.jour) === jour && cr.heure_debut === deb);
                      const col = c ? COLORS[(c.id_matiere || 0) % COLORS.length] : null;
                      return (
                        <div key={`${h}-${jour}`} className="planning-cell">
                          {c && (
                            <div className="creneau-block" style={{ background: col + '22', borderLeft: `3px solid ${col}` }}>
                              <div style={{ fontWeight: 600, color: col, fontSize: '11px' }}>{c.matiere_nom || 'Matière'}</div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{c.enseignant_nom || ''}</div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{c.salle_nom || ''}</div>
                              <div style={{ color: col, fontSize: '9px', fontWeight: 600 }}>{c.type_seance || ''}</div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ];
                });
              })()
            )}
          </div>
        </div>
      )}

      {/* ══ MODAL — Nouvel emploi du temps ══ */}
      {showNewET && (
        <div className="modal-overlay" onClick={() => setShowNewET(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">📅 Créer un emploi du temps</h3>
            <form onSubmit={handleCreateET}>
              <div className="form-group">
                <label className="form-label">Date de début de semaine</label>
                <input type="date" className="form-control-custom"
                  value={formET.semaine_debut}
                  onChange={e => setFormET({ ...formET, semaine_debut: e.target.value })} required />
                <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  Choisissez le lundi de la semaine
                </small>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn-secondary-custom" onClick={() => setShowNewET(false)}>Annuler</button>
                <button type="submit" className="btn-primary-custom">✅ Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL — Nouveau créneau ══ */}
      {showNewCreneau && (
        <div className="modal-overlay" onClick={() => setShowNewCreneau(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">➕ Ajouter un créneau</h3>
            <form onSubmit={handleCreateCreneau}>

              {/* Matière */}
              <div className="form-group">
                <label className="form-label">Matière</label>
                <select className="form-control-custom" value={formCreneau.id_matiere}
                  onChange={e => setFormCreneau({ ...formCreneau, id_matiere: e.target.value })} required>
                  <option value="">-- Choisir une matière --</option>
                  {matieres.map(m => <option key={m.id} value={m.id}>{m.nom || m.libelle} ({m.code})</option>)}
                </select>
              </div>

              {/* Enseignant */}
              <div className="form-group">
                <label className="form-label">Enseignant</label>
                <select className="form-control-custom" value={formCreneau.id_enseignant}
                  onChange={e => setFormCreneau({ ...formCreneau, id_enseignant: e.target.value })} required>
                  <option value="">-- Choisir un enseignant --</option>
                  {enseignants.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
                </select>
              </div>

              {/* Salle */}
              <div className="form-group">
                <label className="form-label">Salle (optionnel)</label>
                <select className="form-control-custom" value={formCreneau.id_salle}
                  onChange={e => setFormCreneau({ ...formCreneau, id_salle: e.target.value })}>
                  <option value="">-- Choisir une salle --</option>
                  {salles.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              </div>

              {/* Jour + Type séance */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Jour</label>
                  <select className="form-control-custom" value={formCreneau.jour}
                    onChange={e => setFormCreneau({ ...formCreneau, jour: e.target.value })}>
                    {JOURS.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Type de séance</label>
                  <select className="form-control-custom" value={formCreneau.type_seance}
                    onChange={e => setFormCreneau({ ...formCreneau, type_seance: e.target.value })}>
                    <option value="CM">CM — Cours Magistral</option>
                    <option value="TD">TD — Travaux Dirigés</option>
                    <option value="TP">TP — Travaux Pratiques</option>
                  </select>
                </div>
              </div>

              {/* Horaires */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Heure début</label>
                  <input type="time" className="form-control-custom" value={formCreneau.heure_debut.slice(0,5)}
                    onChange={e => setFormCreneau({ ...formCreneau, heure_debut: e.target.value + ':00' })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Heure fin</label>
                  <input type="time" className="form-control-custom" value={formCreneau.heure_fin.slice(0,5)}
                    onChange={e => setFormCreneau({ ...formCreneau, heure_fin: e.target.value + ':00' })} required />
                </div>
              </div>

              {/* Boutons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn-secondary-custom" onClick={() => setShowNewCreneau(false)}>Annuler</button>
                <button type="submit" className="btn-primary-custom">✅ Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}