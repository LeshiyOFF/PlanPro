import { useCallback } from 'react';
import { logger } from '@/utils/logger';
import { SentryService } from '@/services/SentryService';

interface ErrorHandler {
  (error: Error, errorInfo?: { componentStack?: string }): void;
}

/**
 * Hook для обработки ошибок с retries
 * Следует SOLID принципу Single Responsibility
 */
export const useErrorHandler = () => {
  const handleError = useCallback((error: Error, context?: string) => {
    logger.error(`Error in ${context || 'unknown context'}:`, error);

    // Интеграция с SentryService
    try {
      const sentryService = SentryService.getInstance();
      if (sentryService.isInitialized()) {
        sentryService.captureException(error, {
          context: context || 'unknown',
          handler: 'useErrorHandler'
        });
      }
    } catch (sentryError) {
      // Fallback если Sentry не инициализирован
      logger.warn('Sentry not available, falling back to console');
    }

    // Локальное логирование для разработки
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context || 'APP'}] Error:`, error);
    }
  }, []);

  const createRetryHandler = useCallback(
    <T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> => {
      let attempt = 0;

      const executeWithRetry = async (): Promise<T> => {
        try {
          return await operation();
        } catch (error) {
          attempt++;
          
          if (attempt <= maxRetries) {
            logger.warn(`Retry attempt ${attempt}/${maxRetries} for operation`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            return executeWithRetry();
          }
          
          throw error;
        }
      };

      return executeWithRetry();
    },
    []
  );

  const createBoundaryErrorHandler = useCallback((
    errorHandler: ErrorHandler
  ) => {
    return (error: Error, errorInfo?: { componentStack?: string }) => {
      errorHandler(error, errorInfo);
    };
  }, []);

  return {
    handleError,
    createRetryHandler,
    createBoundaryErrorHandler
  };
};

