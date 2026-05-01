// ============================================================
//  EduSchedule Pro — AuthContext.jsx
//  Contexte d'authentification global
//  Gère : connexion, déconnexion, token JWT, utilisateur courant
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// URL de base du backend PHP (sans mod_rewrite)
// Format : index.php?path=ENDPOINT
const BASE = 'http://localhost/eduschedulepro/backend/index.php';

// Création du contexte d'authentification
const AuthContext = createContext(null);

// ── Fournisseur du contexte ──
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('esp_token'));
  const [loading, setLoading] = useState(true);

  // ── Initialisation au démarrage ──
  // Si un token existe en localStorage, vérifier qu'il est toujours valide
  useEffect(() => {
    if (token) {
      // Configurer axios avec le token existant
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Vérifier la validité du token auprès du backend
      axios.get(apiUrl('api/auth/me'))
        .then(r => {
          const u = r.data?.data?.user || r.data?.user;
          setUser(u);
        })
        .catch(() => {
          // Token invalide ou expiré → déconnexion automatique
          localStorage.removeItem('esp_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      // Pas de token → pas connecté
      setLoading(false);
    }
  }, []);

  // ── Fonction de connexion ──
  const login = async (email, password) => {
    const res = await axios.post(
      apiUrl('api/auth/login'),
      { email, password },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const t = res.data.token;
    const u = res.data.user;

    if (!t) throw new Error('Token non reçu du serveur');

    // Sauvegarder le token et configurer axios
    localStorage.setItem('esp_token', t);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);

    return u;
  };

  // ── Fonction de déconnexion ──
  const logout = () => {
    localStorage.removeItem('esp_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  // ── Constructeur d'URL API ──
  // Gère correctement les query params (ex: api/classes?id=1)
  const apiUrl = (endpoint) => {
    // Séparer le path des éventuels query params
    const [path, params] = endpoint.split('?');
    const clean = path.replace(/^\//, '');
    const base  = `${BASE}?path=${clean}`;
    // Réattacher les query params si présents
    return params ? `${base}&${params}` : base;
  };

  return (
    <AuthContext.Provider value={{
      user,       // Utilisateur connecté (id, nom, prenom, email, role)
      token,      // Token JWT
      loading,    // true pendant la vérification initiale
      login,      // Fonction de connexion
      logout,     // Fonction de déconnexion
      apiUrl,     // Constructeur d'URL API
      BASE        // URL de base du backend
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook personnalisé ──
// Usage: const { user, login, logout, apiUrl } = useAuth();
export const useAuth = () => useContext(AuthContext);