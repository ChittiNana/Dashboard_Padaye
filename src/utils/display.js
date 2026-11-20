// Display helpers: missing live data renders as 'N/A' (never an error).
export function na(value) {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'number' && Number.isNaN(value)) return 'N/A';
  if (typeof value === 'string' && !value.trim()) return 'N/A';
  return value;
}

export function naCount(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString() : 'N/A';
}
