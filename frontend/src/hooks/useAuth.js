/**
 * hooks/useAuth.js — Réexportation du hook d'authentification
 * ===============================================================
 * Ce fichier réexporte useAuth depuis AuthContext pour permettre
 * un import depuis hooks/useAuth au lieu de AuthContext directement.
 * Les deux imports fonctionnent.
 *
 * Usage :
 *   import { useAuth } from '../hooks/useAuth';
 *   // ou
 *   import { useAuth } from '../AuthContext';
 * ===============================================================
 */

export { useAuth } from '../AuthContext';