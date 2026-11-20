// Generic helpers so every data-consumption site can "try the real API, fall
// back to local mock data" (reads) or "write locally first, fire the real
// call in the background" (writes) without repeating try/catch boilerplate.

// Reads: try the real call, fall back to a local-store read on any failure.
export async function readWithFallback(apiCallFn, fallbackFn, { label } = {}) {
  try {
    return await apiCallFn();
  } catch (err) {
    // A 403 is the backend enforcing access (own student / own class only); showing local mock data instead would
    // hide that denial, so surface it. Every other failure (missing endpoint, backend down, 5xx) still falls back.
    // An expired session (AuthError) must also surface so the app can send the user to login.
    if (err && (err.status === 403 || err.name === 'AuthError')) throw err;
    console.warn(`[mock-fallback] ${label || 'read'} failed, using local data`, err);
    return fallbackFn();
  }
}

// True when a failed call means "there is no usable backend for this request" (network failure, or the endpoint
// does not exist: 404/405/501) as opposed to the backend answering with a real rejection (400/403/409/422/429/5xx)
// that the user needs to see.
export function isBackendUnavailable(err) {
  if (!err || err.name === 'AuthError') return false;
  if (typeof err.status === 'number') return [404, 405, 501].includes(err.status);
  return true; // fetch itself failed (backend down / CORS / offline)
}

// Writes against the real backend: await the real call and return its response (so the UI uses real ids and real
// server-side results, and real validation/authorization errors reach the caller). Only when the backend is
// unavailable does it fall back to the local mock mutation, as before. Returns { result, real }.
export async function writeWithApi(apiCallFn, localMutationFn, { label } = {}) {
  try {
    return { result: await apiCallFn(), real: true };
  } catch (err) {
    if (!isBackendUnavailable(err)) throw err;
    console.warn(`[mock-fallback] ${label || 'write'} backend unavailable, using local data`, err);
    return { result: localMutationFn(), real: false };
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
