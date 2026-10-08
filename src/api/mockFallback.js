// Generic helpers so every data-consumption site can "try the real API, fall
// back to local mock data" (reads) or "write locally first, fire the real
// call in the background" (writes) without repeating try/catch boilerplate.

// Reads: try the real call, fall back to a local-store read on any failure.
export async function readWithFallback(apiCallFn, fallbackFn, { label } = {}) {
  try {
    return await apiCallFn();
  } catch (err) {
    console.warn(`[mock-fallback] ${label || 'read'} failed, using local data`, err);
    return fallbackFn();
  }
}

// Writes: mutate the local store first (this is the return value the UI uses),
// then best-effort fire the real API call and swallow whatever happens to it.
export function writeThroughMock(localMutationFn, apiCallFn, { label } = {}) {
  const result = localMutationFn();
  Promise.resolve()
    .then(apiCallFn)
    .catch(err => console.warn(`[mock-fallback] ${label || 'write'} background API call failed`, err));
  return result;
}
