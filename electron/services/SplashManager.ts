import { BrowserWindow } from 'electron';
import { IConfigService } from './interfaces/IConfigService';

const DEFAULT_ACCENT_HEX = '#1F1F1F';

/**
 * Менеджер Splash-screen (окна загрузки).
 * Отвечает за создание и управление жизненным циклом заставки.
 * Соответствует SOLID: Single Responsibility.
 */
export class SplashManager {
  private splashWindow: BrowserWindow | null = null;
  private readonly config: IConfigService;

  constructor(config: IConfigService) {
    this.config = config;
  }

  /**
   * Создание и отображение окна заставки (идемпотентно).
   * @param accentColorHex — акцентный цвет из настроек (например #1F1F1F)
   * @param preloadPath — путь к preload для приёма bootstrap-status-change
   */
  public createSplash(accentColorHex?: string, preloadPath?: string): BrowserWindow {
    if (this.splashWindow && !this.splashWindow.isDestroyed()) {
      return this.splashWindow;
    }

    const accent = typeof accentColorHex === 'string' && /^#[0-9A-Fa-f]{6}$/.test(accentColorHex)
      ? accentColorHex
      : DEFAULT_ACCENT_HEX;

    const webPrefs: Electron.WebPreferences = {
      nodeIntegration: false,
      contextIsolation: true
    };
    if (typeof preloadPath === 'string' && preloadPath.length > 0) {
      webPrefs.preload = preloadPath;
    }

    this.splashWindow = new BrowserWindow({
      width: 500,
      height: 350,
      frame: false,
      alwaysOnTop: true,
      center: true,
      show: false,
      backgroundColor: '#ffffff',
      webPreferences: webPrefs
    });

    const splashHtml = this.getSplashContent(accent);
    this.splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHtml)}`);

    this.splashWindow.once('ready-to-show', () => {
      this.splashWindow?.show();
    });

    return this.splashWindow;
  }

  /**
   * Закрытие окна заставки
   */
  public destroySplash(): void {
    if (this.splashWindow && !this.splashWindow.isDestroyed()) {
      this.splashWindow.close();
      this.splashWindow = null;
    }
  }

  /**
   * Генерация HTML контента заставки: светлый фон, порядок заголовок → спиннер → этап, акцент из настроек.
   */
  private getSplashContent(accentHex: string): string {
    const accentSafe = accentHex.replace(/"/g, '&quot;');
    return `
      <style>
        body {
          margin: 0; padding: 0; height: 100vh; overflow: hidden;
          background: #ffffff; color: #1e293b; font-family: system-ui, sans-serif;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15);
        }
        h2 { margin: 0 0 24px 0; font-size: 22px; font-weight: 700; color: #0f172a; }
        .loader {
          border: 4px solid #e2e8f0; border-top-color: ${accentSafe};
          border-radius: 50%; width: 44px; height: 44px;
          animation: spin 0.9s linear infinite; margin-bottom: 20px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        #status { margin: 0; font-size: 14px; color: #64748b; }
      </style>
      <body>
        <h2>ПланПро</h2>
        <div class="loader"></div>
        <p id="status">Инициализация...</p>
        <script>
          (function(){
            var el = document.getElementById('status');
            try {
              if (window.electronAPI && typeof window.electronAPI.onBootstrapStatusChange === 'function') {
                window.electronAPI.onBootstrapStatusChange(function(status) {
                  if (el) el.textContent = status === 'STARTING_JAVA' ? 'Запуск ядра...' : status === 'WAITING_FOR_API' ? 'Подготовка системы...' : status === 'READY' ? 'Запуск...' : String(status);
                });
              }
            } catch (e) {}
          })();
        </script>
      </body>
    `;
  }
}

