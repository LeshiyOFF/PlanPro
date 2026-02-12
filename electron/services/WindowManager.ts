import { BrowserWindow, shell, app } from 'electron'
import { join } from 'path'
import * as fs from 'fs'
import { IWindowManager } from './interfaces/IWindowManager'
import { IConfigService } from './interfaces/IConfigService'
import { ContentLoaderService } from './ContentLoaderService'
import { UIErrorHandler } from './UIErrorHandler'
import { SplashManager } from './SplashManager'
import { PreferencesStore } from './PreferencesStore'
import * as process from 'process'

const DEFAULT_ACCENT_HEX = '#1F1F1F'

/**
 * Менеджер окон Electron приложения.
 * Реализует логику создания и управления главным окном.
 */
export class WindowManager implements IWindowManager {
  private mainWindow: BrowserWindow | null = null
  private splashManager: SplashManager | null = null
  private readonly configService: IConfigService
  private readonly contentLoader: ContentLoaderService

  constructor(configService: IConfigService) {
    this.configService = configService
    this.contentLoader = new ContentLoaderService(configService)
    this.splashManager = new SplashManager(configService)
  }

  /**
   * Показать splash сразу после app.whenReady (до запуска Java).
   */
  public showSplash(): void {
    const accent = this.getAccentFromPreferences()
    this.splashManager?.createSplash(accent, this.getPreloadPath())
  }

  /**
   * Создание главного окна приложения.
   */
  public createMainWindow(): void {
    if (this.mainWindow) {
      this.mainWindow.focus()
      return
    }

    // 1. Создаем заставку (если ещё не создана — создаём с акцентом из настроек)
    const accent = this.getAccentFromPreferences()
    this.splashManager?.createSplash(accent, this.getPreloadPath())

    // 2. Создаем основное окно (скрытым)
    this.mainWindow = new BrowserWindow({
      ...this.getWindowOptions(),
      show: false 
    })

    // 3. Настраиваем защиту от ошибок
    UIErrorHandler.monitor(this.mainWindow)

    this.configureWindowEvents()
    this.loadContent()

    // 4. Показываем окно после полной готовности
    this.mainWindow.once('ready-to-show', () => {
      this.splashManager?.destroySplash()
      this.mainWindow?.show()
      
      // DevTools: только в режиме разработки (не упакованное приложение)
      if (this.configService.isDevelopment()) {
        this.mainWindow?.webContents.openDevTools({ mode: 'detach' });
      }
    })
  }

  /**
   * Получение экземпляра главного окна.
   */
  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  /**
   * Путь к preload-скрипту (общий для главного окна и splash).
   */
  private getPreloadPath(): string {
    return app.isPackaged
      ? join(app.getAppPath(), 'dist-app/electron/preload.js')
      : join(__dirname, 'preload.js');
  }

  /**
   * Формирование настроек окна.
   */
  private getWindowOptions(): Electron.BrowserWindowConstructorOptions {
    const preloadPath = this.getPreloadPath();
    console.log(`[WindowManager] Using preload path: ${preloadPath}`);
    return {
      width: 1200,
      height: 800,
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      icon: this.getAppIcon(),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: preloadPath
      }
    };
  }

  /**
   * Настройка обработчиков событий окна.
   */
  private configureWindowEvents(): void {
    if (!this.mainWindow) return

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })

    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url)
      return { action: 'deny' }
    })
  }

  /**
   * Загрузка контента (Vite Dev Server или статический файл).
   */
  private loadContent(): void {
    if (!this.mainWindow) return
    this.contentLoader.loadContent(this.mainWindow)
  }

  /**
   * Получение пути к иконке приложения.
   */
  private getAppIcon(): string | undefined {
    const iconFormats: Record<string, string> = {
      win32: 'icon.ico',
      darwin: 'icon.icns',
      linux: 'icon.png'
    }

    const iconFile = iconFormats[process.platform] || 'icon.png'
    const iconPath = join(this.configService.getResourcesPath(), '../assets', iconFile)

    return fs.existsSync(iconPath) ? iconPath : undefined
  }

  /**
   * Чтение акцентного цвета из user_preferences.json (display.accentColor).
   */
  private getAccentFromPreferences(): string {
    try {
      const store = new PreferencesStore()
      const data = store.load()
      if (!data || typeof data !== 'object' || !data.display || typeof data.display !== 'object') {
        return DEFAULT_ACCENT_HEX
      }
      const display = data.display as Record<string, unknown>
      const accent = display.accentColor
      return typeof accent === 'string' && /^#[0-9A-Fa-f]{6}$/.test(accent)
        ? accent
        : DEFAULT_ACCENT_HEX
    } catch {
      return DEFAULT_ACCENT_HEX
    }
  }
}
