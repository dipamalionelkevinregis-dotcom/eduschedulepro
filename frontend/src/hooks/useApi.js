// ============================================================
//  EduSchedule Pro — Hook API centralisé
//  frontend/src/hooks/useApi.js
// ============================================================

import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

const BASE = 'http://localhost/eduschedulepro/backend/api'

export function useApi() {
  const { authHeaders, logout } = useAuth()
  const [loading, setLoading]   = useState(false)
  const [error,   setError]     = useState(null)

  const request = useCallback(async (method, endpoint, body = null) => {
    setLoading(true)
    setError(null)
    try {
      const opts = { method, headers: authHeaders() }
      if (body) opts.body = JSON.stringify(body)

      const res  = await fetch(`${BASE}${endpoint}`, opts)
      const data = await res.json()

      if (res.status === 401) { logout(); return null }
      if (!data.success) { setError(data.error || 'Erreur inconnue'); return null }

      return data.data ?? data
    } catch (e) {
      setError('Erreur réseau. Vérifiez que WAMP est démarré.')
      return null
    } finally {
      setLoading(false)
    }
  }, [authHeaders, logout])

  return {
    loading,
    error,
    get:    (ep)           => request('GET',    ep),
    post:   (ep, body)     => request('POST',   ep, body),
    put:    (ep, body)     => request('PUT',    ep, body),
    delete: (ep)           => request('DELETE', ep),
  }
}