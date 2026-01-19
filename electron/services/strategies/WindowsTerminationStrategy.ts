
import { execFile } from 'child_process';
import { ITerminationStrategy, TerminationResult } from '../interfaces/ITerminationStrategy';

/**
 * Стратегия завершения процесса для ОС Windows
 * Использует утилиту taskkill
 */
export class WindowsTerminationStrategy implements ITerminationStrategy {
  /**
   * Попытка мягкого завершения через taskkill
   */
  public async terminate(pid: number): Promise<TerminationResult> {
    return new Promise((resolve) => {
      execFile('taskkill', ['/PID', pid.toString()], (err) => {
        if (err) {
          resolve({ success: false, method: 'TASKKILL', error: err.message });
        } else {
          resolve({ success: true, method: 'TASKKILL' });
        }
      });
    });
  }

  /**
   * Принудительное завершение через taskkill /F
   */
  public async forceKill(pid: number): Promise<TerminationResult> {
    return new Promise((resolve) => {
      execFile('taskkill', ['/F', '/PID', pid.toString()], (err) => {
        if (err) {
          resolve({ success: false, method: 'TASKKILL', error: err.message });
        } else {
          resolve({ success: true, method: 'TASKKILL' });
        }
      });
    });
  }
}

