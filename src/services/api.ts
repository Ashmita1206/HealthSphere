export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'healthsphere_token';
const REFRESH_TOKEN_KEY = 'healthsphere_refresh_token';

export class ApiError extends Error {
  status: number;
  data?: unknown;
  statusText?: string;

  constructor(message: string, status: number, data?: unknown, statusText?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.statusText = statusText;
  }
}

export const tokenStore = {
  get: () => {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token || token === 'null' || token === 'undefined') return null;
      return token.trim() || null;
    } catch {
      return null;
    }
  },
  set: (token: string) => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token.trim());
      }
    } catch {}
  },
  clear: () => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {}
  },
};

export const refreshTokenStore = {
  get: () => {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
      const token = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!token || token === 'null' || token === 'undefined') return null;
      return token.trim() || null;
    } catch {
      return null;
    }
  },
  set: (token: string) => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(REFRESH_TOKEN_KEY, token.trim());
      }
    } catch {}
  },
  clear: () => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    } catch {}
  },
};

let refreshPromise: Promise<string | null> | null = null;

async function executeTokenRefresh(): Promise<string | null> {
  const currentRefreshToken = refreshTokenStore.get();
  if (!currentRefreshToken) {
    tokenStore.clear();
    refreshTokenStore.clear();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!response.ok) {
      tokenStore.clear();
      refreshTokenStore.clear();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      return null;
    }

    const data = await response.json().catch(() => ({}));
    const newAccessToken = data.accessToken || data.token;
    const newRefreshToken = data.refreshToken;

    if (newAccessToken) {
      tokenStore.set(newAccessToken);
      if (newRefreshToken) {
        refreshTokenStore.set(newRefreshToken);
      }
      return newAccessToken;
    }

    tokenStore.clear();
    refreshTokenStore.clear();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return null;
  } catch {
    tokenStore.clear();
    refreshTokenStore.clear();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const token = tokenStore.get();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!(options.body instanceof FormData) && options.body !== undefined) {
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const isAuthEndpoint =
    path.startsWith('/auth/login') ||
    path.startsWith('/auth/signup') ||
    path.startsWith('/auth/refresh') ||
    path.startsWith('/auth/logout');

  if (response.status === 401 && !isRetry && !isAuthEndpoint) {
    if (!refreshPromise) {
      refreshPromise = executeTokenRefresh().finally(() => {
        refreshPromise = null;
      });
    }
    const newAccessToken = await refreshPromise;
    if (newAccessToken) {
      return request<T>(path, options, true);
    }
  }

  if (!response.ok) {
    let errorBody: any = null;
    let errorMessage = response.statusText || 'Request failed';
    try {
      if (typeof response.text === 'function') {
        const rawText = await response.text();
        if (rawText) {
          try {
            errorBody = JSON.parse(rawText);
            errorMessage = errorBody.message || errorBody.error || errorBody.msg || rawText;
          } catch {
            errorMessage = rawText;
          }
        }
      } else if (typeof response.json === 'function') {
        errorBody = await response.json();
        errorMessage = errorBody?.message || errorBody?.error || errorBody?.msg || errorMessage;
      }
    } catch {
      // response reading failed
    }

    throw new ApiError(errorMessage, response.status, errorBody, response.statusText);
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  if (typeof response.text === 'function') {
    const text = await response.text();
    if (!text || text.trim() === '') {
      return undefined as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  if (typeof response.json === 'function') {
    return (await response.json()) as T;
  }

  return undefined as T;
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, options),

  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'DELETE',
    }),
};
