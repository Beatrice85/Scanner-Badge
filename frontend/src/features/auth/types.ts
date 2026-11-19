// Contrats de backend/src/modules/auth (auth.service.ts).
export type Role = 'ADMIN' | 'EMPLOYE';

// Réponse de GET /auth/me
export type Utilisateur = {
  id: string;
  nom: string;
  email: string;
  role: Role;
  employeId: string | null;
  // URL publique de la photo de profil (Supabase Storage), renvoyée par le serveur
  photoUrl?: string | null;
  // Photo affichée (= photoUrl) ; conservé pour les composants existants
  photo?: string | null;
};

// Réponse de POST /auth/login
export type ReponseLogin = {
  token: string;
  role: Role;
  employeId: string | null;
};

// Réponse de POST /auth/register (le compte créé est toujours EMPLOYE)
export type ReponseRegister = {
  id: string;
  nom: string;
  email: string;
  role: Role;
};
