import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { WindowManager } from './services/WindowManager';
import { MenuService } from './services/MenuService';
import { JavaBridgeService } from './services/JavaBridgeService';
import { ConfigService } from './services/ConfigService';

/**
 * Основной класс приложения ProjectLibre Electron
 * Реализует SOLID принципы через разделение ответственности
 */
class ProjectLibreApp {
  private windowManager: WindowManager;
  private menuService: MenuService;
  private javaBridge: JavaBridgeService;
  private config: ConfigService;

  constructor() {
    this.config = new ConfigService();
    this.windowManager = new WindowManager(this.config);
    this.menuService = new MenuService();
    this.javaBridge = new JavaBridgeService(this.config);
    
    this.initializeEventHandlers();
  }

  /**
   * Инициализация обработчиков событий приложения
   */
  private initializeEventHandlers(): void {
    app.whenReady().then(() => this.onReady());
    app.on('window-all-closed', () => this.onAllWindowsClosed());
    app.on('activate', () => this.onActivate());
    app.on('before-quit', () => this.onBeforeQuit());
  }

  /**
   * Обработчик готовности приложения
   */
  private async onReady(): Promise<void> {
    try {
      await this.javaBridge.initialize();
      this.windowManager.createMainWindow();
      this.menuService.setupMenu();
      this.setupIpcHandlers();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Обработчик закрытия всех окон
   */
  private onAllWindowsClosed(): void {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  /**
   * Обработчик активации приложения (macOS)
   */
  private onActivate(): void {
    if (BrowserWindow.getAllWindows().length === 0) {
      this.windowManager.createMainWindow();
    }
  }

  /**
   * Обработчик перед выходом из приложения
   */
  private async onBeforeQuit(): Promise<void> {
    await this.javaBridge.cleanup();
  }

  /**
   * Настройка IPC обработчиков
   */
  private setupIpcHandlers(): void {
    ipcMain.handle('java-execute', async (_, command: string, args: string[]) => {
      return await this.javaBridge.getApiClient().makeRequest(command, args);
    });

    ipcMain.handle('get-app-version', () => {
      return app.getVersion();
    });

    ipcMain.handle('show-message-box', async (_, options: Electron.MessageBoxOptions) => {
      return await dialog.showMessageBox(options);
    });

    ipcMain.handle('open-external', async (_, url: string) => {
      await shell.openExternal(url);
    });
  }

  /**
   * Централизованный обработчик ошибок
   */
  private handleError(error: Error): void {
    console.error('Application error:', error);
    this.showErrorMessage(error.message);
    app.quit();
  }

  /**
   * Отображение сообщения об ошибке
   */
  private showErrorMessage(message: string): void {
    if (this.windowManager.hasMainWindow()) {
      dialog.showErrorBox('ProjectLibre Error', message);
    }
  }
}

/**
 * Создание и запуск экземпляра приложения
 */
new ProjectLibreApp();