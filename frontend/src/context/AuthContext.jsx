import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('esp_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('esp_token');
      const savedUser  = localStorage.getItem('esp_user');
      if (savedToken && savedUser && savedUser !== 'undefined') {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } else {
        localStorage.removeItem('esp_token');
        localStorage.removeItem('esp_user');
        setToken(null);
        setUser(null);
      }
    } catch (e) {
      localStorage.removeItem('esp_token');
      localStorage.removeItem('esp_user');
      setToken(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth?action=login', { email, password });
    localStorage.setItem('esp_token', data.token);
    localStorage.setItem('esp_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    api.post('/auth?action=logout').catch(() => {});
    localStorage.removeItem('esp_token');
    localStorage.removeItem('esp_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
