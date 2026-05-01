// ============================================================
// hooks/useTheme.js — Hook de gestion du thème sombre/clair
// ============================================================
// Ce hook gère le basculement entre le mode clair et le mode
// sombre. Il ajoute/retire la classe CSS "dark" sur l'élément
// <html>, ce que Tailwind utilise pour appliquer les variantes
// dark: (ex: dark:bg-slate-900).
//
// La préférence est sauvegardée dans localStorage pour être
// restaurée au prochain chargement de la page.
// ============================================================

import { useState, useEffect } from 'react'

export function useTheme() {
  // ─── Initialisation de l'état ─────────────────────────
  // On vérifie dans l'ordre :
  //   1. La valeur sauvegardée dans localStorage
  //   2. La préférence système de l'utilisateur (prefers-color-scheme)
  //   3. Par défaut : mode clair
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('ungest_theme')
    if (saved !== null) return saved === 'dark'
    // window.matchMedia détecte si l'OS est en mode sombre
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // ─── Effet : synchronisation avec le DOM ──────────────
  // À chaque changement de isDark, on met à jour :
  //   - La classe "dark" sur <html>
  //   - La valeur dans localStorage
  useEffect(() => {
    const root = document.documentElement  // Élément <html>
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('ungest_theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('ungest_theme', 'light')
    }
  }, [isDark])

  // ─── Fonction de basculement ──────────────────────────
  const toggleTheme = () => setIsDark(prev => !prev)

  // ─── Retour du hook ───────────────────────────────────
  return {
    isDark,        // Boolean : true = mode sombre actif
    toggleTheme,   // Fonction : inverse le thème
  }
}