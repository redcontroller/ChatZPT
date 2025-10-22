import { atom } from 'jotai';

// Theme type
export type Theme = 'light' | 'dark' | 'system';

// Theme state interface
export interface ThemeState {
  theme: Theme;
  systemTheme: 'light' | 'dark';
  effectiveTheme: 'light' | 'dark';
}

// Get system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Get effective theme based on current theme and system preference
const getEffectiveTheme = (theme: Theme, systemTheme: 'light' | 'dark'): 'light' | 'dark' => {
  if (theme === 'system') {
    return systemTheme;
  }
  return theme;
};

// Initial theme state
const initialThemeState: ThemeState = {
  theme: 'system',
  systemTheme: getSystemTheme(),
  effectiveTheme: getEffectiveTheme('system', getSystemTheme()),
};

// Theme atom
export const themeAtom = atom<ThemeState>(initialThemeState);

// Derived atoms
export const currentThemeAtom = atom((get) => get(themeAtom).theme);

export const effectiveThemeAtom = atom((get) => get(themeAtom).effectiveTheme);

export const isDarkModeAtom = atom((get) => get(themeAtom).effectiveTheme === 'dark');

// Actions
export const setThemeAtom = atom(
  null,
  (get, set, theme: Theme) => {
    const currentThemeState = get(themeAtom);
    const effectiveTheme = getEffectiveTheme(theme, currentThemeState.systemTheme);
    
    set(themeAtom, {
      ...currentThemeState,
      theme,
      effectiveTheme,
    });

    // Apply theme to document
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(effectiveTheme);
      
      // Store theme preference in localStorage
      localStorage.setItem('theme', theme);
    }
  }
);

export const updateSystemThemeAtom = atom(
  null,
  (get, set, systemTheme: 'light' | 'dark') => {
    const currentThemeState = get(themeAtom);
    const effectiveTheme = getEffectiveTheme(currentThemeState.theme, systemTheme);
    
    set(themeAtom, {
      ...currentThemeState,
      systemTheme,
      effectiveTheme,
    });

    // Apply theme to document if using system theme
    if (currentThemeState.theme === 'system' && typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(effectiveTheme);
    }
  }
);

// Initialize theme from localStorage
export const initializeThemeAtom = atom(
  null,
  (get, set) => {
    if (typeof window === 'undefined') return;

    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemTheme = getSystemTheme();
    
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      const effectiveTheme = getEffectiveTheme(savedTheme, systemTheme);
      
      set(themeAtom, {
        theme: savedTheme,
        systemTheme,
        effectiveTheme,
      });

      // Apply theme to document
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(effectiveTheme);
    } else {
      // No saved theme, use system preference
      set(themeAtom, {
        theme: 'system',
        systemTheme,
        effectiveTheme: systemTheme,
      });

      // Apply theme to document
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    }
  }
);
