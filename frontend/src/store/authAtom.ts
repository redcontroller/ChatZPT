import { atom } from 'jotai';

// Authentication state interface
export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

// Initial authentication state
const initialAuthState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
};

// Authentication atom
export const authAtom = atom<AuthState>(initialAuthState);

// Derived atoms for easy access
export const isAuthenticatedAtom = atom(
  (get) => get(authAtom).isAuthenticated
);

export const accessTokenAtom = atom(
  (get) => get(authAtom).accessToken
);

export const refreshTokenAtom = atom(
  (get) => get(authAtom).refreshToken
);

export const isTokenExpiredAtom = atom((get) => {
  const auth = get(authAtom);
  if (!auth.expiresAt) return true;
  return Date.now() >= auth.expiresAt;
});

// Actions
export const setAuthAtom = atom(
  null,
  (get, set, authData: Partial<AuthState>) => {
    const currentAuth = get(authAtom);
    set(authAtom, { ...currentAuth, ...authData });
  }
);

export const clearAuthAtom = atom(
  null,
  (get, set) => {
    set(authAtom, initialAuthState);
  }
);

export const setTokensAtom = atom(
  null,
  (get, set, tokens: { accessToken: string; refreshToken: string; expiresIn: number }) => {
    const expiresAt = Date.now() + (tokens.expiresIn * 1000);
    set(authAtom, {
      isAuthenticated: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt,
    });
  }
);
