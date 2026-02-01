/**
 * Утилиты для безопасной работы с ошибками
 * Следует принципу DRY и обеспечивает type safety в catch блоках
 */

/**
 * Извлекает сообщение из ошибки с type safety
 * @param error - Ошибка неизвестного типа из catch блока
 * @returns Строка с сообщением об ошибке
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'Unknown error occurred';
}

/**
 * Преобразует unknown error в объект Error
 * @param error - Ошибка неизвестного типа
 * @returns Экземпляр Error
 */
export function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  
  return new Error(getErrorMessage(error));
}

/**
 * Безопасно логирует ошибку с полной информацией
 * @param context - Контекст возникновения ошибки
 * @param error - Ошибка для логирования
 */
export function logError(context: string, error: unknown): void {
  const errorObj = toError(error);
  console.error(`[${context}] Error:`, {
    message: errorObj.message,
    stack: errorObj.stack,
    name: errorObj.name
  });
}

/**
 * Type guard для проверки что error является Error
 * @param error - Проверяемая ошибка
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}
