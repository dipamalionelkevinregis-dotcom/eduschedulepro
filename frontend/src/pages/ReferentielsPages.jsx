// ============================================================
//  EduSchedule Pro — Pages Référentiels (CORRIGÉ - nom avec 's')
//  frontend/src/pages/ReferentielsPages.jsx
//  ⚠️ Renommer ReferentielsPage.jsx → ReferentielsPages.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'

// ── ENSEIGNANTS ──────────────────────────────────────────────
export function EnseignantsPage() {
  const { get, post, put, loading } = useApi()
  const [enseignants, setEnseignants] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ matricule:'', nom:'', prenom:'', email:'', telephone:'', specialite:'', statut:'vacataire', taux_horaire:5000 })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/enseignants'); if (d) setEnseignants(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(e=null) {
    if (e) {
      setForm({ matricule:e.matricule, nom:e.nom, prenom:e.prenom, email:e.email, telephone:e.telephone||'', specialite:e.specialite||'', statut:e.statut, taux_horaire:e.taux_horaire })
      setEditId(e.id)
    } else {
      setForm({ matricule:'', nom:'', prenom:'', email:'', telephone:'', specialite:'', statut:'vacataire', taux_horaire:5000 })
      setEditId(null)
    }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/enseignants/${editId}`, form) : await post('/enseignants', form)
    if (r !== null) { showToast(editId ? 'Modifié !' : 'Créé !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">👨‍🏫 Enseignants</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvel enseignant</button>
      </div>
      <div className="table-container card">
        <table>
          <thead>
            <tr><th>Matricule</th><th>Nom complet</th><th>Email</th><th>Spécialité</th><th>Statut</th><th>Taux/h</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {enseignants.map(e => (
              <tr key={e.id}>
                <td><span className="badge badge-gray">{e.matricule}</span></td>
                <td><strong>{e.prenom} {e.nom}</strong></td>
                <td>{e.email}</td>
                <td>{e.specialite}</td>
                <td><span className={`badge badge-${e.statut === 'permanent' ? 'success' : 'warning'}`}>{e.statut}</span></td>
                <td>{parseInt(e.taux_horaire).toLocaleString()} FCFA</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(e)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {enseignants.length === 0 && <div className="empty-state"><p>Aucun enseignant.</p></div>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvel'} enseignant</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {[
                { l: 'Matricule',   k: 'matricule' },
                { l: 'Nom',        k: 'nom' },
                { l: 'Prénom',     k: 'prenom' },
                { l: 'Email',      k: 'email' },
                { l: 'Téléphone',  k: 'telephone' },
                { l: 'Spécialité', k: 'specialite' },
              ].map(f => (
                <div className="form-group" key={f.k}>
                  <label className="form-label">{f.l}</label>
                  <input className="form-control" value={form[f.k]} onChange={e => setForm({...form, [f.k]: e.target.value})}
                    required={['matricule','nom','prenom','email'].includes(f.k)} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select className="form-control" value={form.statut} onChange={e => setForm({...form, statut: e.target.value})}>
                  <option value="vacataire">Vacataire</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Taux horaire (FCFA)</label>
                <input type="number" className="form-control" value={form.taux_horaire} onChange={e => setForm({...form, taux_horaire: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── MATIÈRES ─────────────────────────────────────────────────
export function MatieresPage() {
  const { get, post, put, loading } = useApi()
  const [matieres, setMatieres] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ code: '', libelle: '', volume_horaire_total: 40, coefficient: 3 })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/matieres'); if (d) setMatieres(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(m=null) {
    if (m) { setForm({ code: m.code, libelle: m.libelle, volume_horaire_total: m.volume_horaire_total, coefficient: m.coefficient }); setEditId(m.id) }
    else   { setForm({ code: '', libelle: '', volume_horaire_total: 40, coefficient: 3 }); setEditId(null) }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/matieres/${editId}`, form) : await post('/matieres', form)
    if (r !== null) { showToast(editId ? 'Modifiée !' : 'Créée !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">📚 Matières</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvelle matière</button>
      </div>
      <div className="table-container card">
        <table>
          <thead><tr><th>Code</th><th>Libellé</th><th>Volume horaire</th><th>Coefficient</th><th>Actions</th></tr></thead>
          <tbody>
            {matieres.map(m => (
              <tr key={m.id}>
                <td><span className="badge badge-primary">{m.code}</span></td>
                <td><strong>{m.libelle}</strong></td>
                <td>{m.volume_horaire_total}h</td>
                <td>{m.coefficient}</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(m)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {matieres.length === 0 && <div className="empty-state"><p>Aucune matière.</p></div>}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvelle'} matière</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Code</label><input className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Libellé</label><input className="form-control" value={form.libelle} onChange={e => setForm({...form, libelle: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Volume horaire (h)</label><input type="number" className="form-control" value={form.volume_horaire_total} onChange={e => setForm({...form, volume_horaire_total: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Coefficient</label><input type="number" className="form-control" value={form.coefficient} onChange={e => setForm({...form, coefficient: e.target.value})} required /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SALLES ───────────────────────────────────────────────────
export function SallesPage() {
  const { get, post, put, loading } = useApi()
  const [salles, setSalles] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ code: '', capacite: 30, equipements: '', batiment: '' })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/salles'); if (d) setSalles(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(s=null) {
    if (s) { setForm({ code: s.code, capacite: s.capacite, equipements: s.equipements||'', batiment: s.batiment||'' }); setEditId(s.id) }
    else   { setForm({ code: '', capacite: 30, equipements: '', batiment: '' }); setEditId(null) }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/salles/${editId}`, form) : await post('/salles', form)
    if (r !== null) { showToast(editId ? 'Modifiée !' : 'Créée !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">🚪 Salles</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvelle salle</button>
      </div>
      <div className="table-container card">
        <table>
          <thead><tr><th>Code</th><th>Capacité</th><th>Équipements</th><th>Bâtiment</th><th>Actions</th></tr></thead>
          <tbody>
            {salles.map(s => (
              <tr key={s.id}>
                <td><span className="badge badge-primary">{s.code}</span></td>
                <td>{s.capacite} places</td>
                <td style={{ fontSize: '0.8rem' }}>{s.equipements}</td>
                <td>{s.batiment}</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(s)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {salles.length === 0 && <div className="empty-state"><p>Aucune salle.</p></div>}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvelle'} salle</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Code</label><input className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Capacité</label><input type="number" className="form-control" value={form.capacite} onChange={e => setForm({...form, capacite: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Équipements</label><input className="form-control" value={form.equipements} onChange={e => setForm({...form, equipements: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Bâtiment</label><input className="form-control" value={form.batiment} onChange={e => setForm({...form, batiment: e.target.value})} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}// ============================================================
//  EduSchedule Pro — Pages Référentiels (CORRIGÉ - nom avec 's')
//  frontend/src/pages/ReferentielsPages.jsx
//  ⚠️ Renommer ReferentielsPage.jsx → ReferentielsPages.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'

// ── ENSEIGNANTS ──────────────────────────────────────────────
export function EnseignantsPage() {
  const { get, post, put, loading } = useApi()
  const [enseignants, setEnseignants] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ matricule:'', nom:'', prenom:'', email:'', telephone:'', specialite:'', statut:'vacataire', taux_horaire:5000 })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/enseignants'); if (d) setEnseignants(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(e=null) {
    if (e) {
      setForm({ matricule:e.matricule, nom:e.nom, prenom:e.prenom, email:e.email, telephone:e.telephone||'', specialite:e.specialite||'', statut:e.statut, taux_horaire:e.taux_horaire })
      setEditId(e.id)
    } else {
      setForm({ matricule:'', nom:'', prenom:'', email:'', telephone:'', specialite:'', statut:'vacataire', taux_horaire:5000 })
      setEditId(null)
    }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/enseignants/${editId}`, form) : await post('/enseignants', form)
    if (r !== null) { showToast(editId ? 'Modifié !' : 'Créé !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">👨‍🏫 Enseignants</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvel enseignant</button>
      </div>
      <div className="table-container card">
        <table>
          <thead>
            <tr><th>Matricule</th><th>Nom complet</th><th>Email</th><th>Spécialité</th><th>Statut</th><th>Taux/h</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {enseignants.map(e => (
              <tr key={e.id}>
                <td><span className="badge badge-gray">{e.matricule}</span></td>
                <td><strong>{e.prenom} {e.nom}</strong></td>
                <td>{e.email}</td>
                <td>{e.specialite}</td>
                <td><span className={`badge badge-${e.statut === 'permanent' ? 'success' : 'warning'}`}>{e.statut}</span></td>
                <td>{parseInt(e.taux_horaire).toLocaleString()} FCFA</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(e)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {enseignants.length === 0 && <div className="empty-state"><p>Aucun enseignant.</p></div>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvel'} enseignant</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {[
                { l: 'Matricule',   k: 'matricule' },
                { l: 'Nom',        k: 'nom' },
                { l: 'Prénom',     k: 'prenom' },
                { l: 'Email',      k: 'email' },
                { l: 'Téléphone',  k: 'telephone' },
                { l: 'Spécialité', k: 'specialite' },
              ].map(f => (
                <div className="form-group" key={f.k}>
                  <label className="form-label">{f.l}</label>
                  <input className="form-control" value={form[f.k]} onChange={e => setForm({...form, [f.k]: e.target.value})}
                    required={['matricule','nom','prenom','email'].includes(f.k)} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select className="form-control" value={form.statut} onChange={e => setForm({...form, statut: e.target.value})}>
                  <option value="vacataire">Vacataire</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Taux horaire (FCFA)</label>
                <input type="number" className="form-control" value={form.taux_horaire} onChange={e => setForm({...form, taux_horaire: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── MATIÈRES ─────────────────────────────────────────────────
export function MatieresPage() {
  const { get, post, put, loading } = useApi()
  const [matieres, setMatieres] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ code: '', libelle: '', volume_horaire_total: 40, coefficient: 3 })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/matieres'); if (d) setMatieres(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(m=null) {
    if (m) { setForm({ code: m.code, libelle: m.libelle, volume_horaire_total: m.volume_horaire_total, coefficient: m.coefficient }); setEditId(m.id) }
    else   { setForm({ code: '', libelle: '', volume_horaire_total: 40, coefficient: 3 }); setEditId(null) }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/matieres/${editId}`, form) : await post('/matieres', form)
    if (r !== null) { showToast(editId ? 'Modifiée !' : 'Créée !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">📚 Matières</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvelle matière</button>
      </div>
      <div className="table-container card">
        <table>
          <thead><tr><th>Code</th><th>Libellé</th><th>Volume horaire</th><th>Coefficient</th><th>Actions</th></tr></thead>
          <tbody>
            {matieres.map(m => (
              <tr key={m.id}>
                <td><span className="badge badge-primary">{m.code}</span></td>
                <td><strong>{m.libelle}</strong></td>
                <td>{m.volume_horaire_total}h</td>
                <td>{m.coefficient}</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(m)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {matieres.length === 0 && <div className="empty-state"><p>Aucune matière.</p></div>}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvelle'} matière</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Code</label><input className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Libellé</label><input className="form-control" value={form.libelle} onChange={e => setForm({...form, libelle: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Volume horaire (h)</label><input type="number" className="form-control" value={form.volume_horaire_total} onChange={e => setForm({...form, volume_horaire_total: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Coefficient</label><input type="number" className="form-control" value={form.coefficient} onChange={e => setForm({...form, coefficient: e.target.value})} required /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SALLES ───────────────────────────────────────────────────
export function SallesPage() {
  const { get, post, put, loading } = useApi()
  const [salles, setSalles] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ code: '', capacite: 30, equipements: '', batiment: '' })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/salles'); if (d) setSalles(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(s=null) {
    if (s) { setForm({ code: s.code, capacite: s.capacite, equipements: s.equipements||'', batiment: s.batiment||'' }); setEditId(s.id) }
    else   { setForm({ code: '', capacite: 30, equipements: '', batiment: '' }); setEditId(null) }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/salles/${editId}`, form) : await post('/salles', form)
    if (r !== null) { showToast(editId ? 'Modifiée !' : 'Créée !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">🚪 Salles</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvelle salle</button>
      </div>
      <div className="table-container card">
        <table>
          <thead><tr><th>Code</th><th>Capacité</th><th>Équipements</th><th>Bâtiment</th><th>Actions</th></tr></thead>
          <tbody>
            {salles.map(s => (
              <tr key={s.id}>
                <td><span className="badge badge-primary">{s.code}</span></td>
                <td>{s.capacite} places</td>
                <td style={{ fontSize: '0.8rem' }}>{s.equipements}</td>
                <td>{s.batiment}</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(s)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {salles.length === 0 && <div className="empty-state"><p>Aucune salle.</p></div>}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvelle'} salle</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Code</label><input className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Capacité</label><input type="number" className="form-control" value={form.capacite} onChange={e => setForm({...form, capacite: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Équipements</label><input className="form-control" value={form.equipements} onChange={e => setForm({...form, equipements: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Bâtiment</label><input className="form-control" value={form.batiment} onChange={e => setForm({...form, batiment: e.target.value})} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}// ============================================================
//  EduSchedule Pro — Pages Référentiels (CORRIGÉ - nom avec 's')
//  frontend/src/pages/ReferentielsPages.jsx
//  ⚠️ Renommer ReferentielsPage.jsx → ReferentielsPages.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'

// ── ENSEIGNANTS ──────────────────────────────────────────────
export function EnseignantsPage() {
  const { get, post, put, loading } = useApi()
  const [enseignants, setEnseignants] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ matricule:'', nom:'', prenom:'', email:'', telephone:'', specialite:'', statut:'vacataire', taux_horaire:5000 })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/enseignants'); if (d) setEnseignants(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(e=null) {
    if (e) {
      setForm({ matricule:e.matricule, nom:e.nom, prenom:e.prenom, email:e.email, telephone:e.telephone||'', specialite:e.specialite||'', statut:e.statut, taux_horaire:e.taux_horaire })
      setEditId(e.id)
    } else {
      setForm({ matricule:'', nom:'', prenom:'', email:'', telephone:'', specialite:'', statut:'vacataire', taux_horaire:5000 })
      setEditId(null)
    }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/enseignants/${editId}`, form) : await post('/enseignants', form)
    if (r !== null) { showToast(editId ? 'Modifié !' : 'Créé !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">👨‍🏫 Enseignants</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvel enseignant</button>
      </div>
      <div className="table-container card">
        <table>
          <thead>
            <tr><th>Matricule</th><th>Nom complet</th><th>Email</th><th>Spécialité</th><th>Statut</th><th>Taux/h</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {enseignants.map(e => (
              <tr key={e.id}>
                <td><span className="badge badge-gray">{e.matricule}</span></td>
                <td><strong>{e.prenom} {e.nom}</strong></td>
                <td>{e.email}</td>
                <td>{e.specialite}</td>
                <td><span className={`badge badge-${e.statut === 'permanent' ? 'success' : 'warning'}`}>{e.statut}</span></td>
                <td>{parseInt(e.taux_horaire).toLocaleString()} FCFA</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(e)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {enseignants.length === 0 && <div className="empty-state"><p>Aucun enseignant.</p></div>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvel'} enseignant</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {[
                { l: 'Matricule',   k: 'matricule' },
                { l: 'Nom',        k: 'nom' },
                { l: 'Prénom',     k: 'prenom' },
                { l: 'Email',      k: 'email' },
                { l: 'Téléphone',  k: 'telephone' },
                { l: 'Spécialité', k: 'specialite' },
              ].map(f => (
                <div className="form-group" key={f.k}>
                  <label className="form-label">{f.l}</label>
                  <input className="form-control" value={form[f.k]} onChange={e => setForm({...form, [f.k]: e.target.value})}
                    required={['matricule','nom','prenom','email'].includes(f.k)} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select className="form-control" value={form.statut} onChange={e => setForm({...form, statut: e.target.value})}>
                  <option value="vacataire">Vacataire</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Taux horaire (FCFA)</label>
                <input type="number" className="form-control" value={form.taux_horaire} onChange={e => setForm({...form, taux_horaire: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── MATIÈRES ─────────────────────────────────────────────────
export function MatieresPage() {
  const { get, post, put, loading } = useApi()
  const [matieres, setMatieres] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ code: '', libelle: '', volume_horaire_total: 40, coefficient: 3 })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/matieres'); if (d) setMatieres(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(m=null) {
    if (m) { setForm({ code: m.code, libelle: m.libelle, volume_horaire_total: m.volume_horaire_total, coefficient: m.coefficient }); setEditId(m.id) }
    else   { setForm({ code: '', libelle: '', volume_horaire_total: 40, coefficient: 3 }); setEditId(null) }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/matieres/${editId}`, form) : await post('/matieres', form)
    if (r !== null) { showToast(editId ? 'Modifiée !' : 'Créée !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">📚 Matières</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvelle matière</button>
      </div>
      <div className="table-container card">
        <table>
          <thead><tr><th>Code</th><th>Libellé</th><th>Volume horaire</th><th>Coefficient</th><th>Actions</th></tr></thead>
          <tbody>
            {matieres.map(m => (
              <tr key={m.id}>
                <td><span className="badge badge-primary">{m.code}</span></td>
                <td><strong>{m.libelle}</strong></td>
                <td>{m.volume_horaire_total}h</td>
                <td>{m.coefficient}</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(m)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {matieres.length === 0 && <div className="empty-state"><p>Aucune matière.</p></div>}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvelle'} matière</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Code</label><input className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Libellé</label><input className="form-control" value={form.libelle} onChange={e => setForm({...form, libelle: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Volume horaire (h)</label><input type="number" className="form-control" value={form.volume_horaire_total} onChange={e => setForm({...form, volume_horaire_total: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Coefficient</label><input type="number" className="form-control" value={form.coefficient} onChange={e => setForm({...form, coefficient: e.target.value})} required /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SALLES ───────────────────────────────────────────────────
export function SallesPage() {
  const { get, post, put, loading } = useApi()
  const [salles, setSalles] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ code: '', capacite: 30, equipements: '', batiment: '' })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/salles'); if (d) setSalles(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(s=null) {
    if (s) { setForm({ code: s.code, capacite: s.capacite, equipements: s.equipements||'', batiment: s.batiment||'' }); setEditId(s.id) }
    else   { setForm({ code: '', capacite: 30, equipements: '', batiment: '' }); setEditId(null) }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/salles/${editId}`, form) : await post('/salles', form)
    if (r !== null) { showToast(editId ? 'Modifiée !' : 'Créée !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">🚪 Salles</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvelle salle</button>
      </div>
      <div className="table-container card">
        <table>
          <thead><tr><th>Code</th><th>Capacité</th><th>Équipements</th><th>Bâtiment</th><th>Actions</th></tr></thead>
          <tbody>
            {salles.map(s => (
              <tr key={s.id}>
                <td><span className="badge badge-primary">{s.code}</span></td>
                <td>{s.capacite} places</td>
                <td style={{ fontSize: '0.8rem' }}>{s.equipements}</td>
                <td>{s.batiment}</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(s)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {salles.length === 0 && <div className="empty-state"><p>Aucune salle.</p></div>}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvelle'} salle</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Code</label><input className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Capacité</label><input type="number" className="form-control" value={form.capacite} onChange={e => setForm({...form, capacite: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Équipements</label><input className="form-control" value={form.equipements} onChange={e => setForm({...form, equipements: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Bâtiment</label><input className="form-control" value={form.batiment} onChange={e => setForm({...form, batiment: e.target.value})} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}// ============================================================
//  EduSchedule Pro — Pages Référentiels (CORRIGÉ - nom avec 's')
//  frontend/src/pages/ReferentielsPages.jsx
//  ⚠️ Renommer ReferentielsPage.jsx → ReferentielsPages.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'

// ── ENSEIGNANTS ──────────────────────────────────────────────
export function EnseignantsPage() {
  const { get, post, put, loading } = useApi()
  const [enseignants, setEnseignants] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ matricule:'', nom:'', prenom:'', email:'', telephone:'', specialite:'', statut:'vacataire', taux_horaire:5000 })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/enseignants'); if (d) setEnseignants(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(e=null) {
    if (e) {
      setForm({ matricule:e.matricule, nom:e.nom, prenom:e.prenom, email:e.email, telephone:e.telephone||'', specialite:e.specialite||'', statut:e.statut, taux_horaire:e.taux_horaire })
      setEditId(e.id)
    } else {
      setForm({ matricule:'', nom:'', prenom:'', email:'', telephone:'', specialite:'', statut:'vacataire', taux_horaire:5000 })
      setEditId(null)
    }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/enseignants/${editId}`, form) : await post('/enseignants', form)
    if (r !== null) { showToast(editId ? 'Modifié !' : 'Créé !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">👨‍🏫 Enseignants</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvel enseignant</button>
      </div>
      <div className="table-container card">
        <table>
          <thead>
            <tr><th>Matricule</th><th>Nom complet</th><th>Email</th><th>Spécialité</th><th>Statut</th><th>Taux/h</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {enseignants.map(e => (
              <tr key={e.id}>
                <td><span className="badge badge-gray">{e.matricule}</span></td>
                <td><strong>{e.prenom} {e.nom}</strong></td>
                <td>{e.email}</td>
                <td>{e.specialite}</td>
                <td><span className={`badge badge-${e.statut === 'permanent' ? 'success' : 'warning'}`}>{e.statut}</span></td>
                <td>{parseInt(e.taux_horaire).toLocaleString()} FCFA</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(e)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {enseignants.length === 0 && <div className="empty-state"><p>Aucun enseignant.</p></div>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvel'} enseignant</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {[
                { l: 'Matricule',   k: 'matricule' },
                { l: 'Nom',        k: 'nom' },
                { l: 'Prénom',     k: 'prenom' },
                { l: 'Email',      k: 'email' },
                { l: 'Téléphone',  k: 'telephone' },
                { l: 'Spécialité', k: 'specialite' },
              ].map(f => (
                <div className="form-group" key={f.k}>
                  <label className="form-label">{f.l}</label>
                  <input className="form-control" value={form[f.k]} onChange={e => setForm({...form, [f.k]: e.target.value})}
                    required={['matricule','nom','prenom','email'].includes(f.k)} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select className="form-control" value={form.statut} onChange={e => setForm({...form, statut: e.target.value})}>
                  <option value="vacataire">Vacataire</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Taux horaire (FCFA)</label>
                <input type="number" className="form-control" value={form.taux_horaire} onChange={e => setForm({...form, taux_horaire: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── MATIÈRES ─────────────────────────────────────────────────
export function MatieresPage() {
  const { get, post, put, loading } = useApi()
  const [matieres, setMatieres] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ code: '', libelle: '', volume_horaire_total: 40, coefficient: 3 })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/matieres'); if (d) setMatieres(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(m=null) {
    if (m) { setForm({ code: m.code, libelle: m.libelle, volume_horaire_total: m.volume_horaire_total, coefficient: m.coefficient }); setEditId(m.id) }
    else   { setForm({ code: '', libelle: '', volume_horaire_total: 40, coefficient: 3 }); setEditId(null) }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/matieres/${editId}`, form) : await post('/matieres', form)
    if (r !== null) { showToast(editId ? 'Modifiée !' : 'Créée !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">📚 Matières</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvelle matière</button>
      </div>
      <div className="table-container card">
        <table>
          <thead><tr><th>Code</th><th>Libellé</th><th>Volume horaire</th><th>Coefficient</th><th>Actions</th></tr></thead>
          <tbody>
            {matieres.map(m => (
              <tr key={m.id}>
                <td><span className="badge badge-primary">{m.code}</span></td>
                <td><strong>{m.libelle}</strong></td>
                <td>{m.volume_horaire_total}h</td>
                <td>{m.coefficient}</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(m)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {matieres.length === 0 && <div className="empty-state"><p>Aucune matière.</p></div>}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvelle'} matière</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Code</label><input className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Libellé</label><input className="form-control" value={form.libelle} onChange={e => setForm({...form, libelle: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Volume horaire (h)</label><input type="number" className="form-control" value={form.volume_horaire_total} onChange={e => setForm({...form, volume_horaire_total: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Coefficient</label><input type="number" className="form-control" value={form.coefficient} onChange={e => setForm({...form, coefficient: e.target.value})} required /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SALLES ───────────────────────────────────────────────────
export function SallesPage() {
  const { get, post, put, loading } = useApi()
  const [salles, setSalles] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ code: '', capacite: 30, equipements: '', batiment: '' })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/salles'); if (d) setSalles(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(s=null) {
    if (s) { setForm({ code: s.code, capacite: s.capacite, equipements: s.equipements||'', batiment: s.batiment||'' }); setEditId(s.id) }
    else   { setForm({ code: '', capacite: 30, equipements: '', batiment: '' }); setEditId(null) }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/salles/${editId}`, form) : await post('/salles', form)
    if (r !== null) { showToast(editId ? 'Modifiée !' : 'Créée !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">🚪 Salles</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvelle salle</button>
      </div>
      <div className="table-container card">
        <table>
          <thead><tr><th>Code</th><th>Capacité</th><th>Équipements</th><th>Bâtiment</th><th>Actions</th></tr></thead>
          <tbody>
            {salles.map(s => (
              <tr key={s.id}>
                <td><span className="badge badge-primary">{s.code}</span></td>
                <td>{s.capacite} places</td>
                <td style={{ fontSize: '0.8rem' }}>{s.equipements}</td>
                <td>{s.batiment}</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(s)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {salles.length === 0 && <div className="empty-state"><p>Aucune salle.</p></div>}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvelle'} salle</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Code</label><input className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Capacité</label><input type="number" className="form-control" value={form.capacite} onChange={e => setForm({...form, capacite: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Équipements</label><input className="form-control" value={form.equipements} onChange={e => setForm({...form, equipements: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Bâtiment</label><input className="form-control" value={form.batiment} onChange={e => setForm({...form, batiment: e.target.value})} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}// ============================================================
//  EduSchedule Pro — Pages Référentiels (CORRIGÉ - nom avec 's')
//  frontend/src/pages/ReferentielsPages.jsx
//  ⚠️ Renommer ReferentielsPage.jsx → ReferentielsPages.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'

// ── ENSEIGNANTS ──────────────────────────────────────────────
export function EnseignantsPage() {
  const { get, post, put, loading } = useApi()
  const [enseignants, setEnseignants] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ matricule:'', nom:'', prenom:'', email:'', telephone:'', specialite:'', statut:'vacataire', taux_horaire:5000 })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/enseignants'); if (d) setEnseignants(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(e=null) {
    if (e) {
      setForm({ matricule:e.matricule, nom:e.nom, prenom:e.prenom, email:e.email, telephone:e.telephone||'', specialite:e.specialite||'', statut:e.statut, taux_horaire:e.taux_horaire })
      setEditId(e.id)
    } else {
      setForm({ matricule:'', nom:'', prenom:'', email:'', telephone:'', specialite:'', statut:'vacataire', taux_horaire:5000 })
      setEditId(null)
    }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/enseignants/${editId}`, form) : await post('/enseignants', form)
    if (r !== null) { showToast(editId ? 'Modifié !' : 'Créé !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">👨‍🏫 Enseignants</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvel enseignant</button>
      </div>
      <div className="table-container card">
        <table>
          <thead>
            <tr><th>Matricule</th><th>Nom complet</th><th>Email</th><th>Spécialité</th><th>Statut</th><th>Taux/h</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {enseignants.map(e => (
              <tr key={e.id}>
                <td><span className="badge badge-gray">{e.matricule}</span></td>
                <td><strong>{e.prenom} {e.nom}</strong></td>
                <td>{e.email}</td>
                <td>{e.specialite}</td>
                <td><span className={`badge badge-${e.statut === 'permanent' ? 'success' : 'warning'}`}>{e.statut}</span></td>
                <td>{parseInt(e.taux_horaire).toLocaleString()} FCFA</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(e)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {enseignants.length === 0 && <div className="empty-state"><p>Aucun enseignant.</p></div>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvel'} enseignant</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {[
                { l: 'Matricule',   k: 'matricule' },
                { l: 'Nom',        k: 'nom' },
                { l: 'Prénom',     k: 'prenom' },
                { l: 'Email',      k: 'email' },
                { l: 'Téléphone',  k: 'telephone' },
                { l: 'Spécialité', k: 'specialite' },
              ].map(f => (
                <div className="form-group" key={f.k}>
                  <label className="form-label">{f.l}</label>
                  <input className="form-control" value={form[f.k]} onChange={e => setForm({...form, [f.k]: e.target.value})}
                    required={['matricule','nom','prenom','email'].includes(f.k)} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select className="form-control" value={form.statut} onChange={e => setForm({...form, statut: e.target.value})}>
                  <option value="vacataire">Vacataire</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Taux horaire (FCFA)</label>
                <input type="number" className="form-control" value={form.taux_horaire} onChange={e => setForm({...form, taux_horaire: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── MATIÈRES ─────────────────────────────────────────────────
export function MatieresPage() {
  const { get, post, put, loading } = useApi()
  const [matieres, setMatieres] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ code: '', libelle: '', volume_horaire_total: 40, coefficient: 3 })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/matieres'); if (d) setMatieres(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(m=null) {
    if (m) { setForm({ code: m.code, libelle: m.libelle, volume_horaire_total: m.volume_horaire_total, coefficient: m.coefficient }); setEditId(m.id) }
    else   { setForm({ code: '', libelle: '', volume_horaire_total: 40, coefficient: 3 }); setEditId(null) }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/matieres/${editId}`, form) : await post('/matieres', form)
    if (r !== null) { showToast(editId ? 'Modifiée !' : 'Créée !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">📚 Matières</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvelle matière</button>
      </div>
      <div className="table-container card">
        <table>
          <thead><tr><th>Code</th><th>Libellé</th><th>Volume horaire</th><th>Coefficient</th><th>Actions</th></tr></thead>
          <tbody>
            {matieres.map(m => (
              <tr key={m.id}>
                <td><span className="badge badge-primary">{m.code}</span></td>
                <td><strong>{m.libelle}</strong></td>
                <td>{m.volume_horaire_total}h</td>
                <td>{m.coefficient}</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(m)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {matieres.length === 0 && <div className="empty-state"><p>Aucune matière.</p></div>}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvelle'} matière</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Code</label><input className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Libellé</label><input className="form-control" value={form.libelle} onChange={e => setForm({...form, libelle: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Volume horaire (h)</label><input type="number" className="form-control" value={form.volume_horaire_total} onChange={e => setForm({...form, volume_horaire_total: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Coefficient</label><input type="number" className="form-control" value={form.coefficient} onChange={e => setForm({...form, coefficient: e.target.value})} required /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SALLES ───────────────────────────────────────────────────
export function SallesPage() {
  const { get, post, put, loading } = useApi()
  const [salles, setSalles] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ code: '', capacite: 30, equipements: '', batiment: '' })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/salles'); if (d) setSalles(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(s=null) {
    if (s) { setForm({ code: s.code, capacite: s.capacite, equipements: s.equipements||'', batiment: s.batiment||'' }); setEditId(s.id) }
    else   { setForm({ code: '', capacite: 30, equipements: '', batiment: '' }); setEditId(null) }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/salles/${editId}`, form) : await post('/salles', form)
    if (r !== null) { showToast(editId ? 'Modifiée !' : 'Créée !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">🚪 Salles</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvelle salle</button>
      </div>
      <div className="table-container card">
        <table>
          <thead><tr><th>Code</th><th>Capacité</th><th>Équipements</th><th>Bâtiment</th><th>Actions</th></tr></thead>
          <tbody>
            {salles.map(s => (
              <tr key={s.id}>
                <td><span className="badge badge-primary">{s.code}</span></td>
                <td>{s.capacite} places</td>
                <td style={{ fontSize: '0.8rem' }}>{s.equipements}</td>
                <td>{s.batiment}</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(s)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {salles.length === 0 && <div className="empty-state"><p>Aucune salle.</p></div>}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvelle'} salle</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Code</label><input className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Capacité</label><input type="number" className="form-control" value={form.capacite} onChange={e => setForm({...form, capacite: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Équipements</label><input className="form-control" value={form.equipements} onChange={e => setForm({...form, equipements: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Bâtiment</label><input className="form-control" value={form.batiment} onChange={e => setForm({...form, batiment: e.target.value})} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}// ============================================================
//  EduSchedule Pro — Pages Référentiels (CORRIGÉ - nom avec 's')
//  frontend/src/pages/ReferentielsPages.jsx
//  ⚠️ Renommer ReferentielsPage.jsx → ReferentielsPages.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'

// ── ENSEIGNANTS ──────────────────────────────────────────────
export function EnseignantsPage() {
  const { get, post, put, loading } = useApi()
  const [enseignants, setEnseignants] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ matricule:'', nom:'', prenom:'', email:'', telephone:'', specialite:'', statut:'vacataire', taux_horaire:5000 })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/enseignants'); if (d) setEnseignants(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(e=null) {
    if (e) {
      setForm({ matricule:e.matricule, nom:e.nom, prenom:e.prenom, email:e.email, telephone:e.telephone||'', specialite:e.specialite||'', statut:e.statut, taux_horaire:e.taux_horaire })
      setEditId(e.id)
    } else {
      setForm({ matricule:'', nom:'', prenom:'', email:'', telephone:'', specialite:'', statut:'vacataire', taux_horaire:5000 })
      setEditId(null)
    }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/enseignants/${editId}`, form) : await post('/enseignants', form)
    if (r !== null) { showToast(editId ? 'Modifié !' : 'Créé !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">👨‍🏫 Enseignants</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvel enseignant</button>
      </div>
      <div className="table-container card">
        <table>
          <thead>
            <tr><th>Matricule</th><th>Nom complet</th><th>Email</th><th>Spécialité</th><th>Statut</th><th>Taux/h</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {enseignants.map(e => (
              <tr key={e.id}>
                <td><span className="badge badge-gray">{e.matricule}</span></td>
                <td><strong>{e.prenom} {e.nom}</strong></td>
                <td>{e.email}</td>
                <td>{e.specialite}</td>
                <td><span className={`badge badge-${e.statut === 'permanent' ? 'success' : 'warning'}`}>{e.statut}</span></td>
                <td>{parseInt(e.taux_horaire).toLocaleString()} FCFA</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(e)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {enseignants.length === 0 && <div className="empty-state"><p>Aucun enseignant.</p></div>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvel'} enseignant</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {[
                { l: 'Matricule',   k: 'matricule' },
                { l: 'Nom',        k: 'nom' },
                { l: 'Prénom',     k: 'prenom' },
                { l: 'Email',      k: 'email' },
                { l: 'Téléphone',  k: 'telephone' },
                { l: 'Spécialité', k: 'specialite' },
              ].map(f => (
                <div className="form-group" key={f.k}>
                  <label className="form-label">{f.l}</label>
                  <input className="form-control" value={form[f.k]} onChange={e => setForm({...form, [f.k]: e.target.value})}
                    required={['matricule','nom','prenom','email'].includes(f.k)} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select className="form-control" value={form.statut} onChange={e => setForm({...form, statut: e.target.value})}>
                  <option value="vacataire">Vacataire</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Taux horaire (FCFA)</label>
                <input type="number" className="form-control" value={form.taux_horaire} onChange={e => setForm({...form, taux_horaire: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── MATIÈRES ─────────────────────────────────────────────────
export function MatieresPage() {
  const { get, post, put, loading } = useApi()
  const [matieres, setMatieres] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ code: '', libelle: '', volume_horaire_total: 40, coefficient: 3 })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/matieres'); if (d) setMatieres(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(m=null) {
    if (m) { setForm({ code: m.code, libelle: m.libelle, volume_horaire_total: m.volume_horaire_total, coefficient: m.coefficient }); setEditId(m.id) }
    else   { setForm({ code: '', libelle: '', volume_horaire_total: 40, coefficient: 3 }); setEditId(null) }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/matieres/${editId}`, form) : await post('/matieres', form)
    if (r !== null) { showToast(editId ? 'Modifiée !' : 'Créée !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">📚 Matières</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvelle matière</button>
      </div>
      <div className="table-container card">
        <table>
          <thead><tr><th>Code</th><th>Libellé</th><th>Volume horaire</th><th>Coefficient</th><th>Actions</th></tr></thead>
          <tbody>
            {matieres.map(m => (
              <tr key={m.id}>
                <td><span className="badge badge-primary">{m.code}</span></td>
                <td><strong>{m.libelle}</strong></td>
                <td>{m.volume_horaire_total}h</td>
                <td>{m.coefficient}</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(m)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {matieres.length === 0 && <div className="empty-state"><p>Aucune matière.</p></div>}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvelle'} matière</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Code</label><input className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Libellé</label><input className="form-control" value={form.libelle} onChange={e => setForm({...form, libelle: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Volume horaire (h)</label><input type="number" className="form-control" value={form.volume_horaire_total} onChange={e => setForm({...form, volume_horaire_total: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Coefficient</label><input type="number" className="form-control" value={form.coefficient} onChange={e => setForm({...form, coefficient: e.target.value})} required /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SALLES ───────────────────────────────────────────────────
export function SallesPage() {
  const { get, post, put, loading } = useApi()
  const [salles, setSalles] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ code: '', capacite: 30, equipements: '', batiment: '' })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/salles'); if (d) setSalles(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(s=null) {
    if (s) { setForm({ code: s.code, capacite: s.capacite, equipements: s.equipements||'', batiment: s.batiment||'' }); setEditId(s.id) }
    else   { setForm({ code: '', capacite: 30, equipements: '', batiment: '' }); setEditId(null) }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/salles/${editId}`, form) : await post('/salles', form)
    if (r !== null) { showToast(editId ? 'Modifiée !' : 'Créée !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">🚪 Salles</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvelle salle</button>
      </div>
      <div className="table-container card">
        <table>
          <thead><tr><th>Code</th><th>Capacité</th><th>Équipements</th><th>Bâtiment</th><th>Actions</th></tr></thead>
          <tbody>
            {salles.map(s => (
              <tr key={s.id}>
                <td><span className="badge badge-primary">{s.code}</span></td>
                <td>{s.capacite} places</td>
                <td style={{ fontSize: '0.8rem' }}>{s.equipements}</td>
                <td>{s.batiment}</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(s)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {salles.length === 0 && <div className="empty-state"><p>Aucune salle.</p></div>}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvelle'} salle</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Code</label><input className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Capacité</label><input type="number" className="form-control" value={form.capacite} onChange={e => setForm({...form, capacite: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Équipements</label><input className="form-control" value={form.equipements} onChange={e => setForm({...form, equipements: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Bâtiment</label><input className="form-control" value={form.batiment} onChange={e => setForm({...form, batiment: e.target.value})} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}// ============================================================
//  EduSchedule Pro — Pages Référentiels (CORRIGÉ - nom avec 's')
//  frontend/src/pages/ReferentielsPages.jsx
//  ⚠️ Renommer ReferentielsPage.jsx → ReferentielsPages.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'

// ── ENSEIGNANTS ──────────────────────────────────────────────
export function EnseignantsPage() {
  const { get, post, put, loading } = useApi()
  const [enseignants, setEnseignants] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ matricule:'', nom:'', prenom:'', email:'', telephone:'', specialite:'', statut:'vacataire', taux_horaire:5000 })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/enseignants'); if (d) setEnseignants(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(e=null) {
    if (e) {
      setForm({ matricule:e.matricule, nom:e.nom, prenom:e.prenom, email:e.email, telephone:e.telephone||'', specialite:e.specialite||'', statut:e.statut, taux_horaire:e.taux_horaire })
      setEditId(e.id)
    } else {
      setForm({ matricule:'', nom:'', prenom:'', email:'', telephone:'', specialite:'', statut:'vacataire', taux_horaire:5000 })
      setEditId(null)
    }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/enseignants/${editId}`, form) : await post('/enseignants', form)
    if (r !== null) { showToast(editId ? 'Modifié !' : 'Créé !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">👨‍🏫 Enseignants</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvel enseignant</button>
      </div>
      <div className="table-container card">
        <table>
          <thead>
            <tr><th>Matricule</th><th>Nom complet</th><th>Email</th><th>Spécialité</th><th>Statut</th><th>Taux/h</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {enseignants.map(e => (
              <tr key={e.id}>
                <td><span className="badge badge-gray">{e.matricule}</span></td>
                <td><strong>{e.prenom} {e.nom}</strong></td>
                <td>{e.email}</td>
                <td>{e.specialite}</td>
                <td><span className={`badge badge-${e.statut === 'permanent' ? 'success' : 'warning'}`}>{e.statut}</span></td>
                <td>{parseInt(e.taux_horaire).toLocaleString()} FCFA</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(e)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {enseignants.length === 0 && <div className="empty-state"><p>Aucun enseignant.</p></div>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvel'} enseignant</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {[
                { l: 'Matricule',   k: 'matricule' },
                { l: 'Nom',        k: 'nom' },
                { l: 'Prénom',     k: 'prenom' },
                { l: 'Email',      k: 'email' },
                { l: 'Téléphone',  k: 'telephone' },
                { l: 'Spécialité', k: 'specialite' },
              ].map(f => (
                <div className="form-group" key={f.k}>
                  <label className="form-label">{f.l}</label>
                  <input className="form-control" value={form[f.k]} onChange={e => setForm({...form, [f.k]: e.target.value})}
                    required={['matricule','nom','prenom','email'].includes(f.k)} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select className="form-control" value={form.statut} onChange={e => setForm({...form, statut: e.target.value})}>
                  <option value="vacataire">Vacataire</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Taux horaire (FCFA)</label>
                <input type="number" className="form-control" value={form.taux_horaire} onChange={e => setForm({...form, taux_horaire: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── MATIÈRES ─────────────────────────────────────────────────
export function MatieresPage() {
  const { get, post, put, loading } = useApi()
  const [matieres, setMatieres] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ code: '', libelle: '', volume_horaire_total: 40, coefficient: 3 })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/matieres'); if (d) setMatieres(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(m=null) {
    if (m) { setForm({ code: m.code, libelle: m.libelle, volume_horaire_total: m.volume_horaire_total, coefficient: m.coefficient }); setEditId(m.id) }
    else   { setForm({ code: '', libelle: '', volume_horaire_total: 40, coefficient: 3 }); setEditId(null) }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/matieres/${editId}`, form) : await post('/matieres', form)
    if (r !== null) { showToast(editId ? 'Modifiée !' : 'Créée !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">📚 Matières</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvelle matière</button>
      </div>
      <div className="table-container card">
        <table>
          <thead><tr><th>Code</th><th>Libellé</th><th>Volume horaire</th><th>Coefficient</th><th>Actions</th></tr></thead>
          <tbody>
            {matieres.map(m => (
              <tr key={m.id}>
                <td><span className="badge badge-primary">{m.code}</span></td>
                <td><strong>{m.libelle}</strong></td>
                <td>{m.volume_horaire_total}h</td>
                <td>{m.coefficient}</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(m)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {matieres.length === 0 && <div className="empty-state"><p>Aucune matière.</p></div>}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvelle'} matière</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Code</label><input className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Libellé</label><input className="form-control" value={form.libelle} onChange={e => setForm({...form, libelle: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Volume horaire (h)</label><input type="number" className="form-control" value={form.volume_horaire_total} onChange={e => setForm({...form, volume_horaire_total: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Coefficient</label><input type="number" className="form-control" value={form.coefficient} onChange={e => setForm({...form, coefficient: e.target.value})} required /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SALLES ───────────────────────────────────────────────────
export function SallesPage() {
  const { get, post, put, loading } = useApi()
  const [salles, setSalles] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ code: '', capacite: 30, equipements: '', batiment: '' })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/salles'); if (d) setSalles(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(s=null) {
    if (s) { setForm({ code: s.code, capacite: s.capacite, equipements: s.equipements||'', batiment: s.batiment||'' }); setEditId(s.id) }
    else   { setForm({ code: '', capacite: 30, equipements: '', batiment: '' }); setEditId(null) }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/salles/${editId}`, form) : await post('/salles', form)
    if (r !== null) { showToast(editId ? 'Modifiée !' : 'Créée !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">🚪 Salles</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvelle salle</button>
      </div>
      <div className="table-container card">
        <table>
          <thead><tr><th>Code</th><th>Capacité</th><th>Équipements</th><th>Bâtiment</th><th>Actions</th></tr></thead>
          <tbody>
            {salles.map(s => (
              <tr key={s.id}>
                <td><span className="badge badge-primary">{s.code}</span></td>
                <td>{s.capacite} places</td>
                <td style={{ fontSize: '0.8rem' }}>{s.equipements}</td>
                <td>{s.batiment}</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(s)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {salles.length === 0 && <div className="empty-state"><p>Aucune salle.</p></div>}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvelle'} salle</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Code</label><input className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Capacité</label><input type="number" className="form-control" value={form.capacite} onChange={e => setForm({...form, capacite: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Équipements</label><input className="form-control" value={form.equipements} onChange={e => setForm({...form, equipements: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Bâtiment</label><input className="form-control" value={form.batiment} onChange={e => setForm({...form, batiment: e.target.value})} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}// ============================================================
//  EduSchedule Pro — Pages Référentiels (CORRIGÉ - nom avec 's')
//  frontend/src/pages/ReferentielsPages.jsx
//  ⚠️ Renommer ReferentielsPage.jsx → ReferentielsPages.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'

// ── ENSEIGNANTS ──────────────────────────────────────────────
export function EnseignantsPage() {
  const { get, post, put, loading } = useApi()
  const [enseignants, setEnseignants] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ matricule:'', nom:'', prenom:'', email:'', telephone:'', specialite:'', statut:'vacataire', taux_horaire:5000 })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/enseignants'); if (d) setEnseignants(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(e=null) {
    if (e) {
      setForm({ matricule:e.matricule, nom:e.nom, prenom:e.prenom, email:e.email, telephone:e.telephone||'', specialite:e.specialite||'', statut:e.statut, taux_horaire:e.taux_horaire })
      setEditId(e.id)
    } else {
      setForm({ matricule:'', nom:'', prenom:'', email:'', telephone:'', specialite:'', statut:'vacataire', taux_horaire:5000 })
      setEditId(null)
    }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/enseignants/${editId}`, form) : await post('/enseignants', form)
    if (r !== null) { showToast(editId ? 'Modifié !' : 'Créé !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">👨‍🏫 Enseignants</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvel enseignant</button>
      </div>
      <div className="table-container card">
        <table>
          <thead>
            <tr><th>Matricule</th><th>Nom complet</th><th>Email</th><th>Spécialité</th><th>Statut</th><th>Taux/h</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {enseignants.map(e => (
              <tr key={e.id}>
                <td><span className="badge badge-gray">{e.matricule}</span></td>
                <td><strong>{e.prenom} {e.nom}</strong></td>
                <td>{e.email}</td>
                <td>{e.specialite}</td>
                <td><span className={`badge badge-${e.statut === 'permanent' ? 'success' : 'warning'}`}>{e.statut}</span></td>
                <td>{parseInt(e.taux_horaire).toLocaleString()} FCFA</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(e)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {enseignants.length === 0 && <div className="empty-state"><p>Aucun enseignant.</p></div>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvel'} enseignant</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {[
                { l: 'Matricule',   k: 'matricule' },
                { l: 'Nom',        k: 'nom' },
                { l: 'Prénom',     k: 'prenom' },
                { l: 'Email',      k: 'email' },
                { l: 'Téléphone',  k: 'telephone' },
                { l: 'Spécialité', k: 'specialite' },
              ].map(f => (
                <div className="form-group" key={f.k}>
                  <label className="form-label">{f.l}</label>
                  <input className="form-control" value={form[f.k]} onChange={e => setForm({...form, [f.k]: e.target.value})}
                    required={['matricule','nom','prenom','email'].includes(f.k)} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select className="form-control" value={form.statut} onChange={e => setForm({...form, statut: e.target.value})}>
                  <option value="vacataire">Vacataire</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Taux horaire (FCFA)</label>
                <input type="number" className="form-control" value={form.taux_horaire} onChange={e => setForm({...form, taux_horaire: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── MATIÈRES ─────────────────────────────────────────────────
export function MatieresPage() {
  const { get, post, put, loading } = useApi()
  const [matieres, setMatieres] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ code: '', libelle: '', volume_horaire_total: 40, coefficient: 3 })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/matieres'); if (d) setMatieres(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(m=null) {
    if (m) { setForm({ code: m.code, libelle: m.libelle, volume_horaire_total: m.volume_horaire_total, coefficient: m.coefficient }); setEditId(m.id) }
    else   { setForm({ code: '', libelle: '', volume_horaire_total: 40, coefficient: 3 }); setEditId(null) }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/matieres/${editId}`, form) : await post('/matieres', form)
    if (r !== null) { showToast(editId ? 'Modifiée !' : 'Créée !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">📚 Matières</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvelle matière</button>
      </div>
      <div className="table-container card">
        <table>
          <thead><tr><th>Code</th><th>Libellé</th><th>Volume horaire</th><th>Coefficient</th><th>Actions</th></tr></thead>
          <tbody>
            {matieres.map(m => (
              <tr key={m.id}>
                <td><span className="badge badge-primary">{m.code}</span></td>
                <td><strong>{m.libelle}</strong></td>
                <td>{m.volume_horaire_total}h</td>
                <td>{m.coefficient}</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(m)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {matieres.length === 0 && <div className="empty-state"><p>Aucune matière.</p></div>}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvelle'} matière</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Code</label><input className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Libellé</label><input className="form-control" value={form.libelle} onChange={e => setForm({...form, libelle: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Volume horaire (h)</label><input type="number" className="form-control" value={form.volume_horaire_total} onChange={e => setForm({...form, volume_horaire_total: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Coefficient</label><input type="number" className="form-control" value={form.coefficient} onChange={e => setForm({...form, coefficient: e.target.value})} required /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SALLES ───────────────────────────────────────────────────
export function SallesPage() {
  const { get, post, put, loading } = useApi()
  const [salles, setSalles] = useState([])
  const [modal,  setModal]  = useState(false)
  const [form,   setForm]   = useState({ code: '', capacite: 30, equipements: '', batiment: '' })
  const [editId, setEditId] = useState(null)
  const [toast,  setToast]  = useState(null)

  useEffect(() => { load() }, [])
  async function load() { const d = await get('/salles'); if (d) setSalles(Array.isArray(d) ? d : []) }
  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  function openModal(s=null) {
    if (s) { setForm({ code: s.code, capacite: s.capacite, equipements: s.equipements||'', batiment: s.batiment||'' }); setEditId(s.id) }
    else   { setForm({ code: '', capacite: 30, equipements: '', batiment: '' }); setEditId(null) }
    setModal(true)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const r = editId ? await put(`/salles/${editId}`, form) : await post('/salles', form)
    if (r !== null) { showToast(editId ? 'Modifiée !' : 'Créée !'); setModal(false); load() }
  }

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      <div className="page-header">
        <div><h1 className="page-title">🚪 Salles</h1></div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvelle salle</button>
      </div>
      <div className="table-container card">
        <table>
          <thead><tr><th>Code</th><th>Capacité</th><th>Équipements</th><th>Bâtiment</th><th>Actions</th></tr></thead>
          <tbody>
            {salles.map(s => (
              <tr key={s.id}>
                <td><span className="badge badge-primary">{s.code}</span></td>
                <td>{s.capacite} places</td>
                <td style={{ fontSize: '0.8rem' }}>{s.equipements}</td>
                <td>{s.batiment}</td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => openModal(s)}>✏️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {salles.length === 0 && <div className="empty-state"><p>Aucune salle.</p></div>}
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Nouvelle'} salle</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Code</label><input className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Capacité</label><input type="number" className="form-control" value={form.capacite} onChange={e => setForm({...form, capacite: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Équipements</label><input className="form-control" value={form.equipements} onChange={e => setForm({...form, equipements: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Bâtiment</label><input className="form-control" value={form.batiment} onChange={e => setForm({...form, batiment: e.target.value})} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}