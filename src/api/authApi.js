import { apiFetch } from './client';

export function login(username, password) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: { username, password },
    skipAuth: true,
    retry: false,
  });
}

export function register({ username, email, password, fullName, role }) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: { username, email, password, fullName, role },
  });
}

export function refresh(refreshToken) {
  return apiFetch('/api/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
    skipAuth: true,
    retry: false,
  });
}
