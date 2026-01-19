
import { platform } from 'os';
import { ITerminationStrategy } from '../interfaces/ITerminationStrategy';
import { WindowsTerminationStrategy } from '../strategies/WindowsTerminationStrategy';
import { UnixTerminationStrategy } from '../strategies/UnixTerminationStrategy';

/**
 * Фабрика для создания стратегии завершения процесса в зависимости от ОС
 */
export class TerminationStrategyFactory {
  /**
   * Создает подходящую стратегию для текущей платформы
   */
  public static create(): ITerminationStrategy {
    if (platform() === 'win32') {
      return new WindowsTerminationStrategy();
    }
    return new UnixTerminationStrategy();
  }
}

