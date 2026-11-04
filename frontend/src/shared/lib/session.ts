// Seul endroit qui lit/écrit le token dans localStorage.
// Le rôle n'est jamais stocké : il vient du serveur (/auth/login, /auth/me) via useAuth.
const CLE_TOKEN = 'auth_token';
// Anciennes clés (rôle choisi par l'utilisateur) : supprimées à la déconnexion et au chargement.
const CLES_OBSOLETES = ['auth_role', 'auth_email'];

export function lireToken(): string | null {
  return localStorage.getItem(CLE_TOKEN);
}

export function enregistrerToken(token: string) {
  localStorage.setItem(CLE_TOKEN, token);
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
