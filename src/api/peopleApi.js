import { apiFetch } from './client';

export function listStudents(classId) {
  const query = classId ? `?classId=${classId}` : '';
  return apiFetch(`/api/students${query}`);
}

export function getStudent(id) {
  return apiFetch(`/api/students/${id}`);
}

export function getMyStudentRecord() {
  return apiFetch('/api/students/me');
}

export function createStudent(body) {
  return apiFetch('/api/students', { method: 'POST', body });
}

export function updateStudent(id, body) {
  return apiFetch(`/api/students/${id}`, { method: 'PUT', body });
}

export function listStaff() {
  return apiFetch('/api/staff');
}

export function getStaff(id) {
  return apiFetch(`/api/staff/${id}`);
}

export function getMyStaffRecord() {
  return apiFetch('/api/staff/me');
}

export function getChildrenForParent(parentUserId) {
  return apiFetch(`/api/parents/${parentUserId}/children`);
}
