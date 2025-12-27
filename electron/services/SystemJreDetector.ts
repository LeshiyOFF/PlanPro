import { spawn, execFile } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { JreInfo, JreType } from './interfaces/IJreManager';

const execFileAsync = promisify(execFile);

/**
 * Детектор системной Java Runtime Environment
 * Следует принципу Single Responsibility из SOLID
 */
export class SystemJreDetector {
  private readonly platform: NodeJS.Platform;
  private readonly javaExecutableNames: string[];
  
  constructor() {
    this.platform = process.platform;
    this.javaExecutableNames = this.getJavaExecutableNames();
  }

  /**
   * Получает имена исполняемых файлов Java для текущей платформы
   */
  private getJavaExecutableNames(): string[] {
    switch (this.platform) {
      case 'win32':
        return ['java.exe', 'java.bat', 'java.cmd'];
      case 'darwin':
      case 'linux':
        return ['java'];
      default:
        return ['java'];
    }
  }

  /**
   * Ищет системные установки Java
   */
  async findSystemJavaInstallations(): Promise<JreInfo[]> {
    const searchPaths = this.getSystemJavaSearchPaths();
    const results: JreInfo[] = [];
    
    for (const searchPath of searchPaths) {
      const installations = await this.searchJavaInPath(searchPath);
      results.push(...installations);
    }
    
    return this.deduplicateJreList(results);
  }

  /**
   * Проверяет доступность Java в PATH
   */
  async isJavaInPath(): Promise<boolean> {
    try {
      await execFileAsync('java', ['-version'], { 
        windowsHide: true,
        timeout: 5000 
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Получает путь к Java из PATH
   */
  async getJavaFromPath(): Promise<string | null> {
    try {
      if (this.platform === 'win32') {
        const { stdout } = await execFileAsync('where', ['java'], { timeout: 5000 });
        return stdout ? stdout.split('\n')[0]?.trim() || null : null;
      } else {
        const { stdout } = await execFileAsync('which', ['java'], { timeout: 5000 });
        return stdout.trim();
      }
    } catch {
      return null;
    }
  }

  /**
   * Получает информацию о JRE по пути к исполняемому файлу
   */
  async getJreInfo(javaPath: string): Promise<JreInfo | null> {
    try {
      const version = await this.getJavaVersion(javaPath);
      const homePath = await this.getJavaHome(javaPath);
      const architecture = await this.getJavaArchitecture(javaPath);
      
      return {
        executablePath: javaPath,
        version: version || 'unknown',
        type: JreType.SYSTEM,
        homePath: homePath || path.dirname(javaPath),
        architecture: architecture || 'unknown',
        isValid: await this.validateJavaExecutable(javaPath)
      };
    } catch {
      return null;
    }
  }

  /**
   * Получает версию Java
   */
  async getJavaVersion(javaPath: string): Promise<string | null> {
    return new Promise((resolve) => {
      const child = spawn(javaPath, ['-version'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
        timeout: 5000
      });
      
      let output = '';
      child.stderr.on('data', (data) => {
        output += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          const match = output.match(/version "([^"]+)"/);
          if (match) {
            resolve(match[1] || null);
            return;
          }
        }
        resolve(null);
      });
      
      child.on('error', () => {
        resolve(null);
      });
    });
  }

  /**
   * Получает архитектуру Java
   */
  async getJavaArchitecture(javaPath: string): Promise<string | null> {
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
   * Валидирует исполняемый файл Java
   */
  async validateJavaExecutable(javaPath: string): Promise<boolean> {
    try {
      await execFileAsync(javaPath, ['-version'], { 
        windowsHide: true,
        timeout: 5000 
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Получает пути поиска системной Java
   */
  private getSystemJavaSearchPaths(): string[] {
    const paths: string[] = [];
    
    if (this.platform === 'win32') {
      // Windows пути
      const programFiles = process.env['PROGRAMFILES'] || 'C:\\Program Files';
      const programFilesX86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';
      
      paths.push(
        path.join(programFiles, 'Java'),
        path.join(programFilesX86, 'Java'),
        'C:\\Java',
        'C:\\Program Files\\AdoptOpenJDK',
        'C:\\Program Files\\Eclipse Adoptium'
      );
    } else if (this.platform === 'darwin') {
      // macOS пути
      paths.push(
        '/Library/Java/JavaVirtualMachines',
        '/System/Library/Java/JavaVirtualMachines',
        '/usr/local/opt/openjdk',
        '/opt/homebrew/opt/openjdk'
      );
    } else {
      // Linux пути
      paths.push(
        '/usr/lib/jvm',
        '/usr/lib64/jvm',
        '/usr/local/java',
        '/opt/java',
        '/usr/lib/jvm/default-java'
      );
    }
    
    return paths;
  }

  /**
   * Ищет Java в указанном пути
   */
  private async searchJavaInPath(searchPath: string): Promise<JreInfo[]> {
    const results: JreInfo[] = [];
    
    try {
      if (!fs.existsSync(searchPath)) {
        return results;
      }
      
      const entries = fs.readdirSync(searchPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = path.join(searchPath, entry.name);
          
          // Проверяем наличие Java в поддиректориях
          const javaPath = await this.findJavaExecutable(fullPath);
          if (javaPath) {
            const jreInfo = await this.getJreInfo(javaPath);
            if (jreInfo) {
              results.push(jreInfo);
            }
          }
          
          // Рекурсивный поиск
          const subResults = await this.searchJavaInPath(fullPath);
          results.push(...subResults);
        }
      }
    } catch {
      // Игнорируем ошибки доступа
    }
    
    return results;
  }

  /**
   * Ищет исполняемый файл Java в директории
   */
  private async findJavaExecutable(directory: string): Promise<string | null> {
    const binDir = path.join(directory, 'bin');
    
    if (!fs.existsSync(binDir)) {
      return null;
    }
    
    for (const executableName of this.javaExecutableNames) {
      const executablePath = path.join(binDir, executableName);
      
      if (fs.existsSync(executablePath) && fs.statSync(executablePath).isFile()) {
        return executablePath;
      }
    }
    
    return null;
  }

  /**
   * Получает JAVA_HOME из переменных окружения
   */
  private async getJavaHome(javaPath: string): Promise<string | null> {
    // Сначала проверяем переменные окружения
    const javaHome = process.env['JAVA_HOME'] || process.env['JDK_HOME'] || process.env['JRE_HOME'];
    if (javaHome && fs.existsSync(javaHome)) {
      return javaHome;
    }
    
    // Определяем из пути к исполняемому файлу
    const binDir = path.dirname(javaPath);
    const potentialHome = path.dirname(binDir);
    
    if (fs.existsSync(path.join(potentialHome, 'bin', this.javaExecutableNames[0] || 'java'))) {
      return potentialHome;
    }
    
    return null;
  }

  /**
   * Удаляет дубликаты из списка JRE
   */
  private deduplicateJreList(jreList: JreInfo[]): JreInfo[] {
    const seen = new Set<string>();
    return jreList.filter(jre => {
      const key = `${jre.executablePath}-${jre.version}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}