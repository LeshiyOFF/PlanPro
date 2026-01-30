import { app, BrowserWindow, shell, ipcMain, dialog, Menu } from 'electron';
import { WindowManager } from './services/WindowManager';
import { MenuService } from './services/MenuService';
import { JavaBridgeService } from './services/JavaBridgeService';
import { ConfigService } from './services/ConfigService';
import { AppBootstrapper } from './services/AppBootstrapper';
import { IpcChannels } from './types/IpcChannels';
import { SecurityPolicyManager } from './services/SecurityPolicyManager';
import { PreferencesIpcHandler } from './handlers/PreferencesIpcHandler';
import { JavaIpcHandler } from './handlers/JavaIpcHandler';
import { SystemIpcHandler } from './handlers/SystemIpcHandler';

/**
 * Основной класс приложения ПланПро Electron.
 * Координирует жизненный цикл и взаимодействие компонентов.
 * Соблюдает SOLID и ограничение в 200 строк через делегирование в хендлеры.
 */
export class PlanProApp {
  private readonly windowManager: WindowManager;
  private readonly javaBridge: JavaBridgeService;
  private readonly config: ConfigService;
  private readonly bootstrapper: AppBootstrapper;

  constructor() {
    this.config = new ConfigService();
    this.windowManager = new WindowManager(this.config);
    this.javaBridge = new JavaBridgeService(this.config);
    this.bootstrapper = new AppBootstrapper(this.javaBridge, this.windowManager);
    
    this.registerIpcHandlers();
    this.initializeEventHandlers();
    this.setupJavaBridgeEventListeners();
  }

  private registerIpcHandlers(): void {
    PreferencesIpcHandler.register();
    JavaIpcHandler.register(this.javaBridge);
    SystemIpcHandler.register();
  }

  private initializeEventHandlers(): void {
    this.bootstrapper.bootstrap().then(() => this.onReady());
    
    app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());
    app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && this.windowManager.createMainWindow());
    app.on('before-quit', (e) => this.handleBeforeQuit(e));
    
    process.on('SIGTERM', () => app.quit());
    process.on('SIGINT', () => app.quit());
  }

  private onReady(): void {
    try {
      SecurityPolicyManager.configureSecurityHeaders();
      Menu.setApplicationMenu(null);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private async handleBeforeQuit(event: Electron.Event): Promise<void> {
    if (this.javaBridge.isRunning()) {
      event.preventDefault();
      try {
        await this.javaBridge.shutdown(5000);
      } finally {
        app.exit(0);
      }
    }
  }

  private setupJavaBridgeEventListeners(): void {
    const events = [
      { ev: 'javaProcessStarted', ch: IpcChannels.JAVA_PROCESS_STARTED },
      { ev: 'javaProcessStopped', ch: IpcChannels.JAVA_PROCESS_STOPPED },
      { ev: 'statusChange', ch: IpcChannels.JAVA_STATUS_CHANGE },
      { ev: 'javaProcessError', ch: IpcChannels.JAVA_PROCESS_ERROR },
      { ev: 'javaErrorDetails', ch: IpcChannels.JAVA_ERROR_DETAILS }
    ];

    events.forEach(({ ev, ch }) => {
      this.javaBridge.on(ev as any, (data: any) => {
        const win = this.windowManager.getMainWindow();
        if (win && !win.isDestroyed()) win.webContents.send(ch, data);
      });
    });
  }

  private handleError(error: Error): void {
    console.error('[ПланПро] Critical error:', error);
    dialog.showErrorBox('Ошибка ПланПро', `Произошла непредвиденная ошибка: ${error.message}`);
  }
}
