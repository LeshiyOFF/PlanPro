import { join, dirname } from 'path';
import * as fs from 'fs';
import { JreInfo, JreType } from './interfaces/IJreManager';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/**
 * Сервис для работы с встроенным JRE (Java Runtime Environment)
 * Следует принципу Single Responsibility из SOLID
 */
export class EmbeddedJreService {
  private readonly resourcesPath: string;
  private readonly isDev: boolean;
  private readonly platform: NodeJS.Platform;
  
  constructor() {
    this.isDev = process.env.NODE_ENV === 'development';
    this.platform = process.platform;
    this.resourcesPath = this.getResourcesPath();
  }

  /**
   * Получает путь к ресурсам приложения
   */
  private getResourcesPath(): string {
    if (this.isDev) {
      return join(__dirname, '../../resources');
    }
    return process.resourcesPath || join(process.execPath, '..', 'resources');
  }

  /**
   * Проверяет наличие встроенного JRE
   */
  async isEmbeddedJreAvailable(): Promise<boolean> {
    const javaPath = await this.getEmbeddedJavaPath();
    return javaPath !== null;
  }

  /**
   * Получает путь к встроенному Java
   */
  async getEmbeddedJavaPath(): Promise<string | null> {
    const jrePath = this.getEmbeddedJrePath();
    
    if (!jrePath || !fs.existsSync(jrePath)) {
      return null;
    }
    
    const executableName = this.getJavaExecutableName();
    const javaPath = join(jrePath, 'bin', executableName);
    
    return fs.existsSync(javaPath) ? javaPath : null;
  }

  /**
   * Получает путь к директории встроенного JRE
   */
  private getEmbeddedJrePath(): string | null {
    const possiblePaths = [
      join(this.resourcesPath, 'jre'),
      join(this.resourcesPath, 'java'),
      join(this.resourcesPath, 'runtime'),
      join(this.resourcesPath, 'jvm')
    ];
    
    // Платформо-специфичные пути
    if (this.platform === 'win32') {
      possiblePaths.push(
        join(this.resourcesPath, 'jre', 'win'),
        join(this.resourcesPath, 'java', 'windows')
      );
    } else if (this.platform === 'darwin') {
      possiblePaths.push(
        join(this.resourcesPath, 'jre', 'macos'),
        join(this.resourcesPath, 'java', 'macos'),
        join(this.resourcesPath, 'jre', 'Contents', 'Home')
      );
    } else {
      possiblePaths.push(
        join(this.resourcesPath, 'jre', 'linux'),
        join(this.resourcesPath, 'java', 'linux')
      );
    }
    
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        return path;
      }
    }
    
    return null;
  }

  /**
   * Получает имя исполняемого файла Java для текущей платформы
   */
  private getJavaExecutableName(): string {
    switch (this.platform) {
      case 'win32':
        return 'java.exe';
      case 'darwin':
      case 'linux':
      default:
        return 'java';
    }
  }

  /**
   * Получает информацию о встроенном JRE
   */
  async getEmbeddedJreInfo(): Promise<JreInfo | null> {
    const javaPath = await this.getEmbeddedJavaPath();
    
    if (!javaPath) {
      return null;
    }
    
    try {
      const version = await this.getJavaVersion(javaPath);
      const homePath = dirname(javaPath);
      const architecture = await this.getJavaArchitecture(javaPath);
      
      return {
        executablePath: javaPath,
        version: version || 'unknown',
        type: JreType.EMBEDDED,
        homePath,
        architecture: architecture || 'unknown',
        isValid: await this.validateEmbeddedJre(javaPath)
      };
    } catch {
      return null;
    }
  }

  /**
   * Получает версию Java
   */
  private async getJavaVersion(javaPath: string): Promise<string | null> {
    try {
      const { stderr } = await execFileAsync(javaPath, ['-version'], {
        windowsHide: true,
        timeout: 5000
      });
      
      const match = stderr.match(/version "([^"]+)"/);
      return match && match[1] ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Получает архитектуру Java
   */
  private async getJavaArchitecture(javaPath: string): Promise<string | null> {
    try {
      const { stdout } = await execFileAsync(javaPath, ['-XshowSettings:properties', '-version'], {
        windowsHide: true,
        timeout: 5000
      });
      
      const osArchMatch = stdout.match(/os\.arch\s*=\s*(.+)/i);
      return osArchMatch && osArchMatch[1] ? osArchMatch[1].trim() : null;
    } catch {
      return null;
    }
  }

  /**
   * Валидирует встроенное JRE
   */
  async validateEmbeddedJre(javaPath?: string): Promise<boolean> {
    const pathToValidate = javaPath || await this.getEmbeddedJavaPath();
    
    if (!pathToValidate) {
      return false;
    }
    
    try {
      // Проверяем запуск Java
      await execFileAsync(pathToValidate, ['-version'], {
        windowsHide: true,
        timeout: 5000
      });
      
      // Проверяем наличие необходимых библиотек
      return await this.validateJreLibraries(pathToValidate);
    } catch {
      return false;
    }
  }

  /**
   * Валидирует наличие необходимых библиотек JRE
   */
  private async validateJreLibraries(javaPath: string): Promise<boolean> {
    const jreHome = dirname(dirname(javaPath));
    const libPath = join(jreHome, 'lib');
    
    if (!fs.existsSync(libPath)) {
      return false;
    }
    
    const requiredFiles = this.getRequiredJreFiles();
    
    for (const file of requiredFiles) {
      const filePath = join(libPath, file);
      if (!fs.existsSync(filePath)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Получает список необходимых файлов JRE для текущей платформы
   */
  private getRequiredJreFiles(): string[] {
    if (this.platform === 'win32') {
      return ['rt.jar', 'jsse.jar'];
    } else if (this.platform === 'darwin') {
      return ['rt.jar', 'jsse.jar', 'jce.jar'];
    } else {
      return ['rt.jar', 'jsse.jar', 'jce.jar'];
    }
  }

  /**
   * Создает структуру директорий для встроенного JRE
   */
  async createEmbeddedJreStructure(): Promise<boolean> {
    try {
      const jrePath = join(this.resourcesPath, 'jre');
      const binPath = join(jrePath, 'bin');
      const libPath = join(jrePath, 'lib');
      
      // Создаем директории
      fs.mkdirSync(binPath, { recursive: true });
      fs.mkdirSync(libPath, { recursive: true });
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Проверяет целостность встроенного JRE
   */
  async checkEmbeddedJreIntegrity(): Promise<boolean> {
    const javaPath = await this.getEmbeddedJavaPath();
    
    if (!javaPath) {
      return false;
    }
    
    try {
      // Проверяем основные компоненты
      const isValid = await this.validateEmbeddedJre(javaPath);
      
      if (!isValid) {
        return false;
      }
      
      // Дополнительная проверка - попытка запустить простую команду
      await execFileAsync(javaPath, ['-help'], {
        windowsHide: true,
        timeout: 3000
      });
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Получает размер встроенного JRE в байтах
   */
  async getEmbeddedJreSize(): Promise<number> {
    const jrePath = this.getEmbeddedJrePath();
    
    if (!jrePath || !fs.existsSync(jrePath)) {
      return 0;
    }
    
    return this.calculateDirectorySize(jrePath);
  }

  /**
   * Рекурсивно вычисляет размер директории
   */
  private async calculateDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;
    
    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = join(dirPath, item.name);
        
        if (item.isFile()) {
          const stats = fs.statSync(fullPath);
          totalSize += stats.size;
        } else if (item.isDirectory()) {
          totalSize += await this.calculateDirectorySize(fullPath);
        }
      }
    } catch {
      // Игнорируем ошибки доступа
    }
    
    return totalSize;
  }

  /**
   * Получает информацию о доступном месте на диске
   */
  async getAvailableDiskSpace(): Promise<number> {
    try {
      fs.statSync(this.resourcesPath);
      // В Node.js нет прямого способа получить свободное место, возвращаем 0
      // В реальном приложении можно использовать platform-specific решения
      return 0;
    } catch {
      return 0;
    }
  }
}