// Storage utilities for localStorage and sessionStorage

// Generic storage interface
interface StorageInterface {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

// Local storage wrapper with JSON serialization
export class LocalStorage {
  private storage: StorageInterface;

  constructor(storage: StorageInterface = window.localStorage) {
    this.storage = storage;
  }

  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = this.storage.getItem(key);
      if (item === null) {
        return defaultValue || null;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue || null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  }

  remove(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error);
    }
  }

  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  has(key: string): boolean {
    return this.storage.getItem(key) !== null;
  }

  keys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }

  size(): number {
    return this.storage.length;
  }
}

// Session storage wrapper with JSON serialization
export class SessionStorage {
  private storage: StorageInterface;

  constructor(storage: StorageInterface = window.sessionStorage) {
    this.storage = storage;
  }

  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = this.storage.getItem(key);
      if (item === null) {
        return defaultValue || null;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading from sessionStorage key "${key}":`, error);
      return defaultValue || null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to sessionStorage key "${key}":`, error);
    }
  }

  remove(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from sessionStorage key "${key}":`, error);
    }
  }

  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }

  has(key: string): boolean {
    return this.storage.getItem(key) !== null;
  }

  keys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }

  size(): number {
    return this.storage.length;
  }
}

// Create instances
export const localStorage = new LocalStorage();
export const sessionStorage = new SessionStorage();

// Storage keys constants
export const STORAGE_KEYS = {
  // Authentication
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  
  // User preferences
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  
  // App state
  LAST_ROUTE: 'last_route',
  FORM_DRAFTS: 'form_drafts',
  
  // Chat
  CHAT_HISTORY: 'chat_history',
  CHAT_SETTINGS: 'chat_settings',
  
  // Notifications
  NOTIFICATION_PREFERENCES: 'notification_preferences',
  
  // Development
  DEBUG_MODE: 'debug_mode',
  API_MOCK_MODE: 'api_mock_mode',
} as const;

// Utility functions for common storage operations
export const getStoredToken = (): string | null => {
  return localStorage.get(STORAGE_KEYS.ACCESS_TOKEN);
};

export const setStoredToken = (token: string): void => {
  localStorage.set(STORAGE_KEYS.ACCESS_TOKEN, token);
};

export const removeStoredToken = (): void => {
  localStorage.remove(STORAGE_KEYS.ACCESS_TOKEN);
};

export const getStoredRefreshToken = (): string | null => {
  return localStorage.get(STORAGE_KEYS.REFRESH_TOKEN);
};

export const setStoredRefreshToken = (token: string): void => {
  localStorage.set(STORAGE_KEYS.REFRESH_TOKEN, token);
};

export const removeStoredRefreshToken = (): void => {
  localStorage.remove(STORAGE_KEYS.REFRESH_TOKEN);
};

export const getStoredUser = (): any | null => {
  return localStorage.get(STORAGE_KEYS.USER_DATA);
};

export const setStoredUser = (user: any): void => {
  localStorage.set(STORAGE_KEYS.USER_DATA, user);
};

export const removeStoredUser = (): void => {
  localStorage.remove(STORAGE_KEYS.USER_DATA);
};

export const clearAuthStorage = (): void => {
  removeStoredToken();
  removeStoredRefreshToken();
  removeStoredUser();
};

export const getStoredTheme = (): string | null => {
  return localStorage.get(STORAGE_KEYS.THEME);
};

export const setStoredTheme = (theme: string): void => {
  localStorage.set(STORAGE_KEYS.THEME, theme);
};

export const getStoredLanguage = (): string | null => {
  return localStorage.get(STORAGE_KEYS.LANGUAGE);
};

export const setStoredLanguage = (language: string): void => {
  localStorage.set(STORAGE_KEYS.LANGUAGE, language);
};

// Storage with expiration
export interface StoredItem<T> {
  value: T;
  expiresAt: number;
}

export const setWithExpiration = <T>(key: string, value: T, expirationMinutes: number): void => {
  const expiresAt = Date.now() + (expirationMinutes * 60 * 1000);
  const item: StoredItem<T> = { value, expiresAt };
  localStorage.set(key, item);
};

export const getWithExpiration = <T>(key: string): T | null => {
  const item = localStorage.get<StoredItem<T>>(key);
  
  if (!item) {
    return null;
  }
  
  if (Date.now() > item.expiresAt) {
    localStorage.remove(key);
    return null;
  }
  
  return item.value;
};

// Storage quota management
export const getStorageQuota = (): Promise<{ used: number; total: number }> => {
  return new Promise((resolve) => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then((estimate) => {
        resolve({
          used: estimate.usage || 0,
          total: estimate.quota || 0,
        });
      });
    } else {
      // Fallback for browsers that don't support storage quota API
      resolve({ used: 0, total: 0 });
    }
  });
};

export const getStorageUsagePercentage = async (): Promise<number> => {
  const quota = await getStorageQuota();
  if (quota.total === 0) return 0;
  return (quota.used / quota.total) * 100;
};
