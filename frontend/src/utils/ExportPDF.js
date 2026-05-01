/**
 * utils/exportPDF.js — Export et impression de données
 * ===============================================================
 * Fonctions pour générer des PDFs depuis le frontend via
 * l'impression navigateur, ou pour déclencher les exports
 * PDF du backend.
 * ===============================================================
 */

/**
 * Ouvre la fenêtre d'impression du navigateur sur le contenu
 * d'un élément DOM (identifié par son id).
 *
 * @param {string} elementId - ID de l'élément HTML à imprimer
 * @param {string} titre     - Titre de la page imprimée
 */
export function imprimerElement(elementId, titre = 'EduSchedule Pro') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Élément #${elementId} introuvable pour l'impression.`);
    return;
  }

  // Créer une fenêtre d'impression temporaire
  const fenetre = window.open('', '_blank');
  fenetre.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>${titre}</title>
      <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        @media print {
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <h4 class="mb-3">${titre}</h4>
      ${element.innerHTML}
      <script>window.onload = () => { window.print(); window.close(); }<\/script>
    </body>
    </html>
  `);
  fenetre.document.close();
}

/**
 * Exporte un tableau de données en fichier CSV téléchargeable
 *
 * @param {Array<Object>} data      - tableau d'objets
 * @param {Array<string>} colonnes  - clés à inclure dans le CSV
 * @param {Array<string>} entetes   - libellés des colonnes
 * @param {string} nomFichier       - nom du fichier sans extension
 */
export function exporterCSV(data, colonnes, entetes, nomFichier = 'export') {
  if (!data || data.length === 0) return;

  // Construire l'en-tête CSV
  const lignes = [entetes.join(';')];

  // Construire chaque ligne
  data.forEach(row => {
    const valeurs = colonnes.map(col => {
      const val = row[col] ?? '';
      // Échapper les guillemets et les points-virgules
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    lignes.push(valeurs.join(';'));
  });

  // Créer le blob et déclencher le téléchargement
  const blob = new Blob(['\uFEFF' + lignes.join('\n')], {
    type: 'text/csv;charset=utf-8;'
  });
  const url  = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href     = url;
  lien.download = `${nomFichier}_${new Date().toISOString().slice(0, 10)}.csv`;
  lien.click();
  URL.revokeObjectURL(url);
}

/**
 * Ouvre le PDF généré par le backend dans un nouvel onglet
 *
 * @param {string} url    - URL de l'API backend qui retourne le PDF
 * @param {string} token  - JWT d'authentification
 */
export async function ouvrirPDFBackend(url, token) {
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Erreur serveur');
    const blob = await response.blob();
    const link = URL.createObjectURL(blob);
    window.open(link, '_blank');
  } catch (err) {
    console.error('Erreur ouverture PDF:', err);
    alert('Impossible d\'ouvrir le PDF. Vérifiez votre connexion.');
  }
}