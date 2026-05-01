import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const DEMO_ACCOUNTS = [
  { role: 'Admin',       email: 'admin@isge.bf',        icon: '👑', mdp: 'Admin@2026' },
  { role: 'Enseignant',  email: 'cbere@isge.bf',         icon: '👨‍🏫', mdp: 'Enseignant@2026' },
  { role: 'Délégué',     email: 'delegue.l3@isge.bf',    icon: '📋', mdp: 'Delegue@2026' },
  { role: 'Surveillant', email: 'surveillant@isge.bf',   icon: '👁', mdp: 'Surveillant@2026' },
];

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Identifiants incorrects.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.mdp);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #5B4FE9 0%, #3730A3 50%, #1E1B4B 100%)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>📆</div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1E1B4B', letterSpacing: '-0.5px' }}>
            EduSchedule Pro
          </h1>
          <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '4px' }}>
            ISGE-BF — Réseaux et Télécoms
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="alert-custom alert-danger">
            ⚠️ {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Adresse email</label>
            <input
              type="email"
              className="form-control-custom"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@isge.bf"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-control-custom"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary-custom"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}
            disabled={loading}
          >
            {loading ? <><div className="spinner" style={{width:16,height:16}}></div> Connexion...</> : '🔐 Se connecter'}
          </button>
        </form>

        {/* Comptes démo */}
        <div style={{ marginTop: '28px' }}>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9CA3AF', marginBottom: '10px' }}>
            Comptes de démonstration
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                onClick={() => fillDemo(acc)}
                style={{
                  background: '#F8F9FC',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '12px',
                  transition: 'background 0.15s',
                  fontFamily: 'Sora, sans-serif',
                }}
                onMouseOver={e => e.currentTarget.style.background = '#EEF2FF'}
                onMouseOut={e => e.currentTarget.style.background = '#F8F9FC'}
              >
                <div style={{ fontWeight: 600 }}>{acc.icon} {acc.role}</div>
                <div style={{ color: '#6B7280', marginTop: '2px', fontSize: '11px' }}>{acc.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}