import { NextRequest } from 'next/server';

export interface AuthUser {
  username: string;
  role: string;
  loginAt: string;
}

const AUTH_STORAGE_KEY = 'sip_auth_user';
const AUTH_COOKIE_NAME = 'sip_user';

// === CLIENT-SIDE HELPERS ===

export function getClientAuth(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.username) {
      return parsed as AuthUser;
    }
    return null;
  } catch {
    return null;
  }
}

export function setClientAuth(username: string, role = 'operator'): AuthUser {
  const user: AuthUser = {
    username,
    role,
    loginAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    // Set cookie valid for 1 day
    document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(
      JSON.stringify(user)
    )}; path=/; max-age=86400; SameSite=Lax`;
  }

  return user;
}

export function clearClientAuth(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

// === SERVER-SIDE / API ROUTE HELPERS ===

export function isRequestAuthenticated(request: NextRequest): boolean {
  // 1. Check Http cookie
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  if (cookie && cookie.value) {
    try {
      const parsed = JSON.parse(decodeURIComponent(cookie.value));
      if (parsed && parsed.username) {
        return true;
      }
    } catch {
      // ignore json parse error
    }
  }

  // 2. Check Authorization Header (e.g. Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return true;
  }

  return false;
}
