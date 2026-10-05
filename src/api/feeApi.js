import { apiFetch } from './client';

export function getStatusForStudent(studentId) {
  return apiFetch(`/api/fees/student/${studentId}`);
}

export function listFeeRecords() {
  return apiFetch('/api/fees/records');
}

export function payFee(body) {
  return apiFetch('/api/fees/pay', { method: 'POST', body });
}

export function updateFeeRecord(id, body) {
  return apiFetch(`/api/fees/${id}`, { method: 'PUT', body });
}
