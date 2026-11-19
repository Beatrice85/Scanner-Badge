import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import authApi from '../api/auth.api';
import type { Utilisateur } from '../types';
import { AuthContext, type ValeurAuth } from './auth-context';
import { ErreurHttp } from '../../../shared/lib/client-http';
import {
  effacerSession,
  enregistrerToken,
  lirePayloadToken,
  lireToken,
  nettoyerClesObsoletes,
} from '../../../shared/lib/session';

const MESSAGE_SESSION_PERIMEE = 'Votre session doit être renouvelée : veuillez vous reconnecter.';

// Le token est périmé s'il ne reflète plus le compte côté serveur : ancien format sans rôle,
// rôle changé, ou compte lié à un employé depuis la connexion.
function tokenPerime(token: string, utilisateur: Utilisateur): boolean {
  const payload = lirePayloadToken(token);
  if (!payload) return true;
  return payload.role !== utilisateur.role || (payload.employeId ?? null) !== utilisateur.employeId;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [chargement, setChargement] = useState<boolean>(() => Boolean(lireToken()));
  const [erreur, setErreur] = useState<string | null>(null);

  const deconnexion = useCallback(() => {
    effacerSession();
    setUtilisateur(null);
  }, []);

  const rafraichir = useCallback(async () => {
    const token = lireToken();
    if (!token) {
      setUtilisateur(null);
      setChargement(false);
      return;
    }
    setChargement(true);
    setErreur(null);
    try {
      const moi = await authApi.me();
      const profil = { ...moi, photo: moi.photoUrl ?? null };
      if (tokenPerime(token, moi)) {
        effacerSession();
        setUtilisateur(null);
        setErreur(MESSAGE_SESSION_PERIMEE);
      } else {
        setUtilisateur(profil);
      }
    } catch (err: any) {
      setUtilisateur(null);
      if (err instanceof ErreurHttp && (err.status === 401 || err.status === 404)) {
        // Token invalide/expiré, ou compte supprimé : on déconnecte.
        effacerSession();
      } else {
        setErreur(err?.message || 'Impossible de vérifier la session');
      }
    } finally {
      setChargement(false);
    }
  }, []);

  const connexion = useCallback(async (email: string, password: string) => {
    setErreur(null);
    const { token } = await authApi.login({ email, password });
    enregistrerToken(token);
    try {
      // Le login ne renvoie ni id ni nom : on lit le profil complet.
      const moi = await authApi.me();
      const profil = { ...moi, photo: moi.photoUrl ?? null };
      setUtilisateur(profil);
      return profil;
    } catch (err) {
      effacerSession();
      throw err;
    }
  }, []);

  const mettreAJourUtilisateur = useCallback((maj: Partial<Utilisateur>) => {
    setUtilisateur((actuel) => {
      if (!actuel) return actuel;
      const suivant = { ...actuel, ...maj };
      return { ...suivant, photo: suivant.photoUrl ?? null };
    });
  }, []);

  useEffect(() => {
    nettoyerClesObsoletes();
    rafraichir();
  }, [rafraichir]);

  const valeur = useMemo<ValeurAuth>(
    () => ({ utilisateur, chargement, erreur, connexion, deconnexion, rafraichir, mettreAJourUtilisateur }),
    [utilisateur, chargement, erreur, connexion, deconnexion, rafraichir, mettreAJourUtilisateur],
  );

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}
