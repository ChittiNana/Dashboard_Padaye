import { apiFetch } from './client';

export function getClassTimetable(classId) { return apiFetch(`/api/timetable/class/${classId}`); }
export function getTeacherTimetable(teacherId) { return apiFetch(`/api/timetable/teacher/${teacherId}`); }
export function createTimetableSlot(body) { return apiFetch('/api/timetable', { method: 'POST', body }); }
