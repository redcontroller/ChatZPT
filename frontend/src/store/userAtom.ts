import { atom } from 'jotai';

// User interface
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  emailVerified: boolean;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'ko' | 'en';
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
}

// User state interface
export interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Initial user state
const initialUserState: UserState = {
  user: null,
  isLoading: false,
  error: null,
};

// User atom
export const userAtom = atom<UserState>(initialUserState);

// Derived atoms
export const currentUserAtom = atom((get) => get(userAtom).user);

export const userLoadingAtom = atom((get) => get(userAtom).isLoading);

export const userErrorAtom = atom((get) => get(userAtom).error);

// Actions
export const setUserAtom = atom(
  null,
  (get, set, user: User | null) => {
    const currentUserState = get(userAtom);
    set(userAtom, {
      ...currentUserState,
      user,
      error: null,
    });
  }
);

export const setUserLoadingAtom = atom(
  null,
  (get, set, isLoading: boolean) => {
    const currentUserState = get(userAtom);
    set(userAtom, {
      ...currentUserState,
      isLoading,
    });
  }
);

export const setUserErrorAtom = atom(
  null,
  (get, set, error: string | null) => {
    const currentUserState = get(userAtom);
    set(userAtom, {
      ...currentUserState,
      error,
    });
  }
);

export const updateUserPreferencesAtom = atom(
  null,
  (get, set, preferences: Partial<User['preferences']>) => {
    const currentUserState = get(userAtom);
    if (currentUserState.user) {
      set(userAtom, {
        ...currentUserState,
        user: {
          ...currentUserState.user,
          preferences: {
            ...currentUserState.user.preferences,
            ...preferences,
          },
        },
      });
    }
  }
);

export const clearUserAtom = atom(
  null,
  (get, set) => {
    set(userAtom, initialUserState);
  }
);
