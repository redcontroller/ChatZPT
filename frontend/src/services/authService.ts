import { apiClient } from './api';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  RefreshTokenResponse
} from '@shared/types/auth';
import { User } from '@shared/types/user';

class AuthService {
  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse['data']>('/auth/login', credentials);
    
    if (response.success && response.data) {
      // Store tokens in sessionStorage
      sessionStorage.setItem('access_token', response.data.tokens.accessToken);
      sessionStorage.setItem('refresh_token', response.data.tokens.refreshToken);
      sessionStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  // Register user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse['data']>('/auth/register', userData);
    
    if (response.success && response.data) {
      // Store tokens in sessionStorage
      sessionStorage.setItem('access_token', response.data.tokens.accessToken);
      sessionStorage.setItem('refresh_token', response.data.tokens.refreshToken);
      sessionStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse['data']>('/auth/refresh', { refreshToken });
    
    if (response.success && response.data) {
      // Update stored tokens in sessionStorage
      sessionStorage.setItem('access_token', response.data.accessToken);
      sessionStorage.setItem('refresh_token', response.data.refreshToken);
    }
    
    return response;
  }

  // Logout user
  async logout(): Promise<void> {
    const refreshToken = sessionStorage.getItem('refresh_token');
    
    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      // Ignore logout errors
      console.error('Logout error:', error);
    } finally {
      // Clear session storage regardless of API call success
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
    const response = await apiClient.get<any>('/auth/me');
    
    if (response.success && response.data && response.data.user) {
      // Update stored user data in sessionStorage
      sessionStorage.setItem('user_data', JSON.stringify(response.data.user));
      return response.data.user;
    }
    
    throw new Error('Failed to get current user');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = sessionStorage.getItem('access_token');
    const userData = sessionStorage.getItem('user_data');
    return !!(token && userData);
  }

  // Get stored user data
  getStoredUser(): User | null {
    const userData = sessionStorage.getItem('user_data');
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
    return sessionStorage.getItem('access_token');
  }

  // Get stored refresh token
  getStoredRefreshToken(): string | null {
    return sessionStorage.getItem('refresh_token');
  }

  // Clear authentication storage
  clearAuthStorage(): void {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_data');
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
