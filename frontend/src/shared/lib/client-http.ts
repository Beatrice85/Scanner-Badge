import { lireToken } from './session';
import { notifierToast } from './toast';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

type RequestOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
};

// Erreur renvoyée par l'API : garde le code HTTP (401, 403, 409...) en plus du message.
export class ErreurHttp extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ErreurHttp';
  }
}

// Le backend renvoie ses erreurs sous la forme { "message": "..." }, parfois avec un
// détail { "error": "..." } (auth) : on affiche le message, complété du détail s'il existe.
function extraireMessageErreur(text: string): string {
  try {
    const data = JSON.parse(text);
    if (data && typeof data.message === 'string') {
      return typeof data.error === 'string' && data.error ? `${data.message} : ${data.error}` : data.message;
    }
  } catch {
    // corps non JSON : on garde le texte brut
  }
  return text;
}

function messageActionReussie(method: string, path: string): string | null {
  const chemin = path.split('?')[0];

  if (method === 'POST' && chemin === '/employes') return 'Employé ajouté.';
  if (method === 'PUT' && /^\/employes\/[^/]+$/.test(chemin)) return 'Employé modifié.';
  if (method === 'DELETE' && /^\/employes\/[^/]+$/.test(chemin)) return 'Employé supprimé.';
  if (method === 'POST' && chemin === '/chantiers') return 'Chantier ajouté.';
  if (method === 'PUT' && /^\/chantiers\/[^/]+$/.test(chemin)) return 'Chantier modifié.';
  if (method === 'DELETE' && /^\/chantiers\/[^/]+$/.test(chemin)) return 'Chantier supprimé.';
  if (method === 'POST' && chemin === '/pointages') return 'Pointage enregistré.';
  if (method === 'PUT' && /^\/pointages\/[^/]+$/.test(chemin)) return 'Pointage modifié.';
  if (method === 'DELETE' && /^\/pointages\/[^/]+$/.test(chemin)) return 'Pointage supprimé.';
  if (method === 'POST' && chemin === '/badges/associate') return 'Badge associé à l’employé.';
  if (method === 'POST' && chemin === '/conges') return 'Demande de congé créée.';
  if (method === 'PUT' && /^\/conges\/[^/]+$/.test(chemin)) return 'Demande de congé modifiée.';
  if (method === 'DELETE' && /^\/conges\/[^/]+$/.test(chemin)) return 'Demande de congé supprimée.';
  if (method === 'PATCH' && /^\/conges\/[^/]+\/valider$/.test(chemin)) return 'Congé validé.';
  if (method === 'PATCH' && /^\/conges\/[^/]+\/refuser$/.test(chemin)) return 'Congé refusé.';
  if (method === 'PATCH' && /^\/users\/[^/]+\/role$/.test(chemin)) return 'Rôle du compte modifié.';
  if (method === 'PATCH' && /^\/users\/[^/]+\/employe$/.test(chemin)) return 'Fiche employé associée au compte.';

  return null;
}

async function request(path: string, opts: RequestOptions = {}) {
  const url = `${BASE_URL}${path}`;
  const method = opts.method ?? 'GET';
  const headers: Record<string, string> = {
    ...(opts.headers || {}),
  };
  // Fichier (FormData) : le navigateur fixe lui-même le Content-Type multipart et sa frontière.
  const estFichier = typeof FormData !== 'undefined' && opts.body instanceof FormData;
  if (!estFichier && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const token = lireToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: estFichier ? opts.body : opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new ErreurHttp(res.status, extraireMessageErreur(text) || res.statusText);
  }
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  const message = messageActionReussie(method, path);
  if (message) notifierToast(message);
  return data;
}

export const client = {
  get: (path: string) => request(path, { method: 'GET' }),
  post: (path: string, body: any) => request(path, { method: 'POST', body }),
  put: (path: string, body: any) => request(path, { method: 'PUT', body }),
  patch: (path: string, body?: any) => request(path, { method: 'PATCH', body }),
  del: (path: string) => request(path, { method: 'DELETE' }),
  // Envoi multipart/form-data (ex. photo de profil)
  envoyerFichier: (path: string, formulaire: FormData, method: 'POST' | 'PUT' = 'PUT') => request(path, { method, body: formulaire }),
};

export default client;
