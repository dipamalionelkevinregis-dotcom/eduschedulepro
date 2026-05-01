// ============================================================
//  EduSchedule Pro — Page Rapports
//  frontend/src/pages/RapportsPage.jsx
// ============================================================

import { useState } from 'react'
import { useApi } from '../hooks/useApi'

export default function RapportsPage() {
  const { get, loading } = useApi()
  const [rapport, setRapport] = useState(null)
  const [type,    setType]    = useState('presence')
  const [mois,    setMois]    = useState(new Date().getMonth()+1)
  const [annee,   setAnnee]   = useState(new Date().getFullYear())

  async function genererRapport(e) {
    e.preventDefault()
    const d = await get(`/dashboard/stats?role=admin&periode=${annee}-${String(mois).padStart(2,'0')}`)
    if (d) setRapport(d)
  }

  const MOIS_NOM = ['','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Rapports</h1>
          <p className="page-subtitle">Génération de rapports pédagogiques et administratifs</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '500px', marginBottom: '1.5rem' }}>
        <div className="card-header"><h3 className="card-title">Paramètres du rapport</h3></div>
        <form onSubmit={genererRapport}>
          <div className="form-group">
            <label className="form-label">Type de rapport</label>
            <select className="form-control" value={type} onChange={e => setType(e.target.value)}>
              <option value="presence">Présence des enseignants</option>
              <option value="avancement">Avancement des programmes</option>
              <option value="vacations">Récapitulatif des vacations</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Mois</label>
              <select className="form-control" value={mois} onChange={e => setMois(e.target.value)}>
                {MOIS_NOM.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Année</label>
              <input type="number" className="form-control" value={annee} onChange={e => setAnnee(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? '⏳ Génération...' : '📊 Générer le rapport'}
          </button>
        </form>
      </div>

      {rapport && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Rapport — {MOIS_NOM[mois]} {annee}</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>🖨️ Imprimer</button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#EEF2FF' }}>📅</div>
              <div><div className="stat-value">{rapport.seances_jour || 0}</div><div className="stat-label">Séances du jour</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#D1FAE5' }}>✅</div>
              <div><div className="stat-value">{rapport.pointages_jour || 0}</div><div className="stat-label">Pointages</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#FEF3C7' }}>⚠️</div>
              <div><div className="stat-value">{rapport.retards_jour || 0}</div><div className="stat-label">Retards</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#FEE2E2' }}>📓</div>
              <div><div className="stat-value">{rapport.cahiers_non_clos || 0}</div><div className="stat-label">Cahiers non clôturés</div></div>
            </div>
          </div>

          {rapport.stats_classes?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>Détail par classe</h4>
              <div className="table-container">
                <table>
                  <thead><tr><th>Classe</th><th>Séances planifiées</th><th>Séances réalisées</th><th>Taux</th></tr></thead>
                  <tbody>
                    {rapport.stats_classes.map((c, i) => {
                      const taux = c.seances_planifiees > 0 ? Math.round((c.seances_realisees / c.seances_planifiees) * 100) : 0
                      return (
                        <tr key={i}>
                          <td><strong>{c.classe}</strong></td>
                          <td>{c.seances_planifiees}</td>
                          <td>{c.seances_realisees}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${taux}%`, height: '100%', background: taux >= 80 ? '#10b981' : taux >= 50 ? '#f59e0b' : '#ef4444', borderRadius: '4px' }} />
                              </div>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{taux}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}