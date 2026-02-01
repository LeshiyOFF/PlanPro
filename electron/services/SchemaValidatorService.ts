import type { IJavaResponse } from '../types/JavaResponseDTO';
import type { JsonValue } from '../types/JsonValue';

/** Форма сырого ответа Java API до валидации (опциональные поля). */
export interface RawJavaResponseShape {
  success?: boolean;
  timestamp?: string;
  data?: JsonValue;
  error?: string;
}

/**
 * Сервис валидации схем данных.
 * Проверяет соответствие ответов Java API ожидаемым структурам.
 * Соответствует SOLID: Single Responsibility.
 */
export class SchemaValidatorService {
  /**
   * Валидация базовой структуры ответа Java
   */
  public static validateResponse<T>(response: RawJavaResponseShape): IJavaResponse<T> {
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response format: expected object');
    }

    if (typeof response.success !== 'boolean') {
      throw new Error('Invalid response format: missing success flag');
    }

    const result = { ...response } as IJavaResponse<T>;
    if (!result.timestamp) {
      result.timestamp = new Date().toISOString();
    }
    return result;
  }

  /**
   * Глубокая валидация DTO (пример для расширения)
   */
  public static validateDto(data: object, type: 'project' | 'task' | 'resource'): boolean {
    if (!data) return false;

    // Базовая проверка наличия обязательных полей
    const requirements: Record<string, string[]> = {
      project: ['id', 'name'],
      task: ['id', 'name', 'duration'],
      resource: ['id', 'name', 'type']
    };

    const fields = requirements[type];
    return fields.every(field => Object.prototype.hasOwnProperty.call(data, field));
  }
}

