import { atom } from 'jotai';

// Authentication state interface
export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

// Load initial state from sessionStorage
const loadInitialAuthState = (): AuthState => {
  try {
    const accessToken = sessionStorage.getItem('access_token');
    const refreshToken = sessionStorage.getItem('refresh_token');
    const userData = sessionStorage.getItem('user_data');
    
    if (accessToken && refreshToken && userData) {
      // Parse token to get expiration time
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const expiresAt = payload.exp * 1000; // Convert to milliseconds
        
        return {
          isAuthenticated: true,
          accessToken,
          refreshToken,
          expiresAt,
        };
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  } catch (error) {
    console.error('Error loading auth state from sessionStorage:', error);
  }
  
  return {
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
  };
};

// Initial authentication state
const initialAuthState: AuthState = loadInitialAuthState();

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
    const newAuth = { ...currentAuth, ...authData };
    set(authAtom, newAuth);
    
    // Sync with sessionStorage
    if (newAuth.accessToken) {
      sessionStorage.setItem('access_token', newAuth.accessToken);
    }
    if (newAuth.refreshToken) {
      sessionStorage.setItem('refresh_token', newAuth.refreshToken);
    }
    if (newAuth.expiresAt) {
      // Store expiration time if needed
      sessionStorage.setItem('token_expires_at', newAuth.expiresAt.toString());
    }
  }
);

export const clearAuthAtom = atom(
  null,
  (get, set) => {
    set(authAtom, {
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
    });
    
    // Clear sessionStorage
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_data');
    sessionStorage.removeItem('token_expires_at');
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
    
    // Sync with sessionStorage
    sessionStorage.setItem('access_token', tokens.accessToken);
    sessionStorage.setItem('refresh_token', tokens.refreshToken);
    sessionStorage.setItem('token_expires_at', expiresAt.toString());
  }
);
