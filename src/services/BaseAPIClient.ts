import { EnvironmentConfig } from '@/config/EnvironmentConfig';

// Master Functionality Catalog типы
import type {
  ID,
  Project,
  Task,
  Resource,
  Assignment,
  Dependency,
  View,
  ExportFormat,
  ImportFormat,
  DependencyType,
  Percentage,
  ValidationResult,
  ValidationError
} from '@/types'

/**
 * Конфигурация API клиента
 * Следует SOLID принципам (Dependency Inversion)
 */
export interface APIClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  retryAttempts?: number;
}

/**
 * Базовый ответ API
 */
export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ValidationError[];
}

/**
 * Параметры пагинации
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Базовый API клиент с полной типизацией
 * Реализует паттерн Repository и следует SOLID принципам
 */
export abstract class BaseAPIClient {
  protected readonly config: APIClientConfig;
  protected readonly baseURL: string;
  protected readonly defaultHeaders: Record<string, string>;

  constructor(config: APIClientConfig = {}) {
    this.config = {
      timeout: 5000,
      retryAttempts: 3,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...config
    };
    
    // Приоритет: config.baseURL -> EnvironmentConfig -> fallback
    const base = config.baseURL || `${EnvironmentConfig.getApiBaseUrl()}/api`;
    this.baseURL = base.replace(/\/$/, '');
    
    this.defaultHeaders = {
      ...this.config.headers,
      ...config.headers
    };
  }

  /**
   * Выполнение HTTP запроса с обработкой ошибок
   * Следует Single Responsibility Principle
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const requestOptions = {
        ...options,
        headers: { ...this.defaultHeaders, ...options.headers },
        signal: controller.signal
      };

      // Детальное логирование для диагностики
      console.log('[BaseAPIClient] Sending request:', {
        url,
        method: requestOptions.method || 'GET',
        headers: requestOptions.headers,
        body: requestOptions.body
      });

      const response = await fetch(url, requestOptions);

      clearTimeout(timeoutId);

      console.log('[BaseAPIClient] Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        // Пытаемся получить тело ответа для диагностики
        let errorBody;
        try {
          errorBody = await response.text();
          console.error('[BaseAPIClient] Error response body:', errorBody);
        } catch (e) {
          console.error('[BaseAPIClient] Could not read error response body');
        }
        
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response.statusText
        );
      }

      const result = await response.json();
      console.log('[BaseAPIClient] Response data:', result);
      return result;
    } catch (error) {
      console.error('[BaseAPIClient] Request failed:', error);
      throw this.handleRequestError(error);
    }
  }

  /**
   * Обработка ошибок запроса
   */
  private handleRequestError(error: unknown): APIError {
    if (error instanceof APIError) {
      return error;
    }

    if (error instanceof Error) {
      return new APIError(error.message, 0, 'Network Error');
    }

    return new APIError('Unknown error occurred', 0, 'Unknown');
  }

  /**
   * GET запрос
   */
  protected async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<APIResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {} as Record<string, string>)
      );
      url += `?${searchParams}`;
    }

    return this.request<T>(url);
  }

  /**
   * POST запрос
   */
  protected async post<T>(
    endpoint: string,
    data?: any
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT запрос
   */
  protected async put<T>(
    endpoint: string,
    data?: any
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE запрос
   */
  protected async delete<T>(
    endpoint: string
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Загрузка файла (для import/export)
   */
  protected async upload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>
  ): Promise<APIResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Убираем Content-Type для FormData
        'Content-Type': undefined
      }
    });
  }

  /**
   * Скачивание файла (для export)
   */
  protected async download(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<Blob> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {} as Record<string, string>)
      );
      url += `?${searchParams}`;
    }

    const response = await fetch(`${this.baseURL}${url}`, {
      headers: this.defaultHeaders
    });

    if (!response.ok) {
      throw new APIError(
        `Download failed: ${response.statusText}`,
        response.status,
        response.statusText
      );
    }

    return response.blob();
  }
}

/**
 * Класс ошибки API
 * Следует принципу создания собственных типов ошибок
 */
export class APIError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly statusText?: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}
