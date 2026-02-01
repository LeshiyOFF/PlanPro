/**
 * Кастомная ошибка валидации с детальной информацией
 * Следует SOLID принципам и Clean Architecture
 */

import type { ValidationError as ValidationErrorType } from '@/types';

/**
 * Класс ошибки валидации с типизированным полем validationErrors
 */
export class ValidationException extends Error {
  public readonly validationErrors: ValidationErrorType[];

  constructor(message: string, validationErrors: ValidationErrorType[]) {
    super(message);
    this.name = 'ValidationException';
    this.validationErrors = validationErrors;

    // Устанавливаем правильный прототип для instanceof
    Object.setPrototypeOf(this, ValidationException.prototype);
  }

  /**
   * Type Guard для проверки, является ли ошибка ValidationException
   */
  static isValidationException(error: unknown): error is ValidationException {
    return error instanceof ValidationException;
  }

  /**
   * Форматирование ошибок в читаемый формат
   */
  public formatErrors(): string {
    return this.validationErrors
      .map(e => `${e.field}: ${e.message}`)
      .join(', ');
  }
}
