/**
 * Тип для перехваченных ошибок (CaughtError)
 * Используется вместо `error: unknown` для type safety
 * Следует SOLID принципам и обеспечивает полную типизацию ошибок
 */

import { isError } from '@/utils/errorUtils'
import { ValidationException } from './ValidationError'

/**
 * Тип для перехваченных ошибок в catch блоках
 * Включает все стандартные типы ошибок JavaScript
 * Позволяет type-safe обработку ошибок без unknown
 */
export type CaughtError =
  | Error
  | TypeError
  | ReferenceError
  | SyntaxError
  | RangeError
  | EvalError
  | URIError
  | DOMException
  | ValidationException;

/**
 * Type guard для проверки, является ли ошибка CaughtError
 * @param error - Проверяемая ошибка
 * @returns true если ошибка является CaughtError
 */
export function isCaughtError(error: unknown): error is CaughtError {
  if (isError(error)) {
    return true
  }

  if (
    error instanceof TypeError ||
    error instanceof ReferenceError ||
    error instanceof SyntaxError ||
    error instanceof RangeError ||
    error instanceof EvalError ||
    error instanceof URIError ||
    error instanceof DOMException ||
    error instanceof ValidationException
  ) {
    return true
  }

  return false
}

/**
 * Преобразует unknown error в CaughtError
 * Если ошибка не является CaughtError, оборачивает её в Error
 * @param error - Ошибка неизвестного типа
 * @returns CaughtError
 */
export function toCaughtError(error: unknown): CaughtError {
  if (isCaughtError(error)) {
    return error
  }

  if (typeof error === 'string') {
    return new Error(error)
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String((error as { message: unknown }).message))
  }

  return new Error('Unknown error occurred')
}

/**
 * Извлекает сообщение из CaughtError
 * @param error - CaughtError
 * @returns Строка с сообщением об ошибке
 */
export function getCaughtErrorMessage(error: CaughtError): string {
  if (error instanceof ValidationException) {
    return error.formatErrors()
  }
  return error.message || 'Unknown error'
}

/** Алиас для импорта из @/errors/CaughtError (совместимость с API-клиентами) */
export const getErrorMessage = getCaughtErrorMessage
