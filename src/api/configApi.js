import { apiFetch } from './client';

export function getSchoolInfo() { return apiFetch('/api/config/school'); }
export function updateSchoolInfo(body) { return apiFetch('/api/config/school', { method: 'PUT', body }); }

export function listSubjects() { return apiFetch('/api/config/subjects'); }
export function createSubject(body) { return apiFetch('/api/config/subjects', { method: 'POST', body }); }
export function deleteSubject(id) { return apiFetch(`/api/config/subjects/${id}`, { method: 'DELETE' }); }
