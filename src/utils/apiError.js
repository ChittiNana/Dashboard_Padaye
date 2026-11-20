// Turns a thrown API error into one displayable string: the backend message plus any per-field validation errors.
export function errorText(err, fallback = 'Something went wrong') {
  const base = (err && err.message) || fallback;
  const fields = Array.isArray(err?.fieldErrors) ? err.fieldErrors : [];
  if (fields.length === 0) return base;
  const detail = fields
    .map(f => (typeof f === 'string' ? f : [f.field, f.message || f.defaultMessage].filter(Boolean).join(': ')))
    .filter(Boolean)
    .join('; ');
  return detail ? `${base} (${detail})` : base;
}
