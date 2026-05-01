/**
 * utils/calcDuration.js — Calculs de durées et montants
 * ===============================================================
 * Fonctions utilitaires pour calculer des durées de séances,
 * des totaux d'heures et des montants de vacation.
 * ===============================================================
 */

/**
 * Calcule la durée en minutes entre deux heures "HH:MM"
 * @param {string} debut  ex: "08:00"
 * @param {string} fin    ex: "10:00"
 * @returns {number} durée en minutes
 */
export function calcDureeMinutes(debut, fin) {
  if (!debut || !fin) return 0;
  const [hD, mD] = debut.split(':').map(Number);
  const [hF, mF] = fin.split(':').map(Number);
  return (hF * 60 + mF) - (hD * 60 + mD);
}

/**
 * Calcule la durée en heures (décimal) entre deux heures "HH:MM"
 * @param {string} debut
 * @param {string} fin
 * @returns {number} ex: 1.5 pour 1h30
 */
export function calcDureeHeures(debut, fin) {
  return calcDureeMinutes(debut, fin) / 60;
}

/**
 * Formate une durée en minutes en texte lisible
 * @param {number} minutes
 * @returns {string} ex: "1h30", "45min"
 */
export function formatDuree(minutes) {
  if (!minutes || minutes <= 0) return '0min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}

/**
 * Calcule le montant total d'une fiche de vacation
 * @param {number} heuresCM
 * @param {number} heuresTD
 * @param {number} heuresTP
 * @param {number} tauxHoraire - en FCFA
 * @returns {number} montant total en FCFA
 */
export function calcMontantVacation(heuresCM, heuresTD, heuresTP, tauxHoraire = 5000) {
  const total = (heuresCM || 0) + (heuresTD || 0) + (heuresTP || 0);
  return total * tauxHoraire;
}

/**
 * Formate un montant en FCFA
 * @param {number} montant
 * @returns {string} ex: "25 000 FCFA"
 */
export function formatMontantFCFA(montant) {
  return new Intl.NumberFormat('fr-FR', {
    style:                 'currency',
    currency:              'XOF',
    maximumFractionDigits: 0,
  }).format(montant || 0);
}

/**
 * Calcule le total d'heures d'un tableau de créneaux
 * @param {Array} creneaux - tableau d'objets avec heure_debut et heure_fin
 * @returns {number} total en heures
 */
export function totalHeuresCreneaux(creneaux = []) {
  return creneaux.reduce((acc, cr) => {
    return acc + calcDureeHeures(cr.heure_debut, cr.heure_fin);
  }, 0);
}

/**
 * Vérifie si deux créneaux se chevauchent
 * @param {string} debut1, fin1 - premier créneau "HH:MM"
 * @param {string} debut2, fin2 - second créneau "HH:MM"
 * @returns {boolean}
 */
export function chevauchement(debut1, fin1, debut2, fin2) {
  const toMin = (h) => {
    const [hh, mm] = h.split(':').map(Number);
    return hh * 60 + mm;
  };
  const d1 = toMin(debut1), f1 = toMin(fin1);
  const d2 = toMin(debut2), f2 = toMin(fin2);
  return d1 < f2 && d2 < f1;
}