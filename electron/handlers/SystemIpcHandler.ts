import { ipcMain, app, dialog, shell } from 'electron';
import * as fs from 'fs';

/**
 * Обработчик общесистемных IPC команд.
 * Следует SOLID: Single Responsibility Principle.
 */
export class SystemIpcHandler {
  /**
   * Регистрация обработчиков системных команд
   */
  public static register(): void {
    ipcMain.handle('get-app-info', () => ({
      name: app.getName(),
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch
    }));

    ipcMain.handle('show-message-box', async (_, options) => {
      return await dialog.showMessageBox(options);
    });

    ipcMain.handle('show-open-dialog', async (_, options) => {
      return await dialog.showOpenDialog(options);
    });

    ipcMain.handle('show-save-dialog', async (_, options) => {
      return await dialog.showSaveDialog(options);
    });

    ipcMain.handle('save-binary-file', async (_, { path, data }: { path: string, data: Uint8Array | ArrayBuffer }) => {
      try {
        fs.writeFileSync(path, Buffer.from(data));
        return { success: true };
      } catch (error) {
        console.error('[SystemIpcHandler] Failed to save binary file:', error);
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('open-external', (_, url) => {
      shell.openExternal(url);
    });

    console.log('[SystemIpcHandler] Registered system handlers.');
  }
}
