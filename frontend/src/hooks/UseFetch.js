/**
 * hooks/useFetch.js — Hook personnalisé pour les requêtes API
 * ===============================================================
 * Abstrait les appels GET vers le backend.
 * Gère automatiquement : chargement, données, erreurs, rechargement.
 *
 * Usage :
 *   const { data, loading, error, reload } = useFetch('api/classes');
 * ===============================================================
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

/**
 * @param {string} endpoint   - endpoint relatif ex: 'api/classes'
 * @param {Object} [params]   - query params optionnels
 * @param {boolean} [auto]    - charger automatiquement (défaut: true)
 * @returns {{ data, loading, error, reload }}
 */
export function useFetch(endpoint, params = {}, auto = true) {
  const { apiUrl } = useAuth();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(auto);
  const [error, setError]     = useState('');

  /**
   * Fonction de chargement — mémoïsée pour éviter les re-renders inutiles
   */
  const load = useCallback(async () => {
    if (!endpoint) return;
    setLoading(true);
    setError('');
    try {
      // Construire l'URL avec les paramètres optionnels
      let url = apiUrl(endpoint);
      if (Object.keys(params).length > 0) {
        const qs = new URLSearchParams(params).toString();
        url += (url.includes('&') ? '&' : '&') + qs;
      }
      const r = await axios.get(url);
      // Accepter data.data ou data directement selon la réponse du backend
      setData(r.data?.data ?? r.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de chargement.');
    } finally {
      setLoading(false);
    }
  }, [endpoint, JSON.stringify(params)]);

  // Chargement automatique au montage et quand l'endpoint change
  useEffect(() => {
    if (auto) load();
  }, [load, auto]);

  return { data, loading, error, reload: load };
}

/**
 * Version simplifiée pour une liste (retourne toujours un tableau)
 * @param {string} endpoint
 * @returns {{ items, loading, error, reload }}
 */
export function useFetchList(endpoint) {
  const { data, loading, error, reload } = useFetch(endpoint);
  return {
    items:   Array.isArray(data) ? data : [],
    loading,
    error,
    reload,
  };
}