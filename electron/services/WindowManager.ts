import { BrowserWindow, screen } from 'electron';
import { join } from 'path';
import { ConfigService } from './ConfigService';

/**
 * Менеджер окон приложения
 * Управляет созданием и конфигурацией окон
 */
export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private readonly config: ConfigService;

  constructor(config: ConfigService) {
    this.config = config;
  }

  /**
   * Создание главного окна приложения
   */
  public createMainWindow(): BrowserWindow {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    const mainWindowConfig: Electron.BrowserWindowConstructorOptions = {
      width: Math.min(1400, width - 100),
      height: Math.min(900, height - 100),
      minWidth: 1024,
      minHeight: 768,
      show: false,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, '../preload.js'),
        webSecurity: true
      },
      icon: this.getAppIconPath(),
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
    };

    this.mainWindow = new BrowserWindow(mainWindowConfig);
    
    this.setupMainWindowEvents();
    this.loadMainWindowContent();

    return this.mainWindow;
  }

  /**
   * Настройка событий главного окна
   */
  private setupMainWindowEvents(): void {
    if (!this.mainWindow) return;

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      this.mainWindow?.focus();
      
      if (this.config.isDevelopmentMode()) {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      require('electron').shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  /**
   * Загрузка содержимого главного окна
   */
  private loadMainWindowContent(): void {
    if (!this.mainWindow) return;

    if (this.config.isDevelopmentMode()) {
      this.mainWindow.loadURL(this.config.getDevServerUrl());
    } else {
      this.mainWindow.loadFile(join(__dirname, '../dist/index.html'));
    }
  }

  /**
   * Получение пути к иконке приложения
   */
  private getAppIconPath(): string | undefined {
    const iconFormats = {
      win32: 'icon.ico',
      darwin: 'icon.icns',
      linux: 'icon.png'
    };

    const iconFile = iconFormats[process.platform as keyof typeof iconFormats];
    if (!iconFile) return undefined;

    return join(__dirname, '../../assets', iconFile);
  }

  /**
   * Получение главного окна
   */
  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  /**
   * Проверка наличия главного окна
   */
  public hasMainWindow(): boolean {
    return this.mainWindow !== null && !this.mainWindow.isDestroyed();
  }

  /**
   * Закрытие главного окна
   */
  public closeMainWindow(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.close();
    }
  }

  /**
   * Фокусировка на главном окне
   */
  public focusMainWindow(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.focus();
    }
  }
}