import { EventEmitter } from 'events';
import { JavaLauncherError } from '../JavaLauncherError';

/**
 * Продвинутый обработчик ошибок Java процесса
 */
export class ProcessErrorHandler {
  /**
   * Расширенное логирование ошибок запуска
   */
  public static logLaunchError(error: Error, config: {
    classpath: string;
    mainClass: string;
  }): void {
    const errorContext = {
      error: error.message,
      stack: error.stack,
      classpath: config.classpath,
      mainClass: config.mainClass,
      timestamp: new Date().toISOString(),
      pid: process.pid
    };

    if (error instanceof JavaLauncherError) {
      console.error('🚨 JavaLauncher Error:', {
        ...errorContext,
        code: error.code,
        context: error.context,
        suggestions: error.suggestions,
        errorType: 'JavaLauncherError'
      });
      
      // Логирование рекомендаций для пользователя
      ProcessErrorHandler.logErrorSuggestions(error.suggestions);
    } else {
      console.error('❌ Generic Error:', {
        ...errorContext,
        errorType: 'GenericError'
      });
    }
  }

  /**
   * Эмиссия расширенных событий ошибок
   */
  public static emitEnhancedErrorEvents(
    error: Error,
    eventEmitter: EventEmitter,
    config: {
      classpath: string;
      mainClass: string;
    }
  ): void {
    const eventData = {
      error: error.message,
      code: error instanceof JavaLauncherError ? error.code : 'UNKNOWN',
      context: error instanceof JavaLauncherError ? error.context : 'Generic error',
      suggestions: error instanceof JavaLauncherError ? error.suggestions : [],
      timestamp: new Date().toISOString(),
      recoverable: ProcessErrorHandler.isRecoverableError(error),
      classpath: config.classpath,
      mainClass: config.mainClass
    };

    eventEmitter.emit('launchError', eventData);
    eventEmitter.emit('errorDetails', eventData);
  }

  /**
   * Логирование рекомендаций по исправлению ошибок
   */
  private static logErrorSuggestions(suggestions: string[]): void {
    if (suggestions && suggestions.length > 0) {
      console.group('💡 Suggestions to fix this error:');
      suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion}`);
      });
      console.groupEnd();
    }
  }

  /**
   * Определение восстанавливаемой ошибки
   */
  public static isRecoverableError(error: Error): boolean {
    if (error instanceof JavaLauncherError) {
      const recoverableCodes = ['JAVA_NOT_FOUND', 'PORT_IN_USE', 'PERMISSION_DENIED'];
      return recoverableCodes.includes(error.code);
    }
    return false;
  }
}