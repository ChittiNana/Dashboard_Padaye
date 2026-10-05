import { apiFetch } from './client';

export function listUsers() {
  return apiFetch('/api/users');
}

export function getUser(id) {
  return apiFetch(`/api/users/${id}`);
}

export function updateUser(id, body) {
  return apiFetch(`/api/users/${id}`, { method: 'PUT', body });
}

export function deleteUser(id) {
  return apiFetch(`/api/users/${id}`, { method: 'DELETE' });
}
