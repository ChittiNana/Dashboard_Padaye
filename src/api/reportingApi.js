import { apiFetch } from './client';

export function getAttendanceReport() {
  return apiFetch('/api/reports/attendance');
}

export function getExamResultsReport() {
  return apiFetch('/api/reports/exam-results');
}

export function getFeeCollectionReport() {
  return apiFetch('/api/reports/fee-collection');
}

export function getStaffPerformanceReport() {
  return apiFetch('/api/reports/staff-performance');
}

export function getReportCard(studentId) {
  return apiFetch(`/api/reports/report-card/${studentId}`);
}

export function getAnalytics() {
  return apiFetch('/api/reports/analytics');
}
