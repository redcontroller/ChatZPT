import { atom } from 'jotai';

// Loading state interface
export interface LoadingState {
  global: boolean;
  auth: boolean;
  user: boolean;
  chat: boolean;
  [key: string]: boolean;
}

// Initial loading state
const initialLoadingState: LoadingState = {
  global: false,
  auth: false,
  user: false,
  chat: false,
};

// Loading atom
export const loadingAtom = atom<LoadingState>(initialLoadingState);

// Derived atoms for specific loading states
export const globalLoadingAtom = atom((get) => get(loadingAtom).global);

export const authLoadingAtom = atom((get) => get(loadingAtom).auth);

export const userLoadingAtom = atom((get) => get(loadingAtom).user);

export const chatLoadingAtom = atom((get) => get(loadingAtom).chat);

// Actions
export const setLoadingAtom = atom(
  null,
  (get, set, key: string, isLoading: boolean) => {
    const currentLoading = get(loadingAtom);
    set(loadingAtom, {
      ...currentLoading,
      [key]: isLoading,
    });
  }
);

export const setGlobalLoadingAtom = atom(
  null,
  (get, set, isLoading: boolean) => {
    set(setLoadingAtom, 'global', isLoading);
  }
);

export const setAuthLoadingAtom = atom(
  null,
  (get, set, isLoading: boolean) => {
    set(setLoadingAtom, 'auth', isLoading);
  }
);

export const setUserLoadingAtom = atom(
  null,
  (get, set, isLoading: boolean) => {
    set(setLoadingAtom, 'user', isLoading);
  }
);

export const setChatLoadingAtom = atom(
  null,
  (get, set, isLoading: boolean) => {
    set(setLoadingAtom, 'chat', isLoading);
  }
);

// Utility to check if any loading is active
export const isAnyLoadingAtom = atom((get) => {
  const loading = get(loadingAtom);
  return Object.values(loading).some(Boolean);
});

// Clear all loading states
export const clearAllLoadingAtom = atom(
  null,
  (get, set) => {
    set(loadingAtom, initialLoadingState);
  }
);
