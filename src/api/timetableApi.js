import { apiFetch } from './client';

export function getClassTimetable(classId) { return apiFetch(`/api/timetable/class/${classId}`); }
export function getTeacherTimetable(teacherId) { return apiFetch(`/api/timetable/teacher/${teacherId}`); }
export function createTimetableSlot(body) { return apiFetch('/api/timetable', { method: 'POST', body }); }
export function updateTimetableSlot(id, body) { return apiFetch(`/api/timetable/${id}`, { method: 'PUT', body }); }
export function deleteTimetableSlot(id) { return apiFetch(`/api/timetable/${id}`, { method: 'DELETE' }); }
export function listPendingApproval() { return apiFetch('/api/timetable/pending-approval'); }
export function submitClassTimetable(classId) { return apiFetch(`/api/timetable/class/${classId}/submit`, { method: 'POST' }); }
export function approveClassTimetable(classId) { return apiFetch(`/api/timetable/class/${classId}/approve`, { method: 'POST' }); }
export function rejectClassTimetable(classId, note) { return apiFetch(`/api/timetable/class/${classId}/reject`, { method: 'POST', body: { note } }); }
