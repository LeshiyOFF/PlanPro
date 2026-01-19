import { join, dirname } from 'path';
import { app } from 'electron';
import * as fs from 'fs';
import { IConfigService } from './interfaces/IConfigService';
import { PortValidator } from './PortValidator';

/**
 * Сервис конфигурации приложения
 * Реализует IConfigService, централизуя управление путями и настройками.
 * Соответствует принципу Single Responsibility (SOLID).
 */
export class ConfigService implements IConfigService {
  private readonly isDev: boolean;
  private readonly resourcesPath: string;
  private readonly portValidator: PortValidator;
  
  private apiPort: number = 8080;
  private managementPort: number = 8081;

  constructor() {
    this.isDev = this.detectEnvironment();
    this.resourcesPath = this.resolveResourcesPath();
    this.portValidator = new PortValidator();
  }

  /**
   * Динамическое разрешение свободных портов для Java API.
   * Реализует логику fallback + retry в диапазоне 8080-8083.
   */
  public async resolveAvailablePorts(): Promise<void> {
    const startApiPort = 8080;
    const endApiPort = 8083;

    const freeApiPort = await this.portValidator.findAvailablePort(startApiPort, endApiPort);
    if (!freeApiPort) {
      throw new Error(`Unable to find free API port in range ${startApiPort}-${endApiPort}`);
    }

    this.apiPort = freeApiPort;
    // Management порт всегда следующий за API портом для предсказуемости
    this.managementPort = this.apiPort + 1;

    console.log(`📡 Ports resolved: API=${this.apiPort}, Management=${this.managementPort}`);
  }

  private detectEnvironment(): boolean {
    return process.env.NODE_ENV === 'development' || !app.isPackaged;
  }

  public getJavaApiPort(): number {
    return this.apiPort;
  }

  public getJavaPort(): number {
    return this.managementPort;
  }

  public isDevelopment(): boolean {
    return this.isDev;
  }

  public getResourcesPath(): string {
    return this.resourcesPath;
  }

  /**
   * В production используем executable JAR (java -jar), возвращаем null для classpath.
   * В development используем classpath режим.
   */
  public getClasspath(): string | null {
    return this.isDev ? this.getDevelopmentClasspath() : null;
  }

  /**
   * В production возвращаем null (не используем main class с -jar).
   * В development возвращаем main class для classpath режима.
   */
  public getMainClass(): string | null {
    return this.isDev ? 'com.projectlibre.api.ProjectLibreApiApplication' : null;
  }

  /**
   * Получение пути к исполняемому JAR для production.
   * Spring Boot Maven repackage создает полностью автономный JAR со всеми зависимостями.
   */
  public getExecutableJarPath(): string | null {
    if (this.isDev) {
      return null; // В dev используем classpath
    }

    const searchPaths = [
      join(this.resourcesPath, 'java', 'projectlibre-api-final.jar'),
      join(this.resourcesPath, 'java', 'projectlibre-api-1.0.0.jar'),
      join(this.resourcesPath, 'java', 'lib-runtime', 'projectlibre-api-final.jar'),
      join(this.resourcesPath, 'app.asar.unpacked', 'resources', 'java', 'projectlibre-api-final.jar')
    ];

    for (const jarPath of searchPaths) {
      if (fs.existsSync(jarPath)) {
        console.log(`[ConfigService] Found executable JAR: ${jarPath}`);
        return jarPath;
      }
    }

    throw new Error(`Executable JAR not found in: ${searchPaths.join(', ')}`);
  }

  /**
   * Проверка, используется ли режим executable JAR.
   */
  public isExecutableJarMode(): boolean {
    return !this.isDev;
  }

  public getJrePath(): string {
    const platform = process.platform;
    const platformFolder = platform === 'win32' ? 'win' : (platform === 'darwin' ? 'macos' : 'linux');
    
    const possiblePaths = [
      join(this.resourcesPath, 'jre', platformFolder),
      join(this.resourcesPath, 'java', platformFolder),
      join(this.resourcesPath, 'jre'),
      join(this.resourcesPath, 'java')
    ];

    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        const binName = platform === 'win32' ? 'java.exe' : 'java';
        if (fs.existsSync(join(path, 'bin', binName))) {
          return path;
        }
      }
    }
    
    return '';
  }

  /**
   * Получение оптимизированных JVM аргументов.
   * Реализует Этап 2.5: UTF-8, Headless, лимиты памяти + передача портов.
   */
  public getDefaultJvmArgs(): string[] {
    const args = [
      '-Dfile.encoding=UTF-8',
      '-Dsun.jnu.encoding=UTF-8',
      '-Djava.awt.headless=true',
      '-Dapple.awt.UIElement=true', // Для macOS: не показывать иконку Java в доке
      '-Xms512m',
      '-Xmx2048m',
      '-XX:+UseG1GC', // Современный сборщик мусора
      '-XX:+ExitOnOutOfMemoryError', // Гарантирует падение при критической нехватке памяти
      // Передаем единый порт для Unified API Server
      `-Dserver.port=${this.apiPort}`
    ];

    if (this.isDev) {
      args.push('-Dspring.profiles.active=dev');
    } else {
      args.push('-Dspring.profiles.active=prod');
    }

    return args;
  }

  /**
   * Определение базового пути ресурсов в зависимости от упаковки и структуры dist-app
   */
  private resolveResourcesPath(): string {
    if (this.isDev) {
      return join(__dirname, '../../resources');
    }
    
    // В продакшене (упакованный вид):
    // 1. Прямой доступ через process.resourcesPath (стандарт Electron)
    if (process.resourcesPath && fs.existsSync(join(process.resourcesPath, 'java'))) {
      return process.resourcesPath;
    }

    // 2. Относительный путь от исполняемого файла (fallback)
    const appPath = dirname(app.getPath('exe'));
    const candidatePath = join(appPath, 'resources');
    
    return fs.existsSync(candidatePath) ? candidatePath : appPath;
  }

  /**
   * Валидация наличия Java JAR файлов.
   * В dev: проверяет classpath JAR.
   * В production: проверяет executable JAR.
   */
  public validateJavaFiles(): { valid: boolean; error?: string } {
    if (this.isDev) {
      const classpath = this.getDevelopmentClasspath();
      if (!classpath) {
        return { valid: false, error: 'Development classpath is empty' };
      }
      // Для разработки берем первый JAR из списка
      const firstJar = classpath.split(';')[0];
      if (!fs.existsSync(firstJar)) {
        return { valid: false, error: `Java JAR not found at: ${firstJar}` };
      }
      return { valid: true };
    }

    // Production: проверяем executable JAR
    try {
      const jarPath = this.getExecutableJarPath();
      if (!jarPath) {
        return { valid: false, error: 'Executable JAR path is null' };
      }

      const stats = fs.statSync(jarPath);
      if (!stats.isFile()) {
        return { valid: false, error: `Not a file: ${jarPath}` };
      }
      if (stats.size === 0) {
        return { valid: false, error: `Empty JAR file: ${jarPath}` };
      }
      // Spring Boot JAR обычно > 20MB, если меньше 1MB - подозрительно
      if (stats.size < 1024 * 1024) {
        return { 
          valid: false, 
          error: `JAR file too small (${Math.round(stats.size / 1024)}KB), expected Spring Boot executable JAR` 
        };
      }

      console.log(`[ConfigService] Validated executable JAR: ${jarPath} (${Math.round(stats.size / 1024 / 1024)}MB)`);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: (error as Error).message };
    }
  }

  private getDevelopmentClasspath(): string {
    // В разработке приоритет на API JAR
    const apiPath = join(__dirname, '../../projectlibre-api/target/projectlibre-api-1.0.0.jar');
    const corePath = join(__dirname, '../../projectlibre_build/dist/projectlibre.jar');
    
    const paths = [];
    if (fs.existsSync(apiPath)) paths.push(apiPath);
    if (fs.existsSync(corePath)) paths.push(corePath);
    
    // Добавляем библиотеки из API target
    const libPath = join(__dirname, '../../projectlibre-api/target/lib');
    if (fs.existsSync(libPath)) {
      paths.push(join(libPath, '*'));
    }

    return paths.length > 0 ? paths.join(';') : corePath;
  }

  /**
   * Формирование classpath для production (THIN JAR архитектура).
   *
   * АРХИТЕКТУРА: THIN JAR
   * - projectlibre-api-final.jar содержит только classes (без BOOT-INF/)
   * - Зависимости (spring-*, jackson-*, etc.) лежат в resources/java/lib/ или resources/java/lib-runtime/
   * - Classpath: main-jar.jar;lib-runtime/*;lib/*
   *
   * СТРУКТУРА (electron-builder):
   * - resources/java/lib-runtime/ - основные runtime зависимости
   * - resources/java/lib/ - дополнительные библиотеки
   * - app.asar.unpacked/resources/java/ - fallback при asarUnpack
   *
   * @see docs/architecture/JAVA_LAUNCHER.md#thin-jar-architecture
   */
  private getProductionClasspath(): string {
    // Проверяем несколько возможных расположений JAR (от electron-builder + asarUnpack)
    const libRuntimePath = join(this.resourcesPath, 'java', 'lib-runtime');
    const libPath = join(this.resourcesPath, 'java', 'lib');
    const asarJavaPath = join(this.resourcesPath, 'app.asar.unpacked', 'resources', 'java');

    const libRuntimeExists = fs.existsSync(libRuntimePath);
    const libExists = fs.existsSync(libPath);
    const asarJavaExists = fs.existsSync(asarJavaPath);

    // На Windows разделитель ;, на Unix :
    const separator = process.platform === 'win32' ? ';' : ':';

    const classpathEntries: string[] = [];

    // 1. Main JAR - ищем в lib-runtime (electron-builder) или asarUnpack (fallback)
    let mainJarFound = false;
    const mainJarNames = ['projectlibre-api-final.jar', 'projectlibre-api-1.0.0.jar'];

    // Проверяем в lib-runtime
    for (const jarName of mainJarNames) {
      const jarPath = join(libRuntimePath, jarName);
      if (fs.existsSync(jarPath)) {
        classpathEntries.push(jarPath);
        mainJarFound = true;
        console.log(`[ConfigService] Found main JAR: ${jarPath}`);
        break;
      }
    }

    // Fallback: проверяем в asarUnpack
    if (!mainJarFound) {
      for (const jarName of mainJarNames) {
        const jarPath = join(asarJavaPath, jarName);
        if (fs.existsSync(jarPath)) {
          classpathEntries.push(jarPath);
          mainJarFound = true;
          console.log(`[ConfigService] Found main JAR (asarUnpack): ${jarPath}`);
          break;
        }
      }
    }

    if (!mainJarFound) {
      throw new Error(`Java main JAR not found. Searched in: ${libRuntimePath}, ${asarJavaPath}`);
    }

    // 2. Добавляем зависимости в порядке приоритета (lib-runtime → lib)
    if (libRuntimeExists) {
      classpathEntries.push(join(libRuntimePath, '*'));
    }
    if (libExists) {
      classpathEntries.push(join(libPath, '*'));
    }

    const classpath = classpathEntries.join(separator);
    console.log(`[ConfigService] Production classpath: ${classpath}`);

    return classpath;
  }
}
