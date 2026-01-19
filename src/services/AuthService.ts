import { logger } from '@/utils/logger';

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    role: string;
    permissions: string[];
  };
  error?: string;
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

class AuthService {
  private static instance: AuthService;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly API_ENDPOINT = '/api/auth';

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      logger.dialog('Login attempt initiated', { username: credentials.username }, 'Login');

      // TODO: Replace with actual API call
      const response = await this.authenticateUser(credentials);
      
      if (response.success && response.token && response.user) {
        this.storeAuthToken(response.token, response.user);
        logger.dialog('Login successful', { userId: response.user.id }, 'Login');
      } else {
        logger.dialogError('Login failed', { error: response.error }, 'Login');
      }

      return response;
    } catch (error) {
      logger.dialogError('Login error', error, 'Login');
      return {
        success: false,
        error: 'Authentication service unavailable'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getAuthToken();
      
      if (token) {
        // TODO: Call API to invalidate token
        logger.dialog('User logged out', { userId: token.user.id }, 'Auth');
      }

      this.removeAuthToken();
    } catch (error) {
      logger.dialogError('Logout error', error, 'Auth');
      // Still remove local token even if API call fails
      this.removeAuthToken();
    }
  }

  getAuthToken(): AuthToken | null {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_KEY);
      if (!tokenData) return null;

      const token: AuthToken = JSON.parse(tokenData);
      
      // Check if token is expired
      if (new Date(token.expiresAt) <= new Date()) {
        this.removeAuthToken();
        return null;
      }

      return token;
    } catch (error) {
      logger.dialogError('Token parsing error', error, 'Auth');
      this.removeAuthToken();
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getAuthToken() !== null;
  }

  getCurrentUser(): { id: string; username: string; role: string } | null {
    const token = this.getAuthToken();
    return token ? token.user : null;
  }

  hasPermission(permission: string): boolean {
    const token = this.getAuthToken();
    if (!token) return false;

    // TODO: Implement proper permission checking
    const rolePermissions: Record<string, string[]> = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
      user: ['read', 'write'],
      viewer: ['read']
    };

    const userPermissions = rolePermissions[token.user.role] || [];
    return userPermissions.includes(permission);
  }

  private async authenticateUser(credentials: LoginCredentials): Promise<AuthResponse> {
    // TODO: Replace with actual API implementation
    // This is a temporary implementation for development
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Development credentials for testing
    const validCredentials = [
      { username: 'admin', password: 'password', role: 'admin' },
      { username: 'user', password: 'user123', role: 'user' },
      { username: 'viewer', password: 'viewer123', role: 'viewer' }
    ];

    const validUser = validCredentials.find(
      uc => uc.username === credentials.username && uc.password === credentials.password
    );

    if (validUser) {
      const token = this.generateToken(validUser);
      
      return {
        success: true,
        token,
        user: {
          id: `user_${validUser.username}`,
          username: validUser.username,
          role: validUser.role,
          permissions: this.getRolePermissions(validUser.role)
        }
      };
    }

    return {
      success: false,
      error: 'Invalid username or password'
    };
  }

  private generateToken(user: { username: string; role: string }): string {
    // TODO: Replace with proper JWT token generation
    const payload = {
      sub: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    return btoa(JSON.stringify(payload));
  }

  private getRolePermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
      user: ['read', 'write'],
      viewer: ['read']
    };

    return permissions[role] || [];
  }

  private storeAuthToken(token: string, user: { id: string; username: string; role: string }): void {
    const authToken: AuthToken = {
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      user
    };

    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(authToken));
  }

  private removeAuthToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}

export const authService = AuthService.getInstance();

