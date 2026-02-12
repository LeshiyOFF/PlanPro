
import { dialog, app, shell } from 'electron';
import { join } from 'path';

/**
 * Сервис обработки ошибок процесса инициализации приложения.
 * Соответствует SOLID: Single Responsibility Principle.
 */
export class BootstrapErrorHandler {
  /**
   * Отображение диалогового окна с ошибкой и завершение приложения.
   * @param error Объект ошибки
   */
  public static handleFatalError(error: Error): void {
    console.error('[BootstrapErrorHandler] Fatal bootstrap error:', error);

    const message = this.formatErrorMessage(error);
    const logsPath = join(app.getPath('userData'), 'logs');
    
    const result = dialog.showMessageBoxSync({
      type: 'error',
      title: 'ПланПро - Ошибка запуска',
      message: 'The application failed to start.',
      detail: message,
      buttons: ['Exit', 'Open Logs Folder'],
      defaultId: 0,
      cancelId: 0
    });

    // Если пользователь выбрал "Open Logs Folder"
    if (result === 1) {
      shell.openPath(logsPath).catch(err => {
        console.error('[BootstrapErrorHandler] Failed to open logs folder:', err);
      });
    }

    app.quit();
  }

  /**
   * Форматирование сообщения об ошибке с полезными инструкциями.
   */
  private static formatErrorMessage(error: Error): string {
    const logsPath = join(app.getPath('userData'), 'logs');
    let message = error.message;

    if (message.includes('Java API failed to become ready')) {
      message = 'Java backend did not respond in time.\n\n' +
                'Possible reasons:\n' +
                '1. Port conflict: Check if port 8080-8083 are available.\n' +
                '2. Another instance of ПланПро is already running.\n' +
                '3. Firewall is blocking Java process.\n' +
                '4. Java Runtime (JRE) is missing or corrupted.\n' +
                '5. JAR file corruption or dependency issues.\n\n' +
                'Actions:\n' +
                '• Close other Java applications and restart.\n' +
                '• Check Windows Task Manager for orphaned java.exe processes.\n' +
                '• Temporarily disable firewall and try again.\n' +
                '• Reinstall the application if the issue persists.\n\n' +
                '📋 Detailed logs available at:\n' + logsPath + '\n\n' +
                'Technical details: ' + error.message;
    } else if (message.includes('JRE path not found')) {
      message = 'Java Runtime Environment (JRE) was not found in the application bundle.\n\n' +
                'Please reinstall the application.\n\n' +
                '📋 Logs location: ' + logsPath;
    } else if (message.includes('Unable to find free API port')) {
      message = 'Cannot find available network port for Java backend.\n\n' +
                'Ports 8080-8083 are all occupied by other applications.\n\n' +
                'Please close applications using these ports and restart.\n\n' +
                '📋 Logs location: ' + logsPath;
    } else if (message.includes('Executable JAR not found')) {
      message = 'Java application JAR file was not found.\n\n' +
                'This indicates an incomplete installation or corrupted application files.\n\n' +
                'Please reinstall ПланПро.\n\n' +
                '📋 Logs location: ' + logsPath + '\n' +
                'Technical details: ' + error.message;
    }

    return message;
  }
}

