import { apiFetch } from './client';

export function getStatusForStudent(studentId) {
  return apiFetch(`/api/fees/student/${studentId}`);
}

export function listFeeRecords() {
  return apiFetch('/api/fees/records');
}

export function createFeeRecord(body) {
  return apiFetch('/api/fees/records', { method: 'POST', body });
}

export function payFee(body, idempotencyKey) {
  const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined;
  return apiFetch('/api/fees/pay', { method: 'POST', body, headers });
}

export function updateFeeRecord(id, body) {
  return apiFetch(`/api/fees/${id}`, { method: 'PUT', body });
}

export function getPaymentHistory(feeRecordId) {
  return apiFetch(`/api/fees/${feeRecordId}/payments`);
}
