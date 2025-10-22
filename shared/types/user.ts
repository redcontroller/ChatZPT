// User related types

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  emailVerified: boolean;
  preferences: UserPreferences;
  security: UserSecurity;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'ko' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
  };
}

export interface UserSecurity {
  failedLoginAttempts: number;
  lockedUntil?: string;
  twoFactorEnabled: boolean;
  lastPasswordChange?: string;
}

export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
  bio?: string;
  preferences?: Partial<UserPreferences>;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
  };
  error?: ApiError;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  error?: ApiError;
}

export interface GetUserResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
  };
  error?: ApiError;
}

// Import ApiError type (will be defined in api.ts)
import type { ApiError } from './api';
