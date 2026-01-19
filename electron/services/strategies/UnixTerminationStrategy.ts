
import { ITerminationStrategy, TerminationResult } from '../interfaces/ITerminationStrategy';

/**
 * Стратегия завершения процесса для Unix-подобных систем (macOS, Linux)
 * Использует системные сигналы SIGTERM и SIGKILL
 */
export class UnixTerminationStrategy implements ITerminationStrategy {
  /**
   * Попытка мягкого завершения через SIGTERM
   */
  public async terminate(pid: number): Promise<TerminationResult> {
    try {
      process.kill(pid, 'SIGTERM');
      return { success: true, method: 'SIGTERM' };
    } catch (err) {
      return { 
        success: false, 
        method: 'SIGTERM', 
        error: err instanceof Error ? err.message : String(err) 
      };
    }
  }

  /**
   * Принудительное завершение через SIGKILL
   */
  public async forceKill(pid: number): Promise<TerminationResult> {
    try {
      process.kill(pid, 'SIGKILL');
      return { success: true, method: 'SIGKILL' };
    } catch (err) {
      return { 
        success: false, 
        method: 'SIGKILL', 
        error: err instanceof Error ? err.message : String(err) 
      };
    }
  }
}

