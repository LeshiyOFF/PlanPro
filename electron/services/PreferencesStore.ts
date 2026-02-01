import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import type { PreferencesData } from '../types/PreferencesData';

/**
 * Класс для надежного хранения настроек в файловой системе.
 * Реализует атомарную запись для предотвращения повреждения данных.
 * Соответствует SOLID: Single Responsibility Principle.
 */
export class PreferencesStore {
  private readonly configPath: string;
  private readonly tempPath: string;

  constructor() {
    // Храним настройки в стандартной папке данных приложения
    const userDataPath = app.getPath('userData');
    this.configPath = path.join(userDataPath, 'user_preferences.json');
    this.tempPath = this.configPath + '.tmp';
    
    this.ensureDirectoryExists(userDataPath);
  }

  /**
   * Сохранение данных в JSON файл (атомарно)
   */
  public save(data: PreferencesData): void {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      
      // Шаг 1: Записываем во временный файл
      fs.writeFileSync(this.tempPath, jsonContent, 'utf8');
      
      // Шаг 2: Переименовываем временный файл в основной (атомарная операция в ОС)
      // Это гарантирует, что если питание отключится в момент записи, 
      // основной файл либо останется старым, либо будет полностью новым, но не пустым.
      fs.renameSync(this.tempPath, this.configPath);
    } catch (error) {
      console.error('[PreferencesStore] Failed to save preferences:', error);
      throw new Error(`Failed to save preferences: ${(error as Error).message}`);
    }
  }

  /**
   * Загрузка данных из JSON файла
   */
  public load(): PreferencesData | null {
    try {
      if (!fs.existsSync(this.configPath)) {
        return null;
      }
      
      const content = fs.readFileSync(this.configPath, 'utf8');
      if (!content || content.trim() === '') {
        return null;
      }
      
      return JSON.parse(content);
    } catch (error) {
      console.error('[PreferencesStore] Failed to load preferences:', error);
      // Если файл поврежден, пробуем загрузить из бэкапа или возвращаем null
      return null;
    }
  }

  /**
   * Проверка существования директории
   */
  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
