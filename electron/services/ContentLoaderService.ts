import { app, BrowserWindow, dialog } from 'electron';
import { join } from 'path';
import * as fs from 'fs';
import { IConfigService } from './interfaces/IConfigService';

/**
 * Сервис интеллектуальной загрузки контента.
 * Управляет переключением между Dev-сервером и Prod-файлами.
 * Соответствует SOLID: Single Responsibility Principle.
 */
export class ContentLoaderService {
  private readonly config: IConfigService;

  constructor(config: IConfigService) {
    this.config = config;
  }

  /**
   * Основной метод загрузки контента в окно.
   */
  public async loadContent(window: BrowserWindow): Promise<void> {
    const port = this.config.getJavaApiPort();
    console.log(`[ContentLoader] UI will connect to Java API on port: ${port}`);

    if (this.config.isDevelopment()) {
      await this.loadDevelopmentContent(window, port);
    } else {
      await this.loadProductionContent(window, port);
    }
  }

  /**
   * Загрузка контента в режиме разработки.
   * Включает механизм retry для ожидания старта Vite.
   */
  private async loadDevelopmentContent(window: BrowserWindow, port: number): Promise<void> {
    const DEV_SERVER_URL = `http://localhost:5173?apiPort=${port}`;
    
    try {
      console.log(`[ContentLoader] Attempting to connect to Dev Server: ${DEV_SERVER_URL}`);
      await window.loadURL(DEV_SERVER_URL);
      window.webContents.openDevTools();
    } catch (error) {
      console.warn('[ContentLoader] Dev Server not ready, retrying in 2s...');
      setTimeout(() => this.loadDevelopmentContent(window, port), 2000);
    }
  }

  /**
   * Загрузка контента в режиме Production.
   * Проверяет наличие файла перед загрузкой.
   */
  private async loadProductionContent(window: BrowserWindow, port: number): Promise<void> {
    // В упакованном виде app.getAppPath() указывает на корень ресурсов
    const indexPath = join(app.getAppPath(), 'dist-app', 'index.html');
    const fallbackPath = join(__dirname, '../../index.html');
    
    const targetPath = fs.existsSync(indexPath) ? indexPath : fallbackPath;

    if (!fs.existsSync(targetPath)) {
      this.handleMissingContent(targetPath);
      return;
    }

    try {
      await window.loadFile(targetPath, { query: { apiPort: port.toString() } });
    } catch (error) {
      console.error(`[ContentLoader] Failed to load local file: ${targetPath}`, error);
      this.handleMissingContent(targetPath);
    }
  }

  /**
   * Обработка критической ошибки отсутствия интерфейса.
   */
  private handleMissingContent(path: string): void {
    dialog.showErrorBox(
      'ProjectLibre - UI Error',
      `Critical interface files are missing.\n\nPath: ${path}\n\nPlease reinstall the application.`
    );
    app.quit();
  }
}

