import { createContext, useContext } from 'react';
import type { Role, Utilisateur } from '../types';

export type ValeurAuth = {
  utilisateur: Utilisateur | null;
  // true tant que la session existante est en cours de vérification (GET /auth/me)
  chargement: boolean;
  // Erreur de vérification autre qu'un 401 (serveur injoignable...) ou message de session expirée
  erreur: string | null;
  connexion: (email: string, password: string) => Promise<Utilisateur>;
  deconnexion: () => void;
  rafraichir: () => Promise<void>;
};

export const AuthContext = createContext<ValeurAuth | null>(null);

export function useAuth(): ValeurAuth {
  const valeur = useContext(AuthContext);
  if (!valeur) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>');
  }
  return valeur;
}

// Page d'accueil de chaque rôle après connexion.
export function accueilDuRole(role: Role): string {
  return role === 'ADMIN' ? '/admin' : '/conges';
}
