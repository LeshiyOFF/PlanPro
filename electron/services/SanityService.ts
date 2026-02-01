import type { JsonValue } from '../types/JsonValue';

/**
 * Сервис санитизации (очистки) данных.
 * Обеспечивает защиту от SQL Injection и XSS атак через очистку входных параметров.
 * Соответствует SOLID: Single Responsibility Principle.
 */
export class SanityService {
  /**
   * Регулярное выражение для обнаружения потенциально опасных символов SQL
   */
  private static readonly SQL_INJECTION_PATTERN = /['";\-/*]|--|xp_|[0-9]=[0-9]/gi;

  /**
   * Санитизация любого типа данных (рекурсивно для объектов)
   */
  public static sanitize<T>(data: T): T {
    if (typeof data === 'string') {
      return this.sanitizeString(data) as T;
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item)) as T;
    }
    
    if (data !== null && typeof data === 'object') {
      const sanitizedObj: Record<string, JsonValue> = {};
      for (const [key, value] of Object.entries(data)) {
        sanitizedObj[key] = this.sanitize(value) as JsonValue;
      }
      return sanitizedObj as T;
    }
    
    return data;
  }

  /**
   * Очистка строки от опасных символов
   */
  private static sanitizeString(str: string): string {
    // 1. Базовая замена опасных SQL последовательностей
    let sanitized = str.replace(this.SQL_INJECTION_PATTERN, (match) => {
      // Вместо удаления, мы можем экранировать или заменять на безопасный аналог
      // Для данного проекта выбираем политику "очистки" (удаления спецсимволов)
      return '';
    });

    // 2. Дополнительная защита от XSS (экранирование HTML тегов)
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    return sanitized.trim();
  }
}

