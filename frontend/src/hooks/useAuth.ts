import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { 
  authAtom, 
  setAuthAtom, 
  clearAuthAtom, 
  setTokensAtom 
} from '../store/authAtom';
import { 
  userAtom, 
  setUserAtom, 
  clearUserAtom 
} from '../store/userAtom';
import { 
  setAuthLoadingAtom 
} from '../store/loadingAtom';
import { LoginRequest, RegisterRequest } from '@shared/types/auth';

export const useAuth = () => {
  const [auth, setAuth] = useAtom(authAtom);
  const [, setAuthData] = useAtom(setAuthAtom);
  const [, clearAuth] = useAtom(clearAuthAtom);
  const [, setTokens] = useAtom(setTokensAtom);
  const [user, setUser] = useAtom(userAtom);
  const [, setUserData] = useAtom(setUserAtom);
  const [, clearUser] = useAtom(clearUserAtom);
  const [, setAuthLoading] = useAtom(setAuthLoadingAtom);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      setAuthLoading(true);
      try {
        const { isAuthenticated, user: userData } = await authService.initializeAuth();
        
        setAuthData({
          isAuthenticated,
          accessToken: isAuthenticated ? authService.getStoredToken() : null,
          refreshToken: isAuthenticated ? authService.getStoredRefreshToken() : null,
          expiresAt: null, // Will be set when tokens are refreshed
        });

        if (userData) {
          setUserData(userData);
        } else {
          clearUser();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
        clearUser();
      } finally {
        setAuthLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [setAuthData, setUserData, clearAuth, clearUser, setAuthLoading]);

  // Login function
  const login = async (credentials: LoginRequest) => {
    setAuthLoading(true);
    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        setTokens({
          accessToken: response.data.tokens.accessToken,
          refreshToken: response.data.tokens.refreshToken,
          expiresIn: response.data.tokens.expiresIn,
        });
        
        setUserData(response.data.user);
        navigate('/dashboard');
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      return { success: false, error: error.error || { message: 'Login failed' } };
    } finally {
      setAuthLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterRequest) => {
    setAuthLoading(true);
    try {
      const response = await authService.register(userData);
      
      if (response.success && response.data) {
        setTokens({
          accessToken: response.data.tokens.accessToken,
          refreshToken: response.data.tokens.refreshToken,
          expiresIn: response.data.tokens.expiresIn,
        });
        
        setUserData(response.data.user);
        navigate('/dashboard');
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      return { success: false, error: error.error || { message: 'Registration failed' } };
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setAuthLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      clearUser();
      setAuthLoading(false);
      navigate('/');
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.error || { message: 'Failed to send reset email' } };
    }
  };

  // Reset password function
  const resetPassword = async (token: string, password: string, confirmPassword: string) => {
    try {
      await authService.resetPassword(token, password, confirmPassword);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.error || { message: 'Failed to reset password' } };
    }
  };

  // Verify email function
  const verifyEmail = async (token: string) => {
    try {
      await authService.verifyEmail(token);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.error || { message: 'Failed to verify email' } };
    }
  };

  // Resend verification function
  const resendVerification = async (email: string) => {
    try {
      await authService.resendVerification(email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.error || { message: 'Failed to resend verification email' } };
    }
  };

  return {
    // State
    isAuthenticated: auth.isAuthenticated,
    user,
    isInitialized,
    
    // Actions
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
  };
};
