import { apiFetch } from './client';

const toCount = (r) => (typeof r?.count === 'number' && Number.isFinite(r.count) ? r.count : null);

export async function getStudentCount() { return toCount(await apiFetch('/api/students/count', { skipAuth: true })); }
export async function getStaffCount() { return toCount(await apiFetch('/api/staff/count', { skipAuth: true })); }
export async function getClassCount() { return toCount(await apiFetch('/api/classes/count', { skipAuth: true })); }
