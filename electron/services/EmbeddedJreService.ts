import { join, dirname } from 'path';
import * as fs from 'fs';
import { JreInfo } from './interfaces/CommonTypes';
import { JrePathResolver } from './JrePathResolver';
import { JreValidator } from './JreValidator';

/**
 * Сервис для работы с встроенным JRE (Java Runtime Environment)
 * Следует принципам SOLID и Clean Architecture.
 * Делегирует поиск путей JrePathResolver и валидацию JreValidator.
 */
export class EmbeddedJreService {
  private readonly resourcesPath: string;
  private readonly platform: NodeJS.Platform;
  private readonly pathResolver: JrePathResolver;
  private readonly validator: JreValidator;
  
  constructor() {
    const isDev = process.env.NODE_ENV === 'development';
    this.platform = process.platform;
    this.resourcesPath = isDev 
      ? join(__dirname, '../../resources')
      : process.resourcesPath || join(process.execPath, '..', 'resources');
    
    this.pathResolver = new JrePathResolver(this.resourcesPath, this.platform);
    this.validator = new JreValidator(this.platform);
  }

  async isEmbeddedJreAvailable(): Promise<boolean> {
    return (await this.getEmbeddedJavaPath()) !== null;
  }

  async getEmbeddedJavaPath(): Promise<string | null> {
    const jrePath = this.pathResolver.getEmbeddedJrePath();
    if (!jrePath) return null;
    
    const exeName = this.pathResolver.getJavaExecutableName();
    const javaPath = join(jrePath, 'bin', exeName);
    return fs.existsSync(javaPath) ? javaPath : null;
  }

  async getEmbeddedJreInfo(): Promise<JreInfo | null> {
    const javaPath = await this.getEmbeddedJavaPath();
    if (!javaPath) return null;

    try {
      return {
        executablePath: javaPath,
        version: await this.validator.getVersion(javaPath) || '1.8.0',
        path: javaPath,
        vendor: 'Embedded',
        architecture: await this.validator.getArchitecture(javaPath) || 'unknown',
        type: 'embedded',
        homePath: dirname(javaPath),
        isValid: await this.validator.validate(javaPath)
      };
    } catch {
      return null;
    }
  }

  async createEmbeddedJreStructure(): Promise<boolean> {
    try {
      const jrePath = join(this.resourcesPath, 'jre');
      ['bin', 'lib'].forEach(dir => {
        fs.mkdirSync(join(jrePath, dir), { recursive: true });
      });
      return true;
    } catch {
      return false;
    }
  }

  async checkEmbeddedJreIntegrity(): Promise<boolean> {
    const javaPath = await this.getEmbeddedJavaPath();
    return javaPath ? await this.validator.validate(javaPath) : false;
  }

  async getEmbeddedJreSize(): Promise<number> {
    const jrePath = this.pathResolver.getEmbeddedJrePath();
    return jrePath ? this.calculateSize(jrePath) : 0;
  }

  private calculateSize(dirPath: string): number {
    let size = 0;
    try {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        const fullPath = join(dirPath, item);
        const stats = fs.statSync(fullPath);
        size += stats.isDirectory() ? this.calculateSize(fullPath) : stats.size;
      }
    } catch {}
    return size;
  }
}
