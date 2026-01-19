import * as fs from 'fs';
import { join, dirname } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/**
 * Класс для валидации и проверки целостности JRE.
 */
export class JreValidator {
  constructor(private readonly platform: NodeJS.Platform) {}

  /**
   * Валидирует встроенное JRE путем запуска и проверки библиотек.
   */
  public async validate(javaPath: string): Promise<boolean> {
    try {
      await execFileAsync(javaPath, ['-version'], {
        windowsHide: true,
        timeout: 5000
      });
      return await this.validateLibraries(javaPath);
    } catch {
      return false;
    }
  }

  /**
   * Проверяет наличие необходимых библиотек JRE.
   */
  private async validateLibraries(javaPath: string): Promise<boolean> {
    const jreHome = dirname(dirname(javaPath));
    const libPath = join(jreHome, 'lib');
    
    if (!fs.existsSync(libPath)) return false;
    
    const requiredFiles = this.getRequiredFiles();
    return requiredFiles.some(file => fs.existsSync(join(libPath, file)));
  }

  private getRequiredFiles(): string[] {
    // В Java 9+ нет rt.jar, используется файл modules или jrt-fs.jar
    return ['modules', 'jrt-fs.jar', 'rt.jar'];
  }

  /**
   * Получает версию Java через выполнение команды.
   */
  public async getVersion(javaPath: string): Promise<string | null> {
    try {
      const { stderr } = await execFileAsync(javaPath, ['-version'], {
        windowsHide: true,
        timeout: 5000
      });
      const match = stderr.match(/version "([^"]+)"/);
      return match?.[1] || null;
    } catch {
      return null;
    }
  }

  /**
   * Получает архитектуру Java.
   */
  public async getArchitecture(javaPath: string): Promise<string | null> {
    try {
      const { stdout } = await execFileAsync(javaPath, ['-XshowSettings:properties', '-version'], {
        windowsHide: true,
        timeout: 5000
      });
      const match = stdout.match(/os\.arch\s*=\s*(.+)/i);
      return match?.[1]?.trim() || null;
    } catch {
      return null;
    }
  }
}
