import type { ApiResponse } from './types';

const DEFAULT_API_BASE = 'http://127.0.0.1:18791';
const API_BASE = (() => {
  const envBase = import.meta.env.VITE_API_BASE?.trim();
  if (envBase) {
    return envBase.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return DEFAULT_API_BASE;
})();

if (import.meta.env.DEV && !import.meta.env.VITE_API_BASE) {
  console.warn('VITE_API_BASE is not set; falling back to window origin.');
}

export { API_BASE };

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const text = await response.text();
  let data: ApiResponse<T> | null = null;
  if (text) {
    try {
      data = JSON.parse(text) as ApiResponse<T>;
    } catch {
      // fall through to build a synthetic error response
    }
  }

  if (!data) {
    const snippet = text ? text.slice(0, 200) : '';
    const message = `Non-JSON response (${response.status} ${response.statusText})${snippet ? `: ${snippet}` : ''}`;
    return { ok: false, error: { code: 'INVALID_RESPONSE', message } };
  }

  if (!response.ok) {
    return data as ApiResponse<T>;
  }

  return data as ApiResponse<T>;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path, { method: 'GET' }),
  put: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),
  post: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, {
      method: 'POST',
      body: JSON.stringify(body)
    })
};
