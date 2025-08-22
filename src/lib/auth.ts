interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  user: any;
}

class AuthManager {
  private static instance: AuthManager;
  private refreshPromise: Promise<string | null> | null = null;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  async getValidAccessToken(): Promise<string | null> {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!token || !refreshToken) {
      return null;
    }

    // Check if token is expired (with 5 min buffer)
    const expiresAt = localStorage.getItem('expires_at');
    if (expiresAt) {
      const expirationTime = new Date(parseInt(expiresAt) * 1000);
      const now = new Date();
      const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
      
      if (expirationTime.getTime() - now.getTime() > bufferTime) {
        return token; // Token is still valid
      }
    }

    // Token is expired or about to expire, refresh it
    return await this.refreshAccessToken();
  }

  private async refreshAccessToken(): Promise<string | null> {
    // Prevent multiple refresh calls
    if (this.refreshPromise) {
      return await this.refreshPromise;
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.redirectToLogin();
      return null;
    }

    this.refreshPromise = this.performRefresh(refreshToken);
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performRefresh(refreshToken: string): Promise<string | null> {
    try {
      const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';
      
      const response = await fetch(`${baseDomain}/api/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data: RefreshResponse = await response.json();
      
      // Update localStorage with new tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('expires_at', data.expires_at.toString());
      localStorage.setItem('user', JSON.stringify(data.user));

      return data.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.redirectToLogin();
      return null;
    }
  }

  private redirectToLogin(): void {
    localStorage.clear();
    window.location.href = '/login';
  }

  // Enhanced fetch wrapper that automatically handles token refresh
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getValidAccessToken();
    
    if (!token) {
      throw new Error('No valid access token available');
    }

    const refreshToken = localStorage.getItem('refresh_token');
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'x-refresh-token': refreshToken || '',
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If we get 401, try to refresh token once more
    if (response.status === 401) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        const retryHeaders = {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
          'x-refresh-token': localStorage.getItem('refresh_token') || '',
        };

        return await fetch(url, {
          ...options,
          headers: retryHeaders,
        });
      }
    }

    return response;
  }

  // Utility function to check if user is logged in
  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    return !!(token && refreshToken);
  }

  // Utility function to get current user
  getCurrentUser(): any | null {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  }

  // Utility function to logout
  logout(): void {
    localStorage.clear();
    window.location.href = '/login';
  }
}

export const authManager = AuthManager.getInstance();
export default authManager;
