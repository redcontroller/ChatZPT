import { apiClient } from './api';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  GetUserResponse
} from '@shared/types/auth';
import { User } from '@shared/types/user';

class AuthService {
  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse['data']>('/auth/login', credentials);
    
    if (response.success && response.data) {
      // Store tokens
      localStorage.setItem('access_token', response.data.tokens.accessToken);
      localStorage.setItem('refresh_token', response.data.tokens.refreshToken);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  // Register user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse['data']>('/auth/register', userData);
    
    if (response.success && response.data) {
      // Store tokens
      localStorage.setItem('access_token', response.data.tokens.accessToken);
      localStorage.setItem('refresh_token', response.data.tokens.refreshToken);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse['data']>('/auth/refresh', { refreshToken });
    
    if (response.success && response.data) {
      // Update stored tokens
      localStorage.setItem('access_token', response.data.accessToken);
      localStorage.setItem('refresh_token', response.data.refreshToken);
    }
    
    return response;
  }

  // Logout user
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      // Ignore logout errors
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      this.clearAuthStorage();
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  }

  // Reset password
  async resetPassword(token: string, password: string, confirmPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, password, confirmPassword });
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/auth/verify-email', { token });
  }

  // Resend verification email
  async resendVerification(email: string): Promise<void> {
    await apiClient.post('/auth/resend-verification', { email });
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<GetUserResponse['data']>('/auth/me');
    
    if (response.success && response.data) {
      // Update stored user data
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
      return response.data.user;
    }
    
    throw new Error('Failed to get current user');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    return !!(token && userData);
  }

  // Get stored user data
  getStoredUser(): User | null {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        return null;
      }
    }
    return null;
  }

  // Get stored access token
  getStoredToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Get stored refresh token
  getStoredRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Clear authentication storage
  clearAuthStorage(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const token = this.getStoredToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Initialize authentication state
  async initializeAuth(): Promise<{ isAuthenticated: boolean; user: User | null }> {
    if (!this.isAuthenticated()) {
      return { isAuthenticated: false, user: null };
    }

    // Check if token is expired
    if (this.isTokenExpired()) {
      const refreshToken = this.getStoredRefreshToken();
      if (refreshToken) {
        try {
          await this.refreshToken(refreshToken);
        } catch (error) {
          this.clearAuthStorage();
          return { isAuthenticated: false, user: null };
        }
      } else {
        this.clearAuthStorage();
        return { isAuthenticated: false, user: null };
      }
    }

    // Get fresh user data
    try {
      const user = await this.getCurrentUser();
      return { isAuthenticated: true, user };
    } catch (error) {
      this.clearAuthStorage();
      return { isAuthenticated: false, user: null };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
