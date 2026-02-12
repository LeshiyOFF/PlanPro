import { ipcMain } from 'electron';
import { JavaBridgeService } from '../services/JavaBridgeService';
import { IpcChannels } from '../types/IpcChannels';
import { SanityService } from '../services/SanityService';
import { SchemaValidatorService, type RawJavaResponseShape } from '../services/SchemaValidatorService';
import { JavaLauncherError } from '../services/JavaLauncherError';

/**
 * Обработчик IPC для взаимодействия с Java бэкендом.
 * Реализует паттерн Controller для изоляции логики IPC.
 * Соответствует принципам SOLID и ограничению на размер файлов.
 */
export class JavaIpcHandler {
  /**
   * Регистрация обработчиков Java API
   */
  public static register(javaBridge: JavaBridgeService): void {
    ipcMain.handle(IpcChannels.JAVA_START, async () => {
      await javaBridge.getProcessManager().start();
      return { success: true };
    });

    ipcMain.handle(IpcChannels.JAVA_STOP, async () => {
      await javaBridge.getProcessManager().stop();
      return { success: true };
    });

    ipcMain.handle(IpcChannels.JAVA_RESTART, async () => {
      await javaBridge.getProcessManager().restart();
      return { success: true };
    });

    ipcMain.handle(IpcChannels.JAVA_STATUS, () => this.getJavaStatus(javaBridge));

    ipcMain.handle(IpcChannels.JAVA_EXECUTE_COMMAND, async (_, { command, args }) => {
      const sanitizedArgs = SanityService.sanitize(args);
      const rawResult = await javaBridge.executeCommand(command, sanitizedArgs);
      if (typeof rawResult !== 'object' || rawResult === null) {
        throw new Error('Invalid Java response: expected object');
      }
      return SchemaValidatorService.validateResponse(rawResult as RawJavaResponseShape);
    });

    ipcMain.handle(IpcChannels.JAVA_API_REQUEST, async (_, { command, args }) => {
      const sanitizedArgs = SanityService.sanitize(args);
      const rawResult = await javaBridge.getApiClient().makeRequest(command, sanitizedArgs);
      if (typeof rawResult !== 'object' || rawResult === null) {
        throw new Error('Invalid Java response: expected object');
      }
      return SchemaValidatorService.validateResponse(rawResult as RawJavaResponseShape);
    });

    ipcMain.handle(IpcChannels.JAVA_SUBSCRIBE_EVENTS, () => ({ success: true, message: 'Subscribed' }));
    ipcMain.handle(IpcChannels.JAVA_UNSUBSCRIBE_EVENTS, () => ({ success: true, message: 'Unsubscribed' }));
  }

  private static getJavaStatus(javaBridge: JavaBridgeService) {
    return {
      success: true,
      data: {
        running: javaBridge.isRunning(),
        status: javaBridge.getStatus(),
        pid: javaBridge.getProcessManager().getPid(),
        port: javaBridge.getProcessManager().getPort(),
        configuration: javaBridge.getProcessManager().getConfigurationInfo()
      }
    };
  }
}
