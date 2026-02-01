import type { SentryConfig } from '@/services/SentryService'
import { getElectronAPI } from '@/utils/electronAPI'

/**
 * Конфигурация для разных окружений
 * Следует SOLID принципу Single Responsibility
 */
export class EnvironmentConfig {
  /**
   * Получить конфигурацию для текущего окружения
   */
  public static getSentryConfig(): SentryConfig {
    const environment = EnvironmentConfig.getEnvironment()
    const dsn = EnvironmentConfig.getSentryDsn()

    return {
      dsn,
      environment,
      release: EnvironmentConfig.getRelease(),
      tracesSampleRate: EnvironmentConfig.getTracesSampleRate(),
      enabled: EnvironmentConfig.isSentryEnabled(),
    }
  }

  /**
   * Получить тип окружения
   */
  public static getEnvironment(): string {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
      return process.env.NODE_ENV
    }

    return (typeof process !== 'undefined' && process.env?.REACT_APP_ENV) || 'development'
  }

  /**
   * Получить Sentry DSN из переменных окружения
   */
  public static getSentryDsn(): string {
    if (typeof process !== 'undefined' && process.env?.REACT_APP_SENTRY_DSN) {
      return process.env.REACT_APP_SENTRY_DSN
    }

    return 'https://default@sentry.io' // Fallback для разработки
  }

  /**
   * Получить версию релиза
   */
  public static getRelease(): string {
    return (typeof process !== 'undefined' && process.env?.REACT_APP_VERSION) || '1.0.0'
  }

  /**
   * Получить rate для трейсинга
   */
  public static getTracesSampleRate(): number {
    const env = EnvironmentConfig.getEnvironment()

    switch (env) {
      case 'production':
        return 0.1 // 10% sampling в проде
      case 'staging':
        return 0.5 // 50% sampling в staging
      default:
        return 1.0 // 100% sampling в разработке
    }
  }

  /**
   * Проверить включен ли Sentry
   */
  public static isSentryEnabled(): boolean {
    const env = EnvironmentConfig.getEnvironment()
    return env !== 'test' && env !== 'development'
  }

  private static apiPort: number = 8080

  /**
   * Установить динамический порт API
   */
  public static setApiPort(port: number): void {
    this.apiPort = port
    console.log(`[EnvironmentConfig] API Port updated to: ${port}`)
  }

  /**
   * Получить базовый URL для API
   */
  public static getApiBaseUrl(): string {
    const env = EnvironmentConfig.getEnvironment()

    // В Electron приложении мы всегда обращаемся к локальному Java серверу,
    // если не задано обратное (например, для облачной версии)
    if (getElectronAPI()) {
      return `http://localhost:${this.apiPort}`
    }

    switch (env) {
      case 'production':
        return 'https://api.projectlibre.com'
      case 'staging':
        return 'https://staging-api.projectlibre.com'
      default:
        return `http://localhost:${this.apiPort}`
    }
  }

  /**
   * Получить конфигурацию логирования
   */
  public static getLoggingConfig(): {
    level: 'debug' | 'info' | 'warn' | 'error';
    console: boolean;
    remote: boolean;
    } {
    const env = EnvironmentConfig.getEnvironment()

    return {
      level: env === 'development' ? 'debug' : 'info',
      console: env !== 'production',
      remote: EnvironmentConfig.isSentryEnabled(),
    }
  }
}

