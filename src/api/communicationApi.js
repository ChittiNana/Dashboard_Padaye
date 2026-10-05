import { apiFetch } from './client';

export function listNotices() { return apiFetch('/api/notices'); }
export function createNotice(body) { return apiFetch('/api/notices', { method: 'POST', body }); }
export function updateNotice(id, body) { return apiFetch(`/api/notices/${id}`, { method: 'PUT', body }); }
export function deleteNotice(id) { return apiFetch(`/api/notices/${id}`, { method: 'DELETE' }); }
