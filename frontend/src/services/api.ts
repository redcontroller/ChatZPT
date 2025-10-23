import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@shared/types/api';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<string> | null = null;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add request ID
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        // Add auth token if available
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Skip refresh for auth endpoints to prevent infinite loops
          if (originalRequest.url?.includes('/auth/')) {
            return Promise.reject(error);
          }

          originalRequest._retry = true;

          // If already refreshing, queue the request
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          this.isRefreshing = true;

          try {
            const refreshToken = this.getStoredRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Check if refresh token is expired before making the request
            if (this.isRefreshTokenExpired(refreshToken)) {
              throw new Error('Refresh token expired');
            }

            this.refreshPromise = this.performTokenRefresh(refreshToken);
            const newAccessToken = await this.refreshPromise;

            // Process queued requests
            this.processQueue(null, newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.client(originalRequest);

          } catch (refreshError) {
            // Process queued requests with error
            this.processQueue(refreshError, null);
            
            // Clear auth storage and redirect to login
            this.clearAuthStorage();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private getStoredToken(): string | null {
    return sessionStorage.getItem('access_token');
  }

  private getStoredRefreshToken(): string | null {
    return sessionStorage.getItem('refresh_token');
  }

  private setStoredToken(token: string): void {
    sessionStorage.setItem('access_token', token);
  }

  private clearAuthStorage(): void {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_data');
  }

  private isRefreshTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true; // If we can't parse the token, consider it expired
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<string> {
    const response = await this.refreshAccessToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = response.data?.tokens || {};
    
    if (!accessToken) {
      throw new Error('No access token received from refresh');
    }

    this.setStoredToken(accessToken);
    
    // Store new refresh token if provided
    if (newRefreshToken) {
      sessionStorage.setItem('refresh_token', newRefreshToken);
    }
    
    return accessToken;
  }

  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request<ApiResponse<T>>(config);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw {
        success: false,
        message: 'Network error',
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  // HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // Auth specific methods
  async refreshAccessToken(refreshToken: string): Promise<ApiResponse<{ tokens: { accessToken: string; refreshToken: string; expiresIn: number } }>> {
    return this.post('/auth/refresh', { refreshToken });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string; uptime: number; environment: string }>> {
    return this.get('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
