

import { EventEmitter } from 'events';
import { ConfigService } from './ConfigService';
import { JavaLauncher, IJavaLauncher, JavaLaunchOptions, ProcessInfo } from './JavaLauncher';
import { JavaProcessManager } from './JavaProcessManager';
import { JavaApiClient } from './JavaApiClient';
import type { JavaBridgeEventPayload } from '../types/JavaBridgeEventPayload';
import type { JavaCommandArgs } from '../types/JavaCommandArgs';
import type { JsonValue } from '../types/JsonValue';

/**
 * Сервис для взаимодействия с Java backend
 * Управляет интеграцией между процессами и API клиентом
 */
export class JavaBridgeService extends EventEmitter {
  private eventEmitter = new EventEmitter();
  private readonly processManager: JavaProcessManager;
  private apiClient: JavaApiClient;
  private readonly config: ConfigService;

  constructor(config: ConfigService) {
    super();
    this.config = config;
    this.processManager = new JavaProcessManager(config);
    this.apiClient = new JavaApiClient(config.getJavaApiPort());
    
    this.setupProcessListeners();
  }

  /**
   * Инициализация сервиса
   */
  public async initialize(): Promise<void> {
    try {
      console.log('[JavaBridgeService] Initializing Java Bridge Service...');
      
      // После start() порт может измениться, обновляем API клиент
      await this.processManager.start();
      
      const actualPort = this.config.getJavaApiPort();
      this.apiClient = new JavaApiClient(actualPort);
      console.log(`[JavaBridgeService] API client reconfigured for port ${actualPort}`);
      
      console.log('[JavaBridgeService] Java Bridge Service initialized successfully');
    } catch (error) {
      console.error('[JavaBridgeService] Failed to initialize Java Bridge Service:', error);
      throw error;
    }
  }

  /**
   * Остановка сервиса и всех связанных ресурсов.
   * Гарантирует завершение Java-процесса перед выходом.
   */
  public async shutdown(timeoutMs: number = 5000): Promise<void> {
    try {
      console.log('[JavaBridgeService] Shutting down Java Bridge Service...');
      await this.processManager.stop(timeoutMs);
      console.log('[JavaBridgeService] Java Bridge Service shut down successfully');
    } catch (error) {
      console.error('[JavaBridgeService] Failed to shutdown Java Bridge Service:', error);
      throw error;
    }
  }

  /**
   * Настройка слушателей событий процесса
   */
  private setupProcessListeners(): void {
    this.eventEmitter.on('started', () => {
      try {
        this.emit('javaProcessStarted', {
          timestamp: new Date().toISOString(),
          status: this.processManager.getStatus()
        });
      } catch (error) {
        console.error('Failed to emit javaProcessStarted event:', error);
      }
    });

    this.eventEmitter.on('stopped', () => {
      try {
        this.emit('javaProcessStopped', {
          timestamp: new Date().toISOString(),
          status: this.processManager.getStatus()
        });
      } catch (error) {
        console.error('Failed to emit javaProcessStopped event:', error);
      }
    });

    this.eventEmitter.on('status', (status) => {
      try {
        this.emit('statusChange', {
          ...status,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to emit statusChange event:', error);
      }
    });

    this.eventEmitter.on('launchError', (errorData) => {
      try {
        this.emit('javaProcessError', {
          ...errorData,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to emit javaProcessError event:', error);
      }
    });

    this.eventEmitter.on('errorDetails', (errorData) => {
      try {
        this.emit('javaErrorDetails', {
          ...errorData,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to emit javaErrorDetails event:', error);
      }
    });
  }

  public on(event: string, listener: (payload?: JavaBridgeEventPayload) => void): this {
    this.eventEmitter.on(event, listener);
    return this;
  }

  public emit(event: string, payload?: JavaBridgeEventPayload): boolean {
    return this.eventEmitter.emit(event, payload);
  }

  /**
   * Получение текущего статуса
   */
  public getStatus(): string {
    return this.processManager.getStatus();
  }

  /**
   * Проверка запущен ли процесс
   */
  public isRunning(): boolean {
    return this.processManager.isRunning();
  }

  /**
   * Получение API клиента
   */
  public getApiClient(): JavaApiClient {
    return this.apiClient;
  }

  /**
   * Выполнение команды через Java API
   */
  public async executeCommand(command: string, args: JavaCommandArgs = []): Promise<JsonValue> {
    try {
      return await this.apiClient.makeRequest(command, args);
    } catch (error) {
      console.error('Command execution failed:', {
        command,
        args,
        error: (error as Error).message
      });
      throw error;
    }
  }

  /**
   * Получение менеджера процессов для прямого доступа
   */
  public getProcessManager(): JavaProcessManager {
    return this.processManager;
  }
}