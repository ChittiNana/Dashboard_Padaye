import { apiFetch } from './client';

export function listClasses() {
  return apiFetch('/api/classes');
}

export function getClass(id) {
  return apiFetch(`/api/classes/${id}`);
}

export function createClass(body) {
  return apiFetch('/api/classes', { method: 'POST', body });
}

export function updateClass(id, body) {
  return apiFetch(`/api/classes/${id}`, { method: 'PUT', body });
}
