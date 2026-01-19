import { ipcMain, app, dialog, shell } from 'electron';

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

    ipcMain.handle('open-external', (_, url) => {
      shell.openExternal(url);
    });

    console.log('[SystemIpcHandler] Registered system handlers.');
  }
}
