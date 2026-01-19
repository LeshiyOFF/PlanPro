import { dialog, app, BrowserWindow } from 'electron';

/**
 * Сервис обработки ошибок графического интерфейса (Renderer Process).
 * Реализует механизм "Graceful Fallback" для предотвращения белого экрана.
 * Соответствует SOLID: Single Responsibility.
 */
export class UIErrorHandler {
  /**
   * Настройка мониторинга ошибок для конкретного окна
   */
  public static monitor(window: BrowserWindow): void {
    // 1. Ошибка загрузки контента (404, сетевой сбой и т.д.)
    window.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      this.handleLoadError(errorCode, errorDescription);
    });

    // 2. Сбой процесса отрисовки (краш вкладки)
    window.webContents.on('render-process-gone', (event, details) => {
      this.handleCrash(details.reason);
    });

    // 3. Зависание окна
    window.on('unresponsive', () => {
      this.handleUnresponsive();
    });
  }

  /**
   * Обработка ошибок загрузки
   */
  private static handleLoadError(code: number, description: string): void {
    // Игнорируем специфичные коды (например, отмену запроса)
    if (code === -3) return; 

    console.error(`[UIErrorHandler] Load failed: ${code} (${description})`);
    
    dialog.showErrorBox(
      'ProjectLibre - Interface Load Error',
      'Failed to load the user interface.\n\n' +
      `Error Code: ${code}\n` +
      `Description: ${description}\n\n` +
      'Please check your internet connection (in Dev mode) or reinstall the app.'
    );
    
    app.quit();
  }

  /**
   * Обработка краша процесса
   */
  private static handleCrash(reason: string): void {
    console.error(`[UIErrorHandler] Renderer process gone: ${reason}`);
    
    dialog.showMessageBoxSync({
      type: 'error',
      title: 'ProjectLibre - Critical Crash',
      message: 'The interface process has crashed.',
      detail: `Reason: ${reason}\n\nThe application will now close.`,
      buttons: ['Close']
    });

    app.quit();
  }

  /**
   * Обработка зависания
   */
  private static handleUnresponsive(): void {
    console.warn('[UIErrorHandler] Window became unresponsive.');
    
    const choice = dialog.showMessageBoxSync({
      type: 'warning',
      title: 'ProjectLibre - Application Not Responding',
      message: 'The interface is not responding. Would you like to wait or restart?',
      buttons: ['Wait', 'Restart']
    });

    if (choice === 1) app.relaunch();
  }
}

