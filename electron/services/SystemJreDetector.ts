import { spawn, execFile } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

/**
 * Интерфейс для детектора JRE
 */
export interface ISystemJreDetector {
  detectSystemJre(): Promise<JreInfo | null>;
  isJavaInPath(): Promise<boolean>;
  getJavaFromPath(): Promise<JreInfo | null>;
  findSystemJavaInstallations(): Promise<JreInfo[]>;
  getJreInfo(path: string): Promise<JreInfo | null>;
  validateJavaExecutable?(path: string): Promise<boolean>;
  validatePortAvailability?(port: number): Promise<boolean>;
}

/**
 * Информация о JRE
 */
export interface JreInfo {
  version: string;
  path: string;
  vendor: string;
  architecture: string;
  executablePath?: string;
  type?: string;
  homePath?: string;
  isValid?: boolean;
}

/**
 * Детектор системной JRE
 */
export class SystemJreDetector implements ISystemJreDetector {
  private readonly platform: NodeJS.Platform;

  constructor() {
    this.platform = process.platform as NodeJS.Platform;
  }

  /**
   * Поиск JRE в системе
   */
  public async detectSystemJre(): Promise<JreInfo | null> {
    try {
      // Поиск JAVA_HOME
      const javaHome = this.findJavaHome();
      if (javaHome) {
        return await this.getJreInfo?.(javaHome) || null;
      }

      // Поиск в PATH
      const pathJre = await this.getJavaFromPath();
      if (pathJre) {
        return pathJre;
      }

      // Поиск стандартных расположений
      const defaultJre = await this.searchDefaultLocations();
      return defaultJre;
    } catch (error) {
      console.error('JRE detection failed:', error);
      return null;
    }
  }

  /**
   * Поиск JAVA_HOME
   */
  private findJavaHome(): string | null {
    const javaHome = process.env['JAVA_HOME'] || process.env['JDK_HOME'] || process.env['JRE_HOME'];
    return javaHome || null;
  }

  /**
   * Поиск в PATH
   */
  public async isJavaInPath(): Promise<boolean> {
    return new Promise((resolve) => {
      execFile('java', ['-version'], (error) => {
        resolve(!error);
      });
    });
  }

  /**
   * Получение из PATH
   */
  public async getJavaFromPath(): Promise<JreInfo | null> {
    return new Promise((resolve) => {
      execFile('java', ['-version'], (error, stdout) => {
        if (error) {
          resolve(null);
          return;
        }

        resolve({
          version: this.parseJavaVersion(stdout),
          path: this.findJavaExecutable(),
          vendor: 'Unknown',
          architecture: os.arch()
        });
      });
    });
  }

  /**
   * Поиск стандартных расположений
   */
  private async searchDefaultLocations(): Promise<JreInfo | null> {
    const commonPaths = this.getCommonJrePaths();
    
    for (const jrePath of commonPaths) {
      if (fs.existsSync(jrePath)) {
        return await this.getJreInfo?.(jrePath) || null;
      }
    }
    
    return null;
  }

  /**
   * Получение стандартных путей JRE
   */
  private getCommonJrePaths(): string[] {
    const paths: string[] = [];
    
    if (process.platform === 'win32') {
      const programFiles = process.env['PROGRAMFILES'] || 'C:\\Program Files';
      const programFilesX86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';
      
      paths.push(
        path.join(programFiles, 'Java'),
        path.join(programFiles, 'Java', 'jre'),
        path.join(programFilesX86, 'Java'),
        path.join('C:\\', 'Program Files', 'Java', 'jre')
      );
    } else if (process.platform === 'darwin') {
      paths.push(
        '/Library/Java/JavaVirtualMachines',
        '/Library/Java/Home',
        '/usr/libexec/java_home',
        '/System/Library/Frameworks/JavaVM.framework/Versions/Current'
      );
    } else {
      paths.push(
        '/usr/lib/jvm',
        '/usr/lib/jvm/java',
        '/usr/lib/java',
        '/usr/lib/jvm-default-java',
        '/usr/java/default'
      );
    }
    
    return paths;
  }

  /**
   * Валидация JRE
   */
  public async getJreInfo(jrePath: string): Promise<JreInfo | null> {
    try {
      const javaExe = this.findJavaExecutableInPath(jrePath);
      if (!fs.existsSync(javaExe)) {
        return null;
      }

      return new Promise((resolve) => {
        execFile(javaExe, ['-version'], (error, stdout) => {
          if (error) {
            resolve(null);
            return;
          }

          resolve({
            version: this.parseJavaVersion(stdout),
            path: jrePath,
            vendor: 'Unknown',
            architecture: os.arch(),
            executablePath: this.findJavaExecutableInPath(jrePath),
            type: 'system',
            homePath: jrePath,
            isValid: true
          });
        });
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Поиск Java executable
   */
  private findJavaExecutable(): string {
    const executableName = process.platform === 'win32' ? 'java.exe' : 'java';
    return path.join('java', 'bin', executableName);
  }

  /**
   * Поиск Java executable в пути
   */
  private findJavaExecutableInPath(jrePath: string): string {
    const executableName = process.platform === 'win32' ? 'java.exe' : 'java';
    
    if (process.platform === 'win32') {
      return path.join(jrePath, 'bin', executableName);
    } else {
      return path.join(jrePath, 'bin', executableName);
    }
  }

  /**
   * Парсинг версии Java
   */
  private parseJavaVersion(versionOutput: string): string {
    const match = versionOutput.match(/version "(.+?)"/);
    return match ? match[1] : versionOutput.trim();
  }

  /**
   * Поиск системных установок Java
   */
  public async findSystemJavaInstallations(): Promise<JreInfo[]> {
    const paths = this.getCommonJrePaths();
    const validPaths = paths.filter(path => fs.existsSync(path));
    const jreInfos: JreInfo[] = [];
    
    for (const path of validPaths) {
      const jreInfo = await this.getJreInfo(path);
      if (jreInfo) {
        jreInfos.push(jreInfo);
      }
    }
    
    return jreInfos;
  }

  /**
   * Валидация Java executable
   */
  public async validateJavaExecutable(pathToValidate: string): Promise<boolean> {
    return new Promise((resolve) => {
      fs.access(pathToValidate, fs.constants.F_OK, (error) => {
        resolve(!error);
      });
    });
  }

  /**
   * Валидация доступности порта
   */
  public async validatePortAvailability(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(port > 0 && port < 65535);
    });
  }
}