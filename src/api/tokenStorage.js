const ACCESS_TOKEN_KEY = 'padaye_access_token';
const REFRESH_TOKEN_KEY = 'padaye_refresh_token';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens({ accessToken, refreshToken }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Decodes a JWT's payload without verifying its signature (verification
 * happens server-side on every request). Returns null for anything
 * malformed or unparsable instead of throwing, since this runs during
 * render/mount.
 */
export function decodeToken(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    const claims = JSON.parse(json);
    return {
      userId: claims.userId,
      username: claims.sub,
      roles: claims.roles || [],
      exp: claims.exp,
    };
  } catch {
    return null;
  }
}

export function isExpired(decoded) {
  if (!decoded?.exp) return true;
  return Date.now() >= decoded.exp * 1000;
}
