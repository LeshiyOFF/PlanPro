/**
 * Утилиты для безопасной работы с ошибками
 * Следует принципу DRY и обеспечивает type safety в catch блоках
 */

/** Всё, что может быть выброшено в catch (строгая типизация без unknown) */
export type Throwable = Error | string | number | object | null | undefined

/**
 * Извлекает сообщение из ошибки с type safety
 * @param error - Ошибка из catch блока (Throwable)
 * @returns Строка с сообщением об ошибке
 */
export function getErrorMessage(error: Throwable): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (typeof error === 'number') {
    return String(error)
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message)
  }

  return 'Unknown error occurred'
}

/**
 * Преобразует Throwable в объект Error
 * @param error - Ошибка из catch блока
 * @returns Экземпляр Error
 */
export function toError(error: Throwable): Error {
  if (error instanceof Error) {
    return error
  }

  return new Error(getErrorMessage(error))
}

/**
 * Безопасно логирует ошибку с полной информацией
 * @param context - Контекст возникновения ошибки
 * @param error - Ошибка для логирования
 */
export function logError(context: string, error: Throwable): void {
  const errorObj = toError(error)
  console.error(`[${context}] Error:`, {
    message: errorObj.message,
    stack: errorObj.stack,
    name: errorObj.name,
  })
}

/**
 * Type guard для проверки что error является Error
 * @param error - Проверяемая ошибка
 */
export function isError(error: Throwable): error is Error {
  return error instanceof Error
}
