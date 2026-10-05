import { apiFetch } from './client';

export function listExams() { return apiFetch('/api/exams'); }
export function createExam(body) { return apiFetch('/api/exams', { method: 'POST', body }); }

export function listHomework(classId) {
  const query = classId ? `?classId=${classId}` : '';
  return apiFetch(`/api/homework${query}`);
}
export function createHomework(body) { return apiFetch('/api/homework', { method: 'POST', body }); }

export function listNotes(subject) {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  return apiFetch(`/api/notes${query}`);
}
export function createNote(body) { return apiFetch('/api/notes', { method: 'POST', body }); }

export function listQuestionPapers() { return apiFetch('/api/question-papers'); }
export function createQuestionPaper(body) { return apiFetch('/api/question-papers', { method: 'POST', body }); }

export function listResults() { return apiFetch('/api/results'); }
export function getResultsByStudent(studentId) { return apiFetch(`/api/results/student/${studentId}`); }
export function createResult(body) { return apiFetch('/api/results', { method: 'POST', body }); }
