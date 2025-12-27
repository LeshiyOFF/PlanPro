import { app } from 'electron';
import { join } from 'path';
import { JreManager } from './JreManager';
import { JreType } from './interfaces/IJreManager';

/**
 * Сервис конфигурации приложения
 * Управляет настройками и путями к ресурсам
 * Следует принципу Single Responsibility из SOLID
 */
export class ConfigService {
  private readonly isDev: boolean;
  private readonly resourcesPath: string;
  private readonly userDataPath: string;
  private readonly jreManager: JreManager;

  constructor() {
    this.isDev = process.env.NODE_ENV === 'development';
    this.userDataPath = app.getPath('userData');
    this.resourcesPath = this.getResourcesPath();
    this.jreManager = new JreManager();
  }

  /**
   * Получение пути к ресурсам приложения
   */
  private getResourcesPath(): string {
    if (this.isDev) {
      return join(__dirname, '../../resources');
    }
    return (process as any).resourcesPath || this.resourcesPath;
  }

  /**
   * Получение пути к Java процессу
   */
  public async getJavaExecutablePath(): Promise<string | null> {
    try {
      return await this.jreManager.getJavaExecutablePath();
    } catch {
      return null;
    }
  }

  /**
   * Получение пути к JAR файлу ProjectLibre
   */
  public getProjectLibreJarPath(): string {
    if (this.isDev) {
      // В режиме разработки используем JAR из директории сборки
      return join(__dirname, '../../projectlibre_build/dist/projectlibre.jar');
    }
    
    // В production используем JAR из ресурсов приложения
    return join((process as any).resourcesPath || this.resourcesPath, 'java/projectlibre.jar');
  }

  /**
   * Получение информации о JRE
   */
  public async getJreInfo() {
    try {
      return await this.jreManager.getJreInfo();
    } catch {
      return null;
    }
  }

  /**
   * Получение типа JRE
   */
  public async getJreType(): Promise<JreType> {
    try {
      return await this.jreManager.getJreType();
    } catch {
      return JreType.NONE;
    }
  }

  /**
   * Проверка доступности JRE
   */
  public async isJreAvailable(): Promise<boolean> {
    try {
      return await this.jreManager.isJreAvailable();
    } catch {
      return false;
    }
  }

  /**
   * Получение пути к файлу логов
   */
  public getLogFilePath(): string {
    return join(this.userDataPath, 'logs', 'projectlibre.log');
  }

  /**
   * Получение порта для Java REST API
   */
  public getJavaApiPort(): number {
    return 8080;
  }

  /**
   * Получение URL для фронтенда в режиме разработки
   */
  public getDevServerUrl(): string {
    return 'http://localhost:5173';
  }

  /**
   * Проверка режима разработки
   */
  public isDevelopmentMode(): boolean {
    return this.isDev;
  }

  /**
   * Получение пути к файлу конфигурации
   */
  public getConfigFilePath(): string {
    return join(this.userDataPath, 'config.json');
  }
}