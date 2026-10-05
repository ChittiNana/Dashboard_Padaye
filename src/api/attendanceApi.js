import { apiFetch } from './client';

export function markAttendance(classId, date, entries) {
  return apiFetch('/api/attendance/mark', { method: 'POST', body: { classId, date, entries } });
}

export function getStudentAttendance(studentId) {
  return apiFetch(`/api/attendance/student/${studentId}`);
}

export function getClassAttendance(classId, date) {
  const query = date ? `?date=${date}` : '';
  return apiFetch(`/api/attendance/class/${classId}${query}`);
}

export function getSchoolSummary() {
  return apiFetch('/api/attendance/summary');
}

export function getTeacherToday(teacherId) {
  return apiFetch(`/api/attendance/teacher/${teacherId}/today`);
}
