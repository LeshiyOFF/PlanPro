import { useState, useCallback } from 'react'
import { logger } from '@/utils/logger'

/**
 * Хук для асинхронных операций с единым механизмом обработки ошибок
 */
export const useAsyncOperation = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Выполнение асинхронной операции с обработкой ошибок
   */
  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    errorMessage: string,
  ): Promise<T | undefined> => {
    setIsLoading(true)
    setError(null)

    try {
      return await operation()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка'
      setError(message)
      logger.error(errorMessage, err)
      return undefined
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Сброс ошибки
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { execute, isLoading, error, clearError }
}
