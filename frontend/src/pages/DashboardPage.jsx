import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, formatMoney } from '../utils/api';

function StatCard({ label, value, icon, color, to, sublabel }) {
  const navigate = useNavigate();
  const style = {
    background:'#fff', borderRadius:12, padding:'18px 20px',
    boxShadow:'0 1px 4px rgba(0,0,0,0.08)', borderLeft:'4px solid '+color,
    cursor: to ? 'pointer' : 'default',
    transition:'transform 0.15s, box-shadow 0.15s',
  };
  const handleClick = () => { if (to) navigate(to); };
  return (
    <div style={style} onClick={handleClick}
      onMouseEnter={e => { if (to) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.12)'; }}}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.08)'; }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontSize:'2rem', fontWeight:800, color:'#0f172a', lineHeight:1 }}>{value ?? '—'}</div>
          <div style={{ fontSize:'0.8rem', color:'#64748b', fontWeight:500, marginTop:4 }}>{label}</div>
          {sublabel && <div style={{ fontSize:'0.7rem', color: color, marginTop:3, fontWeight:600 }}>{sublabel}</div>}
          {to && <div style={{ fontSize:'0.7rem', color:'#94a3b8', marginTop:4 }}>→ Cliquer pour voir</div>}
        </div>
        <span style={{ fontSize:'1.8rem', opacity:0.8 }}>{icon}</span>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', marginBottom:20 }}>
      <h3 style={{ margin:'0 0 16px', fontSize:'0.95rem', fontWeight:700, color:'#0f172a', borderBottom:'2px solid #f1f5f9', paddingBottom:10 }}>{title}</h3>
      {children}
    </div>
  );
}

// ── Dashboard ADMIN / SURVEILLANT ──
function AdminDash({ stats }) {
  const [seancesDetail, setSeancesDetail] = useState([]);
  const [showSeances, setShowSeances] = useState(false);
  const [loadingSeances, setLoadingSeances] = useState(false);

  const voirSeances = async () => {
    if (showSeances) { setShowSeances(false); return; }
    setLoadingSeances(true);
    try {
      const d = await api.get('/emploi-temps');
      const today = new Date().toLocaleDateString('fr-FR',{weekday:'long'}).toLowerCase();
      const creneaux = d.flatMap(et =>
        (et.creneaux||[])
          .filter(c => c.jour === today)
          .map(c => ({ ...c, classe: et.classe_libelle, semaine: et.semaine_debut, statut_et: et.statut_publication }))
      );
      setSeancesDetail(creneaux);
      setShowSeances(true);
    } catch(e) { console.error(e); }
    finally { setLoadingSeances(false); }
  };

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14, marginBottom:20 }}>
        <StatCard label="Séances du jour" value={stats.seances_aujourd_hui} icon="📅" color="#6366f1"
          sublabel="Cliquer pour détail" to={null} />
        <StatCard label="Pointages du jour" value={stats.pointages_aujourd_hui} icon="✅" color="#16a34a" to="/emploi-temps" sublabel="Voir emplois du temps" />
        <StatCard label="Retards signalés" value={stats.retards} icon="⏰" color="#ea580c" to="/logs" sublabel="Voir journal" />
        <StatCard label="Cahiers non signés" value={stats.cahiers_non_signes} icon="📓" color="#dc2626" to="/cahiers" sublabel="Voir cahiers" />
        <StatCard label="Vacations en attente" value={stats.vacations_en_attente} icon="💰" color="#d97706" to="/vacations" sublabel="Voir fiches" />
        <StatCard label="Enseignants" value={stats.enseignants_count} icon="👨‍🏫" color="#0891b2" to="/enseignants" sublabel="Gérer" />
      </div>

      {/* Bouton voir séances du jour */}
      <button onClick={voirSeances} style={{ width:'100%', marginBottom:16, padding:'11px', background:'#6366f1', color:'#fff', border:'none', borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:'0.9rem' }}>
        {loadingSeances ? '⏳ Chargement...' : showSeances ? '▲ Masquer les séances du jour' : "📅 Voir les séances du jour"}
      </button>

      {showSeances && (
        <Section title={"📅 Séances du " + new Date().toLocaleDateString('fr-FR', {weekday:'long',day:'numeric',month:'long'})}>
          {seancesDetail.length === 0 ? (
            <p style={{ color:'#94a3b8', textAlign:'center', padding:16 }}>Aucune séance planifiée ce jour.</p>
          ) : (
            <div>
              {seancesDetail.map((s, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background: i%2===0?'#f8fafc':'#fff', borderRadius:8, marginBottom:6 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.88rem', color:'#0f172a' }}>{s.matiere}</div>
                    <div style={{ fontSize:'0.75rem', color:'#64748b', marginTop:2 }}>
                      {s.classe} · {s.salle_code} · {s.heure_debut?.slice(0,5)} – {s.heure_fin?.slice(0,5)}
                    </div>
                    <div style={{ fontSize:'0.72rem', color:'#94a3b8', marginTop:1 }}>{s.prenom} {s.nom}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.72rem', fontWeight:600,
                      background: s.qr_token ? '#dcfce7' : '#f1f5f9',
                      color:      s.qr_token ? '#16a34a' : '#94a3b8' }}>
                      {s.qr_token ? '📱 QR actif' : '🔒 Sans QR'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Pointages récents */}
      {stats.pointages_recents?.length > 0 && (
        <Section title="🕐 Pointages récents">
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
            <thead>
              <tr style={{ borderBottom:'2px solid #f1f5f9' }}>
                {['Enseignant','Matière','Heure','Statut'].map(h => (
                  <th key={h} style={{ padding:'8px 10px', textAlign:'left', color:'#64748b', fontWeight:600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.pointages_recents.map((p, i) => (
                <tr key={i} style={{ borderBottom:'1px solid #f8fafc' }}>
                  <td style={{ padding:'8px 10px', fontWeight:500 }}>{p.prenom} {p.nom}</td>
                  <td style={{ padding:'8px 10px', color:'#64748b' }}>{p.matiere}</td>
                  <td style={{ padding:'8px 10px', color:'#64748b' }}>
                    {new Date(p.heure_pointage_reelle).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
                  </td>
                  <td style={{ padding:'8px 10px' }}>
                    <span style={{ padding:'2px 8px', borderRadius:20, fontSize:'0.7rem', fontWeight:600,
                      background: p.statut==='ok'?'#dcfce7':p.statut==='retard'?'#fef3c7':'#fee2e2',
                      color:      p.statut==='ok'?'#16a34a':p.statut==='retard'?'#d97706':'#dc2626' }}>
                      {p.statut.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop:12, textAlign:'right' }}>
            <Link to="/logs" style={{ fontSize:'0.8rem', color:'#1d4ed8', fontWeight:600 }}>Voir tout le journal →</Link>
          </div>
        </Section>
      )}

      {/* Raccourcis */}
      <Section title="⚡ Raccourcis rapides">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {[
            { to:'/emploi-temps', icon:'📅', label:'Emplois du temps', color:'#6366f1' },
            { to:'/qrcodes',      icon:'🖨️', label:'Imprimer QR codes', color:'#0891b2' },
            { to:'/cahiers',      icon:'📓', label:'Cahiers de texte',  color:'#7c3aed' },
            { to:'/vacations',    icon:'💰', label:'Vacations',         color:'#d97706' },
            { to:'/enseignants',  icon:'👨‍🏫', label:'Enseignants',      color:'#16a34a' },
            { to:'/logs',         icon:'📋', label:"Journal audit",  color:'#64748b' },
          ].map(item => (
            <Link key={item.to} to={item.to} style={{ textDecoration:'none' }}>
              <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:10, padding:'14px 10px', textAlign:'center', transition:'all 0.15s', cursor:'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background=item.color+'15'; e.currentTarget.style.borderColor=item.color; }}
                onMouseLeave={e => { e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.borderColor='#e2e8f0'; }}>
                <div style={{ fontSize:'1.6rem', marginBottom:6 }}>{item.icon}</div>
                <div style={{ fontSize:'0.75rem', fontWeight:600, color:'#374151' }}>{item.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ── Dashboard ENSEIGNANT ──
function EnseignantDash({ stats }) {
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
        <StatCard label="Séances cette semaine" value={stats.mes_seances_semaine?.length} icon="📅" color="#0891b2" to="/emploi-temps" sublabel="Voir planning" />
        <StatCard label="Heures ce mois" value={(stats.total_heures_mois||0)+'h'} icon="⏱" color="#7c3aed" to="/vacations" sublabel="Voir vacations" />
        <StatCard label="Fiches vacation" value={stats.mes_vacations?.length} icon="💰" color="#16a34a" to="/vacations" sublabel="Voir fiches" />
      </div>

      <Section title="📅 Mes séances de la semaine">
        {!stats.mes_seances_semaine?.length ? (
          <p style={{ color:'#94a3b8', textAlign:'center', padding:16 }}>Aucune séance cette semaine.</p>
        ) : stats.mes_seances_semaine.map((s, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom: i < stats.mes_seances_semaine.length-1 ? '1px solid #f1f5f9':'none' }}>
            <div>
              <div style={{ fontWeight:700, fontSize:'0.88rem' }}>{s.matiere}</div>
              <div style={{ fontSize:'0.75rem', color:'#64748b', marginTop:2 }}>{s.classe} · {s.salle} · {s.jour} {s.heure_debut?.slice(0,5)}-{s.heure_fin?.slice(0,5)}</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
              <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.72rem', fontWeight:600,
                background: s.pointe ? '#dcfce7' : '#fef3c7',
                color:      s.pointe ? '#16a34a' : '#d97706' }}>
                {s.pointe ? '✅ Pointé' : '⏳ À pointer'}
              </span>
              {!s.pointe && s.qr_token && (
                <Link to="/pointage" style={{ fontSize:'0.7rem', color:'#1d4ed8', fontWeight:600 }}>→ Pointer maintenant</Link>
              )}
            </div>
          </div>
        ))}
        <div style={{ marginTop:12 }}>
          <Link to="/pointage" style={{ display:'block', textAlign:'center', background:'#1d4ed8', color:'#fff', padding:'10px', borderRadius:8, fontWeight:600, textDecoration:'none', fontSize:'0.85rem' }}>
            📱 Aller au pointage QR
          </Link>
        </div>
      </Section>

      {stats.mes_vacations?.length > 0 && (
        <Section title="💰 Mes fiches de vacation récentes">
          {stats.mes_vacations.map((v, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom: i < stats.mes_vacations.length-1 ? '1px solid #f1f5f9':'none', fontSize:'0.83rem' }}>
              <div>
                <div style={{ fontWeight:600 }}>
                  {new Date(v.annee, v.mois-1).toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}
                </div>
                <div style={{ color:'#64748b', fontSize:'0.75rem', marginTop:2 }}>{formatMoney(v.montant_net)}</div>
              </div>
              <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.7rem', fontWeight:600,
                background: v.statut==='approuvee_comptable'?'#dcfce7':v.statut==='visee_surveillant'?'#dbeafe':'#fef3c7',
                color:      v.statut==='approuvee_comptable'?'#16a34a':v.statut==='visee_surveillant'?'#1d4ed8':'#d97706' }}>
                {v.statut==='approuvee_comptable'?'✅ Approuvée':v.statut==='visee_surveillant'?'👁 Visée':'📝 En cours'}
              </span>
            </div>
          ))}
          <div style={{ marginTop:10, textAlign:'right' }}>
            <Link to="/vacations" style={{ fontSize:'0.8rem', color:'#1d4ed8', fontWeight:600 }}>Voir toutes mes fiches →</Link>
          </div>
        </Section>
      )}
    </div>
  );
}

// ── Dashboard DÉLÉGUÉ ──
function DelegueDash({ stats }) {
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
        <StatCard label="Cahiers à remplir" value={stats.cahiers_a_remplir} icon="✍️" color="#dc2626" to="/cahiers" sublabel="Remplir maintenant" />
        <StatCard label="Cahiers signés" value={stats.cahiers_recents?.filter(c=>c.statut==='cloture').length} icon="✅" color="#16a34a" to="/cahiers" sublabel="Voir historique" />
      </div>

      <Section title="📓 Cahiers récents">
        {!stats.cahiers_recents?.length ? (
          <p style={{ color:'#94a3b8', textAlign:'center', padding:16 }}>Aucun cahier pour le moment.</p>
        ) : stats.cahiers_recents.map((c, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom: i < stats.cahiers_recents.length-1 ? '1px solid #f1f5f9':'none' }}>
            <div>
              <div style={{ fontWeight:600, fontSize:'0.85rem' }}>{c.matiere}</div>
              <div style={{ fontSize:'0.75rem', color:'#64748b', marginTop:2 }}>{c.titre_cours || 'Sans titre'}</div>
            </div>
            <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.7rem', fontWeight:600,
              background: c.statut==='cloture'?'#dcfce7':c.statut==='signe_delegue'?'#fef9c3':'#f1f5f9',
              color:      c.statut==='cloture'?'#16a34a':c.statut==='signe_delegue'?'#b45309':'#64748b' }}>
              {c.statut==='cloture'?'✅ Clôturé':c.statut==='signe_delegue'?'✍️ Signé':'📝 Brouillon'}
            </span>
          </div>
        ))}
        <div style={{ marginTop:12, display:'flex', gap:10 }}>
          <Link to="/cahiers/nouveau" style={{ flex:1, display:'block', textAlign:'center', background:'#7c3aed', color:'#fff', padding:'9px', borderRadius:8, fontWeight:600, textDecoration:'none', fontSize:'0.82rem' }}>
            ✍️ Nouveau cahier
          </Link>
          <Link to="/cahiers" style={{ flex:1, display:'block', textAlign:'center', background:'#f1f5f9', color:'#374151', padding:'9px', borderRadius:8, fontWeight:600, textDecoration:'none', fontSize:'0.82rem', border:'1px solid #e2e8f0' }}>
            Voir tout
          </Link>
        </div>
      </Section>

      <Section title="📅 Emploi du temps de ma classe">
        {stats.emploi_temps ? (
          <div>
            <p style={{ fontSize:'0.82rem', color:'#64748b', marginTop:0 }}>
              Semaine du {stats.emploi_temps.semaine_debut ? new Date(stats.emploi_temps.semaine_debut+'T12:00:00').toLocaleDateString('fr-FR') : '-'}
            </p>
            <Link to="/emploi-temps" style={{ display:'block', textAlign:'center', background:'#1d4ed8', color:'#fff', padding:'9px', borderRadius:8, fontWeight:600, textDecoration:'none', fontSize:'0.82rem' }}>
              📅 Voir l'emploi du temps complet
            </Link>
          </div>
        ) : (
          <p style={{ color:'#94a3b8', textAlign:'center', padding:10, fontSize:'0.85rem' }}>Aucun emploi du temps publié.</p>
        )}
      </Section>
    </div>
  );
}

// ── Dashboard COMPTABLE ──
function ComptableDash() {
  return (
    <div>
      <Section title="💰 Gestion des Vacations">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {[
            { to:'/vacations', icon:'📋', label:'Toutes les fiches', desc:'Consulter et approuver', color:'#1d4ed8' },
            { to:'/vacations?statut=visee_surveillant', icon:'✅', label:'À approuver', desc:'Fiches visées par le surveillant', color:'#16a34a' },
          ].map(item => (
            <Link key={item.to} to={item.to} style={{ textDecoration:'none' }}>
              <div style={{ background:'#f8fafc', border:'2px solid #e2e8f0', borderRadius:12, padding:20, textAlign:'center', transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=item.color; e.currentTarget.style.background=item.color+'10'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.background='#f8fafc'; }}>
                <div style={{ fontSize:'2.5rem', marginBottom:8 }}>{item.icon}</div>
                <div style={{ fontWeight:700, color:'#0f172a', fontSize:'0.9rem' }}>{item.label}</div>
                <div style={{ color:'#64748b', fontSize:'0.75rem', marginTop:4 }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ── Page principale ──
export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard?role=' + user.role)
      .then(d => setStats(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.role]);

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:'1.5rem', fontWeight:800, color:'#0f172a' }}>
          {greet()}, {user.nom} 👋
        </h1>
        <p style={{ color:'#64748b', marginTop:4, fontSize:'0.85rem' }}>
          {new Date().toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60, color:'#64748b', fontSize:'1rem' }}>⏳ Chargement du tableau de bord...</div>
      ) : (
        <>
          {(user.role==='admin' || user.role==='surveillant') && stats && <AdminDash stats={stats} />}
          {user.role==='enseignant'  && stats && <EnseignantDash stats={stats} />}
          {user.role==='delegue'     && stats && <DelegueDash stats={stats} />}
          {user.role==='comptable'   && <ComptableDash />}
        </>
      )}
    </div>
  );
}
