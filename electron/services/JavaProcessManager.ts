/// <reference path="../types/index.d.ts" />

import { EventEmitter } from 'events';
import { JavaLauncher, IJavaLauncher, JavaLaunchOptions, ProcessInfo } from './JavaLauncher';
import { JavaLauncherError } from './JavaLauncherError';
import { ConfigService } from './ConfigService';
import { IConfigService } from './interfaces/IConfigService';
import { JavaProcessValidator } from './JavaProcessValidator';
import { JreInfo, ISystemJreDetector } from './interfaces/CommonTypes';
import { ProcessStatus, ConfigurationInfo, ProcessStatusInfo } from './types/JavaProcessManagerTypes';
import { JreDetectorFactory } from './factories/JreDetectorFactory';
import { LaunchParameterValidator } from './validators/LaunchParameterValidator';
import { ProcessErrorHandler } from './handlers/ProcessErrorHandler';

/**
 * Менеджер Java процесса
 * Следует принципу Single Responsibility из SOLID
 */
export class JavaProcessManager extends EventEmitter {
  private eventEmitter = new EventEmitter();
  private readonly javaLauncher: IJavaLauncher;
  private readonly config: IConfigService;
  private readonly systemJreDetector: ISystemJreDetector;
  private status: ProcessStatus;

  constructor(config: IConfigService, systemJreDetector?: ISystemJreDetector) {
    super();
    this.config = config;
    this.javaLauncher = new JavaLauncher(config as ConfigService);
    this.systemJreDetector = systemJreDetector || JreDetectorFactory.createDefaultJreDetector();
    this.status = {
      running: false,
      port: this.config.getJavaApiPort(),
      pid: null,
      isStarting: false,
      isStopping: false,
      error: null
    };
  }

  /**
   * Запуск Java процесса
   */
  public async start(): Promise<void> {
    if (this.status.running) {
      throw new Error('Java process is already running');
    }

    this.status.isStarting = true;
    this.eventEmitter.emit('status', this.status);

    try {
      // КРИТИЧНО: Резервируем свободный порт перед запуском Java
      console.log('[JavaProcessManager] Resolving available ports...');
      await (this.config as any).resolveAvailablePorts();
      this.status.port = this.config.getJavaApiPort();
      console.log(`[JavaProcessManager] Using port: ${this.status.port}`);

      // Валидация Java файлов перед запуском
      const validation = this.config.validateJavaFiles();
      if (!validation.valid) {
        const error = new Error(validation.error || 'Java files validation failed');
        throw error;
      }

      // Формируем опции запуска в зависимости от режима (dev vs production)
      const launchOptions: JavaLaunchOptions = {
        port: this.status.port,
        // ВАЖНО: Не передаем jvmOptions здесь, так как JavaLauncher.launch()
        // сам добавляет дефолтные аргументы из ConfigService.
        // Передаем только специфичные для этого процесса опции, если они есть.
        jvmOptions: []
      };

      // Проверяем режим через ConfigService
      const configService = this.config as any;
      if (configService.isExecutableJarMode && configService.isExecutableJarMode()) {
        // Production: используем executable JAR
        const jarPath = configService.getExecutableJarPath();
        if (!jarPath) {
          throw new Error('Executable JAR mode enabled but JAR path is null');
        }
        launchOptions.executableJarPath = jarPath;
        console.log(`[JavaProcessManager] Using executable JAR mode: ${jarPath}`);
      } else {
        // Development: используем classpath
        const classpath = this.config.getClasspath();
        const mainClass = this.config.getMainClass();
        
        if (!classpath || !mainClass) {
          throw new Error('Classpath mode requires both classpath and mainClass');
        }
        
        // Валидация реальных путей и классов (только для classpath режима)
        LaunchParameterValidator.validateLaunchParameters(classpath, mainClass);
        
        launchOptions.classpath = classpath;
        launchOptions.mainClass = mainClass;
        console.log(`[JavaProcessManager] Using classpath mode`);
      }
      
      LaunchParameterValidator.validatePorts(this.config.getJavaApiPort(), this.config.getJavaPort());

      const processInfo = await this.javaLauncher.launch(launchOptions);

      this.status.running = true;
      this.status.pid = processInfo.pid;
      this.status.isStarting = false;
      
      this.eventEmitter.emit('started');
      this.eventEmitter.emit('status', this.status);
      
      console.log(`✅ Java process started with PID: ${processInfo.pid}`);
      if (launchOptions.executableJarPath) {
        console.log(`📦 Using executable JAR: ${launchOptions.executableJarPath}`);
      } else {
        console.log(`📋 Using main class: ${launchOptions.mainClass}`);
        console.log(`📁 Using classpath: ${launchOptions.classpath}`);
      }
    } catch (error) {
      this.handleLaunchError(error as Error);
    }
  }

  /**
   * Получение JVM опций через ConfigService
   */
  private getJvmOptions(): string[] {
    return (this.config as ConfigService).getDefaultJvmArgs();
  }

  /**
   * Обработка ошибок запуска с использованием JavaLauncherError
   */
  private handleLaunchError(error: Error): void {
    this.status.isStarting = false;
    this.status.error = error;
    
    this.eventEmitter.emit('status', this.status);
    
    // Расширенная обработка ошибок на основе JavaLauncherError
    ProcessErrorHandler.logLaunchError(error, {
      classpath: this.config.getClasspath(),
      mainClass: this.config.getMainClass()
    });
    
    ProcessErrorHandler.emitEnhancedErrorEvents(error, this.eventEmitter, {
      classpath: this.config.getClasspath(),
      mainClass: this.config.getMainClass()
    });
    
    throw error;
  }

  /**
   * Остановка Java процесса с поддержкой таймаута и гарантированного завершения.
   */
  public async stop(timeoutMs: number = 5000): Promise<void> {
    if (!this.status.running) {
      return;
    }

    this.status.isStopping = true;
    this.emit('status', this.status);

    try {
      if (this.status.pid) {
        await this.javaLauncher.stop(this.status.pid, timeoutMs);
      }
      
      this.status.running = false;
      this.status.pid = null;
      this.status.isStopping = false;
      this.status.error = null;
      
      this.eventEmitter.emit('stopped');
      this.eventEmitter.emit('status', this.status);
      
      console.log(`[JavaProcessManager] Java process (PID: ${this.status.pid}) stopped successfully.`);
    } catch (error) {
      this.status.isStopping = false;
      this.status.error = error as Error;
      
      this.eventEmitter.emit('status', this.status);
      console.error('[JavaProcessManager] Error during process stop:', error);
      throw error;
    }
  }

  /**
   * Получение текущего статуса
   */
  public getStatus(): string {
    if (this.status.isStarting) return 'Starting';
    if (this.status.isStopping) return 'Stopping';
    if (this.status.running) return 'Running';
    if (this.status.error) return 'Error';
    return 'Stopped';
  }

  /**
   * Проверка запущен ли процесс
   */
  public isRunning(): boolean {
    return this.status.running;
  }

  /**
   * Получение PID процесса
   */
  public getPid(): number | null {
    return this.status.pid;
  }

  /**
   * Получение порта
   */
  public getPort(): number {
    return this.status.port;
  }

  /**
   * Получение детальной информации о конфигурации
   */
  public getConfigurationInfo(): ConfigurationInfo {
    return {
      apiPort: this.config.getJavaApiPort(),
      managementPort: this.config.getJavaPort(),
      isDevelopment: this.config.isDevelopment(),
      classpath: this.config.getClasspath(),
      mainClass: this.config.getMainClass(),
      resourcesPath: this.config.getResourcesPath()
    };
  }

  /**
   * Получение информации о запущенном процессе
   */
  public getProcessInfo(): ProcessStatusInfo {
    return {
      status: this.getStatus(),
      pid: this.getPid(),
      port: this.getPort(),
      running: this.isRunning(),
      error: this.status.error?.message || null,
      configuration: this.getConfigurationInfo()
    };
  }

  /**
   * Получение информации об ошибке
   */
  public getError(): Error | null {
    return this.status.error;
  }

  /**
   * Перезапуск процесса
   */
  public async restart(): Promise<void> {
    await this.stop();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.start();
  }

  public on(event: string, listener: (...args: any[]) => void): this {
    this.eventEmitter.on(event, listener);
    return this;
  }

  public emit(event: string, ...args: any[]): boolean {
    return this.eventEmitter.emit(event, ...args);
  }
}