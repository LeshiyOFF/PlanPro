import { BrowserWindow } from 'electron';
import { join } from 'path';
import { IConfigService } from './interfaces/IConfigService';

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
   * Создание и отображение окна заставки
   */
  public createSplash(): BrowserWindow {
    this.splashWindow = new BrowserWindow({
      width: 500,
      height: 350,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      center: true,
      show: false, // Покажем после загрузки контента
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    // Загрузка локального HTML файла заставки
    // Если его нет, создадим минимальную строку Data URL
    const splashHtml = this.getSplashContent();
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
   * Генерация HTML контента для заставки (временно, пока нет файла)
   */
  private getSplashContent(): string {
    return `
      <style>
        body { 
          margin: 0; padding: 0; height: 100vh; overflow: hidden;
          background: #141414; color: white; font-family: sans-serif;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          border-radius: 12px; border: 1px solid #333;
        }
        .loader { 
          border: 4px solid #333; border-top: 4px solid #004d40;
          border-radius: 50%; width: 40px; height: 40px; 
          animation: spin 1s linear infinite; margin-bottom: 20px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        h2 { margin: 0; color: #004d40; }
        p { opacity: 0.7; font-size: 14px; }
      </style>
      <body>
        <div class="loader"></div>
        <h2>ПланПро</h2>
        <p id="status">Инициализация Java Backend...</p>
        <script>
          const { ipcRenderer } = window.electron || {};
          if(ipcRenderer) {
            ipcRenderer.on('bootstrap-status-change', (_, status) => {
              document.getElementById('status').innerText = 'Status: ' + status;
            });
          }
        </script>
      </body>
    `;
  }
}

