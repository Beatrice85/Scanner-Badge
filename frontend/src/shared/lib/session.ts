// Seul endroit qui lit/écrit le token dans localStorage.
// Le rôle n'est jamais stocké : il vient du serveur (/auth/login, /auth/me) via useAuth.
const CLE_TOKEN = 'auth_token';
const PREFIXE_PHOTO_PROFIL = 'photo_profil:';
const ANCIENNE_CLE_PHOTO_PROFIL = 'photo_profil';
const EVENEMENT_PHOTO_PROFIL = 'photo-profil-modifiee';
// Anciennes clés (rôle choisi par l'utilisateur) : supprimées à la déconnexion et au chargement.
const CLES_OBSOLETES = ['auth_role', 'auth_email'];

export function lireToken(): string | null {
  return localStorage.getItem(CLE_TOKEN);
}

export function enregistrerToken(token: string) {
  localStorage.setItem(CLE_TOKEN, token);
}

export function lirePhotoProfil(utilisateurId: string): string | null {
  return localStorage.getItem(`${PREFIXE_PHOTO_PROFIL}${utilisateurId}`);
}

export function enregistrerPhotoProfil(utilisateurId: string, photo: string) {
  localStorage.setItem(`${PREFIXE_PHOTO_PROFIL}${utilisateurId}`, photo);
  window.dispatchEvent(new Event(EVENEMENT_PHOTO_PROFIL));
}

export function effacerPhotoProfil(utilisateurId: string) {
  localStorage.removeItem(`${PREFIXE_PHOTO_PROFIL}${utilisateurId}`);
  window.dispatchEvent(new Event(EVENEMENT_PHOTO_PROFIL));
}

export function migrerPhotoProfilAncienneCle(utilisateurId: string) {
  const anciennePhoto = localStorage.getItem(ANCIENNE_CLE_PHOTO_PROFIL);
  if (!anciennePhoto) return;

  const cleUtilisateur = `${PREFIXE_PHOTO_PROFIL}${utilisateurId}`;
  if (!localStorage.getItem(cleUtilisateur)) {
    localStorage.setItem(cleUtilisateur, anciennePhoto);
  }
  localStorage.removeItem(ANCIENNE_CLE_PHOTO_PROFIL);
}

export function ecouterPhotoProfil(callback: () => void): () => void {
  window.addEventListener(EVENEMENT_PHOTO_PROFIL, callback);
  return () => window.removeEventListener(EVENEMENT_PHOTO_PROFIL, callback);
}

export function effacerSession() {
  localStorage.removeItem(CLE_TOKEN);
  nettoyerClesObsoletes();
}

export function nettoyerClesObsoletes() {
  CLES_OBSOLETES.forEach(cle => localStorage.removeItem(cle));
}

// Lecture du payload du JWT, sans vérification de signature (le serveur s'en charge).
// Sert uniquement à détecter un token périmé (ancien format sans rôle, ou employeId changé).
export function lirePayloadToken(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}
