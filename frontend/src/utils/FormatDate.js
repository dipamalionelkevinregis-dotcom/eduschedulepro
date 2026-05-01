/**
 * utils/formatDate.js — Fonctions utilitaires de formatage
 * ===============================================================
 * Centralise toutes les fonctions de formatage de dates, heures
 * et durées utilisées dans l'application.
 * ===============================================================
 */

/**
 * Formate une date en format court : "lun. 12 mai 2025"
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day:     '2-digit',
    month:   'long',
    year:    'numeric',
  });
}

/**
 * Formate une date en format court numérique : "12/05/2025"
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateShort(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR');
}

/**
 * Formate une date + heure : "12/05/2025 à 08:30"
 * @param {string|Date} datetime
 * @returns {string}
 */
export function formatDateTime(datetime) {
  if (!datetime) return '—';
  return new Date(datetime).toLocaleString('fr-FR', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formate uniquement l'heure : "08:30"
 * @param {string|Date} datetime
 * @returns {string}
 */
export function formatHeure(datetime) {
  if (!datetime) return '—';
  return new Date(datetime).toLocaleTimeString('fr-FR', {
    hour:   '2-digit',
    minute: '2-digit',
  });
}

/**
 * Retourne une date relative : "il y a 2 heures", "hier", "demain"
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelative(date) {
  if (!date) return '—';
  const now  = new Date();
  const then = new Date(date);
  const diff = now - then; // en ms
  const secs  = Math.floor(diff / 1000);
  const mins  = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);

  if (secs < 60)  return 'à l\'instant';
  if (mins < 60)  return `il y a ${mins} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days === 1) return 'hier';
  if (days < 7)   return `il y a ${days} jours`;
  return formatDateShort(date);
}

/**
 * Formate un créneau horaire : "Lundi 08:00 – 10:00"
 * @param {string} jour
 * @param {string} heureDebut
 * @param {string} heureFin
 * @returns {string}
 */
export function formatCreneau(jour, heureDebut, heureFin) {
  return `${jour || ''} ${heureDebut || ''} – ${heureFin || ''}`.trim();
}

/**
 * Retourne le numéro de la semaine d'une date
 * @param {string|Date} date
 * @returns {number}
 */
export function getSemaine(date) {
  const d     = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}