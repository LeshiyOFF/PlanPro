import { join } from 'path';
import * as fs from 'fs';

/**
 * Класс для разрешения путей к JRE на разных платформах.
 * Реализует логику поиска встроенного JRE.
 */
export class JrePathResolver {
  constructor(
    private readonly resourcesPath: string,
    private readonly platform: NodeJS.Platform
  ) {}

  /**
   * Получает имя исполняемого файла Java для текущей платформы
   */
  public getJavaExecutableName(): string {
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
   * Получает путь к директории встроенного JRE
   */
  public getEmbeddedJrePath(): string | null {
    const platformPaths = this.getPlatformSpecificPaths();
    const genericPaths = this.getGenericPaths();
    const allPaths = [...platformPaths, ...genericPaths];
    
    for (const path of allPaths) {
      if (fs.existsSync(path)) {
        const exeName = this.getJavaExecutableName();
        if (fs.existsSync(join(path, 'bin', exeName))) {
          return path;
        }
      }
    }
    return null;
  }

  private getPlatformSpecificPaths(): string[] {
    if (this.platform === 'win32') {
      return [
        join(this.resourcesPath, 'jre', 'win'),
        join(this.resourcesPath, 'java', 'windows')
      ];
    } else if (this.platform === 'darwin') {
      return [
        join(this.resourcesPath, 'jre', 'macos'),
        join(this.resourcesPath, 'java', 'macos'),
        join(this.resourcesPath, 'jre', 'Contents', 'Home')
      ];
    } else {
      return [
        join(this.resourcesPath, 'jre', 'linux'),
        join(this.resourcesPath, 'java', 'linux')
      ];
    }
  }

  private getGenericPaths(): string[] {
    return [
      join(this.resourcesPath, 'jre'),
      join(this.resourcesPath, 'java'),
      join(this.resourcesPath, 'runtime'),
      join(this.resourcesPath, 'jvm')
    ];
  }
}
