import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import type { SeverityLevel } from '@sentry/types';

/**
 * Конфигурация Sentry
 * Следует SOLID принципу Single Responsibility
 */
interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate?: number;
  enabled?: boolean;
}

/**
 * Sentry сервис для error tracking и performance monitoring
 * Следует SOLID принципам:
 * - Single Responsibility: Только работа с Sentry
 * - Open/Closed: Расширяется через конфигурацию
 * - Dependency Inversion: Работает с интерфейсами
 */
export class SentryService {
  private static instance: SentryService;
  private config: SentryConfig;
  private initialized: boolean = false;

  private constructor(config: SentryConfig) {
    this.config = config;
  }

  /**
   * Singleton паттерн для единственного экземпляра
   */
  public static getInstance(config?: SentryConfig): SentryService {
    if (!SentryService.instance) {
      // Используем конфигурацию по умолчанию если не предоставлена
      const defaultConfig = config || {
        dsn: (typeof process !== 'undefined' && process.env?.REACT_APP_SENTRY_DSN) || 'https://default@sentry.io',
        environment: (typeof process !== 'undefined' && process.env?.NODE_ENV) || 'development',
        enabled: !!(typeof process !== 'undefined' && process.env?.REACT_APP_SENTRY_DSN),
      };
      SentryService.instance = new SentryService(defaultConfig);
    }
    return SentryService.instance;
  }

  /**
   * Инициализация Sentry
   */
  public initialize(): void {
    if (this.initialized || !this.config.enabled) {
      return;
    }

    try {
      Sentry.init({
        dsn: this.config.dsn,
        environment: this.config.environment,
        release: this.config.release,
        integrations: [
          new BrowserTracing({
            tracingOrigins: ['localhost', /^\//],
          }),
        ],
        tracesSampleRate: this.config.tracesSampleRate || 0.1,
        beforeSend(event) {
          // Фильтрация чувствительных данных
          return SentryService.filterSensitiveData(event);
        },
      });

      this.initialized = true;
      console.log('Sentry initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Отправка ошибки в Sentry
   */
  public captureException(
    error: Error,
    context?: Record<string, any>,
    level: SeverityLevel = 'error'
  ): void {
    if (!this.initialized) {
      console.warn('Sentry not initialized, logging to console:', error);
      return;
    }

    Sentry.withScope(scope => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }
      scope.setLevel(level);
      Sentry.captureException(error);
    });
  }

  /**
   * Отправка сообщения в Sentry
   */
  public captureMessage(
    message: string,
    level: SeverityLevel = 'info',
    context?: Record<string, any>
  ): void {
    if (!this.initialized) {
      console.warn('Sentry not initialized, logging to console:', message);
      return;
    }

    Sentry.withScope(scope => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }
      scope.setLevel(level);
      Sentry.captureMessage(message);
    });
  }

  /**
   * Установка пользовательского контекста
   */
  public setUser(user: { id?: string; email?: string; username?: string }): void {
    if (!this.initialized) {
      return;
    }

    Sentry.setUser(user);
  }

  /**
   * Очистка пользовательского контекста
   */
  public clearUser(): void {
    if (!this.initialized) {
      return;
    }

    Sentry.setUser(null);
  }

  /**
   * Добавление тегов
   */
  public setTags(tags: Record<string, string>): void {
    if (!this.initialized) {
      return;
    }

    Sentry.withScope(scope => {
      Object.entries(tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    });
  }

  /**
   * Создание транзакции для performance monitoring
   */
  public startTransaction(name: string, op?: string): any {
    if (!this.initialized) {
      return undefined;
    }

    // Используем современный API Sentry v10.x
    if ('startSpan' in Sentry) {
      return (Sentry as any).startSpan?.({
        name,
        op: op || 'navigation',
      });
    }

    return undefined;
  }

  /**
   * Фильтрация чувствительных данных
   */
  private static filterSensitiveData(event: Sentry.Event): Sentry.Event {
    if (!event.breadcrumbs) {
      return event;
    }

    // Фильтрация URL с чувствительными данными
    event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
      if (breadcrumb.category === 'http' && breadcrumb.data?.url) {
        return {
          ...breadcrumb,
          data: {
            ...breadcrumb.data,
            url: breadcrumb.data.url.replace(/\/\/.*@/, '//***@'),
          },
        };
      }
      return breadcrumb;
    });

    return event;
  }

  /**
   * Проверка инициализации
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
}

