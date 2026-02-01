import { ipcService } from './IpcService';
import type { JavaCommandArgs } from '@/types/ipc';
import type { JsonObject } from '@/types/json-types';

/**
 * Базовый класс для Java API сервисов.
 * Реализует общую логику выполнения команд через IPC.
 * Соответствует принципам DRY и SOLID.
 */
export abstract class BaseJavaService {
  /**
   * Выполнение Java API команды через IPC мост.
   * @param command Имя команды (например, 'project.list')
   * @param args Аргументы команды
   * @param silent Если true, ошибки не выводятся в консоль (для фоновых задач)
   */
  protected async executeApiCommand<T = JsonObject>(
    command: string,
    args: JavaCommandArgs[] = [],
    silent: boolean = false
  ): Promise<T | undefined> {
    try {
      const result = await ipcService.executeJavaApiRequest(command, args);
      
      // Если запрос успешен на уровне API, возвращаем данные из поля 'data'
      if (result.success) {
        return result.data;
      }
      
      throw new Error(result.error || `Java API command failed: ${command}`);
    } catch (error) {
      if (!silent) {
        console.error(`[BaseJavaService] Command ${command} failed:`, error);
      }
      throw error;
    }
  }
}

