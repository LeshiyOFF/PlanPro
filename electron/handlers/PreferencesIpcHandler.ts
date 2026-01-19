import { ipcMain } from 'electron';
import { PreferencesStore } from '../services/PreferencesStore';
import * as fs from 'fs';

/**
 * Обработчик IPC для управления пользовательскими настройками.
 * Отвечает за прием команд от процесса рендеринга и вызов соответствующих методов стора.
 * Соответствует принципу Single Responsibility.
 */
export class PreferencesIpcHandler {
  private static store: PreferencesStore;

  /**
   * Регистрация обработчиков IPC
   */
  public static register(): void {
    if (!this.store) {
      this.store = new PreferencesStore();
    }

    this.registerCoreHandlers();
    this.registerExternalHandlers();

    console.log('[PreferencesIpcHandler] Registered preferences handlers.');
  }

  /**
   * Регистрация основных обработчиков (внутреннее хранилище)
   */
  private static registerCoreHandlers(): void {
    ipcMain.handle('preferences:load', () => {
      try {
        return { success: true, data: this.store.load() };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('preferences:save', (_, data: any) => {
      try {
        this.store.save(data);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });
  }

  /**
   * Регистрация обработчиков для внешних файлов (импорт/экспорт)
   */
  private static registerExternalHandlers(): void {
    // Экспорт настроек в файл
    ipcMain.handle('preferences:export-to-file', (_, { path, data }: { path: string, data: any }) => {
      try {
        fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Импорт настроек из файла
    ipcMain.handle('preferences:import-from-file', (_, path: string) => {
      try {
        const content = fs.readFileSync(path, 'utf8');
        const data = JSON.parse(content);
        return { success: true, data };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });
  }
}

