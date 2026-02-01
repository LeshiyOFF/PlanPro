import { logger } from '@/utils/logger'

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

/**
 * Определение прав доступа по ролям
 */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
  user: ['read', 'write'],
  viewer: ['read'],
}

/**
 * Учётные данные для локальной аутентификации (desktop).
 * Только для тестов и разработки. В production заменить на AuthAPI / LDAP / OAuth.
 */
const LOCAL_CREDENTIALS = [
  { username: 'admin', password: 'password', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' },
  { username: 'viewer', password: 'viewer123', role: 'viewer' },
]

/**
 * Сервис аутентификации
 * Реализует локальную аутентификацию для desktop-приложения
 */
class AuthService {
  private static instance: AuthService
  private readonly TOKEN_KEY = 'auth_token'
  private readonly TOKEN_EXPIRY_HOURS = 24

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      logger.dialog('Login attempt initiated', { username: credentials.username }, 'Login')

      const response = await this.authenticateUser(credentials)

      if (response.success && response.token && response.user) {
        this.storeAuthToken(response.token, response.user)
        logger.dialog('Login successful', { userId: response.user.id }, 'Login')
      } else {
        logger.dialogError('Login failed', { error: response.error }, 'Login')
      }

      return response
    } catch (error) {
      logger.dialogError('Login error', error instanceof Error ? error : String(error), 'Login')
      return {
        success: false,
        error: 'Authentication service unavailable',
      }
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getAuthToken()

      if (token) {
        logger.dialog('User logged out', { userId: token.user.id }, 'Auth')
      }

      this.removeAuthToken()
    } catch (error) {
      logger.dialogError('Logout error', error instanceof Error ? error : String(error), 'Auth')
      this.removeAuthToken()
    }
  }

  getAuthToken(): AuthToken | null {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_KEY)
      if (!tokenData) return null

      const token: AuthToken = JSON.parse(tokenData)

      if (new Date(token.expiresAt) <= new Date()) {
        this.removeAuthToken()
        return null
      }

      return token
    } catch (error) {
      logger.dialogError('Token parsing error', error instanceof Error ? error : String(error), 'Auth')
      this.removeAuthToken()
      return null
    }
  }

  isAuthenticated(): boolean {
    return this.getAuthToken() !== null
  }

  getCurrentUser(): { id: string; username: string; role: string } | null {
    const token = this.getAuthToken()
    return token ? token.user : null
  }

  hasPermission(permission: string): boolean {
    const token = this.getAuthToken()
    if (!token) return false

    const userPermissions = ROLE_PERMISSIONS[token.user.role] || []
    return userPermissions.includes(permission)
  }

  private async authenticateUser(credentials: LoginCredentials): Promise<AuthResponse> {
    const validUser = LOCAL_CREDENTIALS.find(
      uc => uc.username === credentials.username && uc.password === credentials.password,
    )

    if (validUser) {
      const token = this.generateToken(validUser)

      return {
        success: true,
        token,
        user: {
          id: `user_${validUser.username}`,
          username: validUser.username,
          role: validUser.role,
          permissions: ROLE_PERMISSIONS[validUser.role] || [],
        },
      }
    }

    return {
      success: false,
      error: 'Invalid username or password',
    }
  }

  private generateToken(user: { username: string; role: string }): string {
    const payload = {
      sub: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (this.TOKEN_EXPIRY_HOURS * 60 * 60),
    }

    return btoa(JSON.stringify(payload))
  }

  private storeAuthToken(token: string, user: { id: string; username: string; role: string }): void {
    const authToken: AuthToken = {
      token,
      expiresAt: new Date(Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
      user,
    }

    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(authToken))
  }

  private removeAuthToken(): void {
    localStorage.removeItem(this.TOKEN_KEY)
  }
}

export const authService = AuthService.getInstance()
