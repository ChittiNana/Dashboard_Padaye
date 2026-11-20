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

// -> [{ parentUserId, relationship }]
export function getStudentParents(studentId) {
  return apiFetch(`/api/students/${studentId}/parents`);
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

export function createStaff(body) {
  return apiFetch('/api/staff', { method: 'POST', body });
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

// parentUserId is the parent's auth USER id; body is { studentId, relationship }.
export function linkParentToStudent(parentUserId, { studentId, relationship }) {
  return apiFetch(`/api/parents/${parentUserId}/link`, {
    method: 'POST',
    body: { studentId, relationship },
  });
}
