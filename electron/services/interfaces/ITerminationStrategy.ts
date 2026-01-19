
/**
 * Результат операции завершения процесса
 */
export interface TerminationResult {
  readonly success: boolean;
  readonly method: 'SIGTERM' | 'SIGKILL' | 'TASKKILL' | 'NONE';
  readonly error?: string;
}

/**
 * Интерфейс стратегии завершения процесса
 * Соответствует Open/Closed Principle (SOLID)
 */
export interface ITerminationStrategy {
  /**
   * Попытаться завершить процесс
   * @param pid Идентификатор процесса
   */
  terminate(pid: number): Promise<TerminationResult>;

  /**
   * Принудительно завершить процесс
   * @param pid Идентификатор процесса
   */
  forceKill(pid: number): Promise<TerminationResult>;
}

