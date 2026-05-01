/**
 * hooks/useQRScan.js — Hook de gestion du scan QR Code
 * ===============================================================
 * Gère la saisie et la validation d'un token QR pour le pointage.
 * Peut être utilisé avec un lecteur de code-barres USB (qui simule
 * un clavier) ou avec une saisie manuelle.
 *
 * Usage :
 *   const { token, setToken, scan, scanning, result } = useQRScan();
 * ===============================================================
 */

import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

/**
 * @returns {{
 *   token: string,
 *   setToken: Function,
 *   scan: Function,
 *   scanning: boolean,
 *   result: { success: boolean, message: string } | null,
 *   reset: Function
 * }}
 */
export function useQRScan() {
  const { apiUrl } = useAuth();

  const [token, setToken]     = useState('');   // token QR saisi
  const [scanning, setScanning] = useState(false); // requête en cours
  const [result, setResult]   = useState(null); // résultat du dernier scan

  /**
   * Envoie le token au backend pour valider le pointage.
   * @returns {Promise<boolean>} true si succès
   */
  const scan = useCallback(async () => {
    if (!token.trim()) return false;
    setScanning(true);
    setResult(null);
    try {
      const r = await axios.post(apiUrl('api/pointages/scan'), { token: token.trim() });
      const enseignant = r.data?.data?.enseignant || 'Enseignant';
      setResult({
        success: true,
        message: `✅ Pointage enregistré — ${enseignant}`,
        data:    r.data?.data,
      });
      setToken(''); // vider le champ après succès
      return true;
    } catch (err) {
      setResult({
        success: false,
        message: `❌ ${err.response?.data?.error || 'Token invalide ou expiré.'}`,
      });
      return false;
    } finally {
      setScanning(false);
    }
  }, [token, apiUrl]);

  /**
   * Réinitialise l'état du scanner
   */
  const reset = useCallback(() => {
    setToken('');
    setResult(null);
  }, []);

  return { token, setToken, scan, scanning, result, reset };
}