import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './tokenStorage';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

// Thrown when the session can't be kept alive (no/expired refresh token,
// or the refresh call itself failed) — callers should log the user out.
export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
  }
}

// Coalesces concurrent 401s into a single refresh call instead of firing
// one refresh request per in-flight request.
let refreshPromise = null;

async function rawFetch(path, { skipAuth, body, headers, ...rest } = {}) {
  const finalHeaders = { 'Content-Type': 'application/json', ...headers };
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }
  return fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function parseBody(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function refreshTokens() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new AuthError('No refresh token available');
  const response = await rawFetch('/api/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
    skipAuth: true,
  });
  if (!response.ok) throw new AuthError('Session expired, please log in again');
  const tokens = await parseBody(response);
  setTokens(tokens);
  return tokens;
}

/**
 * Fetch wrapper for the api-gateway. Attaches the stored access token,
 * JSON-encodes object bodies, and on a 401 tries exactly one silent token
 * refresh + retry before giving up and clearing the session.
 */
export async function apiFetch(path, options = {}) {
  const { retry = true, ...rest } = options;
  const response = await rawFetch(path, rest);

  if (response.ok) return parseBody(response);

  if (response.status === 401 && retry && path !== '/api/auth/refresh') {
    try {
      refreshPromise = refreshPromise || refreshTokens();
      await refreshPromise;
    } catch {
      clearTokens();
      throw new AuthError('Session expired, please log in again');
    } finally {
      refreshPromise = null;
    }
    return apiFetch(path, { ...options, retry: false });
  }

  const errorBody = await parseBody(response);
  const message =
    (errorBody && (errorBody.message || errorBody.error)) ||
    `Request failed with status ${response.status}`;

  if (response.status === 401) {
    clearTokens();
    throw new AuthError(message);
  }
  throw new ApiError(message, response.status, errorBody);
}
