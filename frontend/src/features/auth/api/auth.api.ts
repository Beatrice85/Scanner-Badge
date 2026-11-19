import client from '../../../shared/lib/client-http';
import type { ReponseLogin, ReponseRegister, Utilisateur } from '../types';

type Credentials = { email: string; password: string };

// Valeurs attendues par POST /auth/register ("employe" -> EMPLOYE, "admin" -> ADMIN).
export type RoleInscription = 'employe' | 'admin';

export const ROLES_INSCRIPTION: RoleInscription[] = ['employe', 'admin'];

type RegisterData = {
  nom: string;
  email: string;
  password: string;
  role: RoleInscription;
};

// Appels bruts à l'API. La session (token, utilisateur) est gérée par AuthProvider / useAuth.
export const authApi = {
  login: async (credentials: Credentials): Promise<ReponseLogin> => {
    return client.post('/auth/login', credentials);
  },
  register: async (data: RegisterData): Promise<ReponseRegister> => {
    return client.post('/auth/register', data);
  },
  me: async (): Promise<Utilisateur> => {
    return client.get('/auth/me');
  },
  // Photo de profil stockée côté serveur (Supabase Storage) : JPEG, PNG ou WebP, 20 Mo max.
  changerPhoto: async (fichier: File): Promise<Utilisateur> => {
    const formulaire = new FormData();
    formulaire.append('photo', fichier);
    return client.envoyerFichier('/auth/me/photo', formulaire);
  },
  supprimerPhoto: async (): Promise<Utilisateur> => {
    return client.del('/auth/me/photo');
  },
};

export default authApi;
