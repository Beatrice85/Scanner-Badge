const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

type RequestOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
};

function getToken() {
  return localStorage.getItem('auth_token') || '';
}

// Le backend renvoie ses erreurs sous la forme { "message": "..." } :
// on extrait ce message pour l'afficher tel quel.
function extraireMessageErreur(text: string): string {
  try {
    const data = JSON.parse(text);
    if (data && typeof data.message === 'string') return data.message;
  } catch {
    // corps non JSON : on garde le texte brut
  }
  return text;
}

async function request(path: string, opts: RequestOptions = {}) {
  const url = `${BASE_URL}${path}`;
  console.log("[client-http] BASE_URL:", BASE_URL, "url:", url);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(extraireMessageErreur(text) || res.statusText);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

export const client = {
  get: (path: string) => request(path, { method: 'GET' }),
  post: (path: string, body: any) => request(path, { method: 'POST', body }),
  put: (path: string, body: any) => request(path, { method: 'PUT', body }),
  del: (path: string) => request(path, { method: 'DELETE' }),
};

export default client;
