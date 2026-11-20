import { apiFetch } from './client';

export function listForUser(userId) {
  return apiFetch(`/api/notifications/${userId}`);
}

export function create(body) {
  return apiFetch('/api/notifications', { method: 'POST', body });
}
