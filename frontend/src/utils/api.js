// frontend/src/utils/api.js
function getBase() {
  const host = window.location.hostname;

  // Toujours construire l'URL backend depuis le même hôte que le frontend
  // Cela fonctionne sur localhost, IP locale ET ngrok
  if (host === 'localhost' || host === '127.0.0.1') {
    // Sur localhost : utiliser .env si disponible, sinon localhost
    return process.env.REACT_APP_API_URL || 'http://localhost/eduschedulepro/backend/api';
  }

  // Sur IP locale (192.168.x.x, 10.x.x.x) : toujours utiliser l'IP du host
  if (host.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01]))/)) {
    return 'http://' + host + '/eduschedulepro/backend/api';
  }

  // Sur ngrok ou domaine externe : utiliser .env
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;

  // Fallback
  return 'http://' + host + '/eduschedulepro/backend/api';
}

const BASE = getBase();

function getToken() { return localStorage.getItem('esp_token'); }

const ROUTE_MAP = {
  'auth':          'auth.php',
  'classes':       'classes.php',
  'enseignants':   'enseignants.php',
  'matieres':      'matieres.php',
  'salles':        'salles.php',
  'emploi-temps':  'emploi_temps.php',
  'creneaux':      'creneaux.php',
  'pointages':     'pointages.php',
  'cahiers':       'cahiers.php',
  'vacations':     'vacations.php',
  'dashboard':     'dashboard.php',
  'logs':          'logs.php',
  'utilisateurs':  'utilisateurs.php',
};

function buildUrl(path) {
  const [pathPart, queryPart] = path.split('?');
  const segments = pathPart.replace(/^\//, '').split('/');
  const resource = segments[0];
  const phpFile  = ROUTE_MAP[resource] || resource + '.php';
  const params   = new URLSearchParams(queryPart || '');

  if (segments[1] && /^\d+$/.test(segments[1])) {
    params.set('id', segments[1]);
  }
  if (segments[2]) {
    params.set('action', segments[2]);
  }
  if (segments[1] && !/^\d+$/.test(segments[1])) {
    params.set('action', segments[1]);
  }

  const qs = params.toString();
  return BASE + '/' + phpFile + (qs ? '?' + qs : '');
}

async function request(method, path, body) {
  const token = getToken();
  const url   = buildUrl(path);
  const opts  = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
  };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res  = await fetch(url, opts);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); }
    catch { data = { error: 'Reponse invalide du serveur: ' + text.slice(0, 100) }; }
    if (!res.ok) throw new Error(data.error || 'Erreur ' + res.status);
    return data;
  } catch (fetchError) {
    if (fetchError.message === 'Failed to fetch') {
      throw new Error('Impossible de contacter le serveur. Verifiez que WAMP est actif et que le backend est accessible.');
    }
    throw fetchError;
  }
}

export const api = {
  get:  (path)       => request('GET',    path),
  post: (path, body) => request('POST',   path, body),
  put:  (path, body) => request('PUT',    path, body),
  del:  (path)       => request('DELETE', path),
};

export const formatDate   = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';
export const formatTime   = (t) => t ? t.slice(0, 5) : '-';
export const formatMoney  = (n) => new Intl.NumberFormat('fr-FR').format(n || 0) + ' FCFA';
export const calcDuration = (d, f) => {
  if (!d || !f) return 0;
  return Math.round((new Date('1970-01-01T' + f) - new Date('1970-01-01T' + d)) / 36000) / 100;
};
export const JOURS    = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
export const ROLES_FR = {
  admin: 'Administrateur', enseignant: 'Enseignant', delegue: 'Delegue',
  surveillant: 'Surveillant', comptable: 'Comptable', etudiant: 'Etudiant',
};
