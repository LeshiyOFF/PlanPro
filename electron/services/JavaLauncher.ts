import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import { join, dirname } from 'path';
import * as fs from 'fs';
import { platform } from 'os';
import { app } from 'electron';
import { IConfigService } from './interfaces/IConfigService';
import { JavaLauncherError } from './JavaLauncherError';
import { ITerminationStrategy } from './interfaces/ITerminationStrategy';
import { TerminationStrategyFactory } from './factories/TerminationStrategyFactory';

/**
 * Информация о запущенном процессе
 */
export interface ProcessInfo {
  pid: number;
  port: number;
  startTime: Date;
  success: boolean;
  process?: ChildProcess;
}

/**
 * Опции запуска Java процесса.
 * Поддерживает два режима:
 * 1. Classpath mode (dev): classpath + mainClass
 * 2. Executable JAR mode (production): executableJarPath
 */
export interface JavaLaunchOptions {
  port: number;
  classpath?: string | null;
  mainClass?: string | null;
  executableJarPath?: string | null;
  jvmOptions?: string[];
  env?: Record<string, string>;
  timeout?: number;
}

/**
 * Интерфейс лаунчера Java
 */
export interface IJavaLauncher {
  launch(options: JavaLaunchOptions): Promise<ProcessInfo>;
  stop(pid: number, timeoutMs?: number): Promise<void>;
}

/**
 * Сервис запуска Java-процесса
 * Реализует логику спавна JVM с использованием путей из ConfigService.
 * Соответствует SOLID: Single Responsibility.
 */
export class JavaLauncher implements IJavaLauncher {
  private readonly terminationStrategy: ITerminationStrategy;
  private logFilePath: string | null = null;

  constructor(private readonly config: IConfigService) {
    this.terminationStrategy = TerminationStrategyFactory.create();
    this.initializeLogFile();
  }

  /**
   * Инициализация файла логов для Java процесса.
   * В production пишем в userData, в dev - в корень проекта.
   */
  private initializeLogFile(): void {
    try {
      const isDev = this.config.isDevelopment();
      const logDir = isDev 
        ? join(this.config.getResourcesPath(), 'logs')
        : join(app.getPath('userData'), 'logs');
      
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      this.logFilePath = join(logDir, `java-${timestamp}.log`);
      
      const header = `=== ProjectLibre Java Process Log ===\nStarted: ${new Date().toISOString()}\nMode: ${isDev ? 'Development' : 'Production'}\n\n`;
      fs.writeFileSync(this.logFilePath, header, 'utf8');
      
      console.log(`[JavaLauncher] Log file initialized: ${this.logFilePath}`);
    } catch (error) {
      console.error(`[JavaLauncher] Failed to initialize log file:`, error);
      this.logFilePath = null;
    }
  }

  /**
   * Запись в файл логов (неблокирующая).
   */
  private writeToLogFile(message: string): void {
    if (this.logFilePath) {
      try {
        fs.appendFileSync(this.logFilePath, `${message}\n`, 'utf8');
      } catch (error) {
        // Молча игнорируем ошибки записи в лог
      }
    }
  }

  public async launch(options: JavaLaunchOptions): Promise<ProcessInfo> {
    this.validateAppStatus();
    
    const javaExe = this.getJavaExecutablePath();
    const javaDir = join(this.config.getResourcesPath(), 'java');
    
    const spawnOptions: SpawnOptions = {
      cwd: fs.existsSync(javaDir) ? javaDir : this.config.getResourcesPath(),
      env: { ...process.env, ...options.env },
      stdio: 'pipe',
      windowsHide: true,
      shell: false
    };

    // Формируем аргументы в зависимости от режима запуска
    const args: string[] = [
      ...this.config.getDefaultJvmArgs(),
      ...(options.jvmOptions || [])
    ];

    // Режим 1: Executable JAR (production - Spring Boot)
    if (options.executableJarPath) {
      args.push('-jar', options.executableJarPath);
      console.log(`[JavaLauncher] Launch mode: Executable JAR`);
      console.log(`[JavaLauncher] JAR path: ${options.executableJarPath}`);
    }
    // Режим 2: Classpath (development)
    else if (options.classpath && options.mainClass) {
      args.push('-cp', options.classpath, options.mainClass);
      console.log(`[JavaLauncher] Launch mode: Classpath`);
      console.log(`[JavaLauncher] Classpath: ${options.classpath}`);
      console.log(`[JavaLauncher] Main class: ${options.mainClass}`);
    }
    else {
      throw new JavaLauncherError(
        'Invalid launch options: must provide either executableJarPath or (classpath + mainClass)',
        'INVALID_OPTIONS',
        '',
        []
      );
    }

    return new Promise((resolve, reject) => {
      const logLine = (msg: string) => {
        console.log(msg);
        this.writeToLogFile(msg);
      };
      const logError = (msg: string) => {
        console.error(msg);
        this.writeToLogFile(`ERROR: ${msg}`);
      };

      logLine(`[JavaLauncher] Spawning Java process...`);
      logLine(`[JavaLauncher] Executable: ${javaExe}`);
      logLine(`[JavaLauncher] Working directory: ${spawnOptions.cwd}`);
      logLine(`[JavaLauncher] JVM options: ${this.config.getDefaultJvmArgs().join(' ')}`);
      logLine(`[JavaLauncher] Full command: ${javaExe} ${args.join(' ')}`);
      
      const child = spawn(javaExe, args, spawnOptions);

      const logBuffer: string[] = [];
      const MAX_LOG_LINES = 100;

      // Добавляем логирование stdout/stderr для диагностики
      child.stdout?.on('data', (data) => {
        const message = data.toString().trim();
        const logMsg = `[Java stdout] ${message}`;
        console.log(logMsg);
        this.writeToLogFile(logMsg);
        logBuffer.push(`[stdout] ${message}`);
        if (logBuffer.length > MAX_LOG_LINES) logBuffer.shift();
      });
      
      child.stderr?.on('data', (data) => {
        const message = data.toString().trim();
        const logMsg = `[Java stderr] ${message}`;
        console.error(logMsg);
        this.writeToLogFile(logMsg);
        logBuffer.push(`[stderr] ${message}`);
        if (logBuffer.length > MAX_LOG_LINES) logBuffer.shift();
      });

      child.on('close', (code) => {
        const closeMsg = `[JavaLauncher] Process exited with code ${code}`;
        logLine(closeMsg);
        
        if (code !== 0) {
          const crashMsg = `[JavaLauncher] Java process crashed. Last logs:\n${logBuffer.join('\n')}`;
          logError(crashMsg);
          this.writeToLogFile('\n=== Process Crash Dump ===');
          logBuffer.forEach(line => this.writeToLogFile(line));
        }
      });

      child.on('error', (err) => {
        logError(`[JavaLauncher] Spawn error: ${err.message}`);
        this.writeToLogFile(`Stack: ${err.stack || 'N/A'}`);
        reject(new JavaLauncherError(`Failed to spawn Java: ${err.message}`, 'SPAWN_ERROR', err.stack || '', []));
      });

      if (child.pid) {
        logLine(`✅ [JavaLauncher] Java process spawned with PID: ${child.pid}`);
        if (this.logFilePath) {
          logLine(`📋 [JavaLauncher] Log file available at: ${this.logFilePath}`);
        }
        resolve({
          pid: child.pid,
          port: options.port,
          startTime: new Date(),
          success: true,
          process: child
        });
      } else {
        logError(`[JavaLauncher] Failed to get PID from spawned process`);
        reject(new JavaLauncherError('Failed to get PID from spawned process', 'NO_PID', '', []));
      }
    });
  }

  private validateAppStatus(): void {
    if (!app.isReady()) {
      throw new JavaLauncherError('App not ready', 'APP_NOT_READY', '', []);
    }
  }

  private getJavaExecutablePath(): string {
    const jrePath = this.config.getJrePath();
    console.log(`[JavaLauncher] Searching for JRE at: ${jrePath || '(not configured)'}`);
    
    if (!jrePath || jrePath.length === 0) {
      const resourcesPath = this.config.getResourcesPath();
      console.error(`[JavaLauncher] JRE path is empty!`);
      console.error(`[JavaLauncher] Resources path: ${resourcesPath}`);
      console.error(`[JavaLauncher] Expected JRE at: ${join(resourcesPath, 'jre')}`);
      throw new JavaLauncherError('JRE path not found in application bundle', 'JRE_MISSING', '', []);
    }
    
    const exe = platform() === 'win32' ? 'java.exe' : 'java';
    const fullPath = join(jrePath, 'bin', exe);
    
    console.log(`[JavaLauncher] Checking Java executable: ${fullPath}`);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`[JavaLauncher] Java executable does NOT exist!`);
      console.error(`[JavaLauncher] Listing contents of: ${jrePath}`);
      try {
        const contents = fs.readdirSync(jrePath);
        console.error(`[JavaLauncher] JRE directory contains: ${contents.join(', ')}`);
      } catch (e) {
        console.error(`[JavaLauncher] Cannot read JRE directory: ${(e as Error).message}`);
      }
      throw new JavaLauncherError(`Java executable not found at ${fullPath}`, 'EXE_NOT_FOUND', '', []);
    }
    
    console.log(`✅ [JavaLauncher] Java executable found: ${fullPath}`);
    return fullPath;
  }

  /**
   * Остановка процесса с использованием стратегии и мониторингом завершения
   */
  public async stop(pid: number, timeoutMs: number = 5000): Promise<void> {
    console.log(`[JavaLauncher] Initiating termination for PID ${pid}...`);
    
    const terminationResult = await this.terminationStrategy.terminate(pid);
    
    if (!terminationResult.success) {
      console.warn(`[JavaLauncher] Soft termination failed for PID ${pid}: ${terminationResult.error}`);
    }

    return this.waitForProcessExit(pid, timeoutMs);
  }

  /**
   * Ожидание выхода процесса с переходом к Force Kill при таймауте
   */
  private async waitForProcessExit(pid: number, timeoutMs: number): Promise<void> {
    return new Promise((resolve) => {
      const forceKillTimeout = setTimeout(async () => {
        console.warn(`[JavaLauncher] PID ${pid} still active after ${timeoutMs}ms. Forcing...`);
        await this.terminationStrategy.forceKill(pid);
        resolve();
      }, timeoutMs);

      const checkInterval = setInterval(() => {
        if (!this.isProcessAlive(pid)) {
          clearTimeout(forceKillTimeout);
          clearInterval(checkInterval);
          console.log(`[JavaLauncher] Process ${pid} exited.`);
          resolve();
        }
      }, 200);
    });
  }

  /**
   * Проверка жив ли процесс (сигнал 0)
   */
  private isProcessAlive(pid: number): boolean {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }
}
