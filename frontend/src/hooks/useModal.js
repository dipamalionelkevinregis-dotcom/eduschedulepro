// ============================================================
// hooks/useModal.js — Hook de gestion des boîtes de dialogue
// ============================================================
// Ce hook simplifie la gestion des modales (popups) dans les
// pages. Il évite de répéter les states isOpen/selectedItem
// dans chaque composant.
//
// Usage :
//   const modal = useModal()
//   modal.open({ id: 1, nom: 'Test' })  // Ouvre avec des données
//   modal.close()                        // Ferme
//   modal.isOpen                         // Boolean
//   modal.data                           // Données courantes
// ============================================================

import { useState, useCallback } from 'react'

export function useModal(initialData = null) {
  const [isOpen, setIsOpen] = useState(false)  // Visibilité de la modale
  const [data,   setData]   = useState(initialData)  // Données de l'item sélectionné

  // ─── Ouvrir la modale ─────────────────────────────────
  // On peut passer des données (ex: l'objet à modifier)
  const open = useCallback((newData = null) => {
    setData(newData)
    setIsOpen(true)
  }, [])

  // ─── Fermer la modale ─────────────────────────────────
  // On remet les données à null pour éviter des résidus
  const close = useCallback(() => {
    setIsOpen(false)
    // Délai avant de vider les données (animation de fermeture)
    setTimeout(() => setData(null), 200)
  }, [])

  // ─── Mettre à jour les données sans fermer ────────────
  const update = useCallback((newData) => {
    setData(prev => ({ ...prev, ...newData }))
  }, [])

  return {
    isOpen,   // Boolean : la modale est-elle visible ?
    data,     // Object : données de l'item en cours d'édition
    open,     // Fn(data?) : ouvrir [avec données optionnelles]
    close,    // Fn() : fermer
    update,   // Fn(data) : mettre à jour les données sans fermer
  }
}