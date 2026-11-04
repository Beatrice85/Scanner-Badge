import { lireToken } from './session';

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

async function request(path: string, opts: RequestOptions = {}) {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  const token = lireToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new ErreurHttp(res.status, extraireMessageErreur(text) || res.statusText);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

export const client = {
  get: (path: string) => request(path, { method: 'GET' }),
  post: (path: string, body: any) => request(path, { method: 'POST', body }),
  put: (path: string, body: any) => request(path, { method: 'PUT', body }),
  patch: (path: string, body?: any) => request(path, { method: 'PATCH', body }),
  del: (path: string) => request(path, { method: 'DELETE' }),
};

export default client;
