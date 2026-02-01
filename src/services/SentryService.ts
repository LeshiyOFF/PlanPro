import * as Sentry from '@sentry/react';
import type { SeverityLevel } from '@sentry/types';
import type { Event, EventHint } from '@sentry/types';
import type { JsonObject, JsonValue } from '@/types/json-types';

/** Допустимые значения контекста Sentry: примитивы или вложенные объекты для setContext */
export type SentryContextValue = string | number | boolean | JsonObject;

/**
 * Конфигурация Sentry
 * Следует SOLID принципу Single Responsibility
 */
export interface SentryConfig {
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
      const browserTracing =
        typeof Sentry.browserTracingIntegration === 'function'
          ? Sentry.browserTracingIntegration()
          : undefined;

      Sentry.init({
        dsn: this.config.dsn,
        environment: this.config.environment,
        release: this.config.release,
        ...(browserTracing && { integrations: [browserTracing] }),
        tracesSampleRate: this.config.tracesSampleRate || 0.1,
        beforeSend: ((event: Event, _hint: EventHint) =>
          SentryService.filterSensitiveData(event)) as Sentry.BrowserOptions['beforeSend'],
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
    context?: Record<string, SentryContextValue>,
    level: SeverityLevel = 'error'
  ): void {
    if (!this.initialized) {
      console.warn('Sentry not initialized, logging to console:', error);
      return;
    }

    Sentry.withScope(scope => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          const ctx: JsonObject =
            typeof value === 'object' && value !== null && !Array.isArray(value)
              ? (value as JsonObject)
              : { value: value as JsonValue }; // Fallback for primitive values
          scope.setContext(key, ctx);
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
    context?: Record<string, SentryContextValue>
  ): void {
    if (!this.initialized) {
      console.warn('Sentry not initialized, logging to console:', message);
      return;
    }

    Sentry.withScope(scope => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          const ctx: JsonObject =
            typeof value === 'object' && value !== null && !Array.isArray(value)
              ? (value as JsonObject)
              : { value: value as JsonValue }; // Fallback for primitive values
          scope.setContext(key, ctx);
        });
      }
      scope.setLevel(level);
      Sentry.captureMessage(message);
    });
  }

  /**
   * Установка пользовательского контекста
   */
  public setUser(user: { id?: string; email?: string; username?: string } | null): void {
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
   * Создание транзакции для performance monitoring (Sentry v10.x).
   * Использует startSpan при наличии.
   */
  public startTransaction(name: string, op?: string): undefined {
    if (!this.initialized) {
      return undefined;
    }
    const spanOp = op ?? 'navigation';
    if (typeof Sentry.startSpan === 'function') {
      try {
        (Sentry.startSpan as (options: { name: string; op: string }) => void)({
          name,
          op: spanOp,
        });
      } catch {
        // игнорируем ошибки трейсинга
      }
    }
    return undefined;
  }

  /**
   * Фильтрация чувствительных данных
   */
  private static filterSensitiveData(event: Event): Event | null {
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
