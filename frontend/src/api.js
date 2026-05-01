// ============================================================
//  EduSchedule Pro — api.js
//  Placer dans : frontend/src/api.js
//  Ce fichier connecte tout le Frontend React au Backend PHP
// ============================================================

import axios from 'axios';

// ---- URL de base du backend PHP (WAMP) ----
const BASE_URL = 'http://localhost/eduschedulepro/backend';

// ---- Instance axios principale ----
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ---- Intercepteur : ajoute le token JWT à chaque requête ----
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Intercepteur : gère les erreurs globalement ----
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide → déconnexion automatique
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================
//  AUTH
// ============================================================
export const authAPI = {

  // POST /api/auth/login
  login: async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  // POST /api/auth/logout
  logout: async () => {
    await api.post('/api/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // GET /api/auth/me
  me: async () => {
    const res = await api.get('/api/auth/me');
    return res.data.user;
  },

  // Récupère l'utilisateur depuis le localStorage
  getUser: () => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  },

  // Vérifie si l'utilisateur est connecté
  isLoggedIn: () => !!localStorage.getItem('token'),
};

// ============================================================
//  CLASSES
// ============================================================
export const classesAPI = {

  // GET /api/classes
  getAll: async (filters = {}) => {
    const res = await api.get('/api/classes', { params: filters });
    return res.data.data;
  },

  // GET /api/classes/:id
  getById: async (id) => {
    const res = await api.get(`/api/classes/${id}`);
    return res.data.data;
  },

  // POST /api/classes
  create: async (data) => {
    const res = await api.post('/api/classes', data);
    return res.data;
  },

  // PUT /api/classes/:id
  update: async (id, data) => {
    const res = await api.put(`/api/classes/${id}`, data);
    return res.data;
  },

  // DELETE /api/classes/:id
  delete: async (id) => {
    const res = await api.delete(`/api/classes/${id}`);
    return res.data;
  },
};

// ============================================================
//  MATIÈRES
// ============================================================
export const matieresAPI = {

  getAll: async () => {
    const res = await api.get('/api/matieres');
    return res.data.data;
  },

  create: async (data) => {
    const res = await api.post('/api/matieres', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/api/matieres/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/api/matieres/${id}`);
    return res.data;
  },
};

// ============================================================
//  ENSEIGNANTS
// ============================================================
export const enseignantsAPI = {

  getAll: async (filters = {}) => {
    const res = await api.get('/api/enseignants', { params: filters });
    return res.data.data;
  },

  create: async (data) => {
    const res = await api.post('/api/enseignants', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/api/enseignants/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/api/enseignants/${id}`);
    return res.data;
  },
};

// ============================================================
//  SALLES
// ============================================================
export const sallesAPI = {

  getAll: async () => {
    const res = await api.get('/api/salles');
    return res.data.data;
  },

  create: async (data) => {
    const res = await api.post('/api/salles', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/api/salles/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/api/salles/${id}`);
    return res.data;
  },
};

// ============================================================
//  EMPLOI DU TEMPS
// ============================================================
export const emploiTempsAPI = {

  // GET /api/emplois-temps?id_classe=1
  getAll: async (filters = {}) => {
    const res = await api.get('/api/emplois-temps', { params: filters });
    return res.data.data;
  },

  // GET /api/emplois-temps/:id (avec créneaux inclus)
  getById: async (id) => {
    const res = await api.get(`/api/emplois-temps/${id}`);
    return res.data.data;
  },

  // POST /api/emplois-temps
  create: async (data) => {
    const res = await api.post('/api/emplois-temps', data);
    return res.data;
  },

  // PUT /api/emplois-temps/:id/publier
  publier: async (id) => {
    const res = await api.put(`/api/emplois-temps/${id}/publier`);
    return res.data;
  },

  // PUT /api/emplois-temps/:id/depublier
  depublier: async (id) => {
    const res = await api.put(`/api/emplois-temps/${id}/depublier`);
    return res.data;
  },

  // POST /api/emplois-temps/:id/dupliquer
  dupliquer: async (id) => {
    const res = await api.post(`/api/emplois-temps/${id}/dupliquer`);
    return res.data;
  },
};

// ============================================================
//  CRÉNEAUX
// ============================================================
export const creneauxAPI = {

  // GET /api/creneaux?id_emploi_temps=1
  getAll: async (filters = {}) => {
    const res = await api.get('/api/creneaux', { params: filters });
    return res.data.data;
  },

  // GET /api/creneaux/:id/qr → génère le QR-Code
  getQR: async (id) => {
    const res = await api.get(`/api/creneaux/${id}/qr`);
    return res.data;
  },

  // POST /api/creneaux
  create: async (data) => {
    const res = await api.post('/api/creneaux', data);
    return res.data;
  },

  // PUT /api/creneaux/:id
  update: async (id, data) => {
    const res = await api.put(`/api/creneaux/${id}`, data);
    return res.data;
  },

  // DELETE /api/creneaux/:id
  delete: async (id) => {
    const res = await api.delete(`/api/creneaux/${id}`);
    return res.data;
  },
};

// ============================================================
//  POINTAGES (QR-Code)
// ============================================================
export const pointagesAPI = {

  // POST /api/pointages/scan — scanner un QR-Code
  scan: async (token_qr) => {
    const res = await api.post('/api/pointages/scan', { token_qr });
    return res.data;
  },

  // GET /api/pointages?id_creneau=1
  getAll: async (filters = {}) => {
    const res = await api.get('/api/pointages', { params: filters });
    return res.data.data;
  },

  // GET /api/pointages/:id/statut
  getStatut: async (id) => {
    const res = await api.get(`/api/pointages/${id}/statut`);
    return res.data;
  },
};

// ============================================================
//  CAHIER DE TEXTE
// ============================================================
export const cahiersAPI = {

  getAll: async (filters = {}) => {
    const res = await api.get('/api/cahiers', { params: filters });
    return res.data.data;
  },

  // POST /api/cahiers — le délégué crée une entrée
  create: async (data) => {
    const res = await api.post('/api/cahiers', data);
    return res.data;
  },

  // PUT /api/cahiers/:id/signer — signer (délégué ou enseignant)
  signer: async (id, signatureData) => {
    const res = await api.put(`/api/cahiers/${id}/signer`, { signature: signatureData });
    return res.data;
  },

  // PUT /api/cahiers/:id — modifier le contenu
  update: async (id, data) => {
    const res = await api.put(`/api/cahiers/${id}`, data);
    return res.data;
  },
};

// ============================================================
//  VACATIONS
// ============================================================
export const vacationsAPI = {

  getAll: async (filters = {}) => {
    const res = await api.get('/api/vacations', { params: filters });
    return res.data.data;
  },

  getById: async (id) => {
    const res = await api.get(`/api/vacations/${id}`);
    return res.data.data;
  },

  // POST /api/vacations — créer une fiche
  create: async (data) => {
    const res = await api.post('/api/vacations', data);
    return res.data;
  },

  // PUT /api/vacations/:id/valider — workflow de validation
  valider: async (id, commentaire = '') => {
    const res = await api.put(`/api/vacations/${id}/valider`, { commentaire });
    return res.data;
  },

  // PUT /api/vacations/:id/rejeter
  rejeter: async (id, motif) => {
    const res = await api.put(`/api/vacations/${id}/rejeter`, { motif });
    return res.data;
  },

  // GET /api/vacations/:id/pdf — télécharger le PDF
  getPDF: (id) => {
    window.open(`${BASE_URL}/api/vacations/${id}/pdf?token=${localStorage.getItem('token')}`, '_blank');
  },
};

// ============================================================
//  DASHBOARD
// ============================================================
export const dashboardAPI = {

  // GET /api/dashboard — stats selon le rôle connecté
  getStats: async () => {
    const res = await api.get('/api/dashboard');
    return res.data.data;
  },
};

// ============================================================
//  EXPORT PAR DÉFAUT
// ============================================================
export default api;