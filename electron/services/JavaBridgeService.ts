import { EventEmitter } from 'events'
import { ConfigService } from './ConfigService'
import { JavaProcessManager } from './JavaProcessManager'
import { JavaApiClient } from './JavaApiClient'

/**
 * Сервис для взаимодействия с Java backend
 * Управляет интеграцией между процессами и API клиентом
 */
export class JavaBridgeService extends EventEmitter {
  private readonly processManager: JavaProcessManager
  private readonly apiClient: JavaApiClient

  constructor(config: ConfigService) {
    super()
    this.processManager = new JavaProcessManager(config)
    this.apiClient = new JavaApiClient(config.getJavaApiPort())
    
    this.setupProcessListeners()
  }

  /**
   * Инициализация сервиса
   */
  public async initialize(): Promise<void> {
    try {
      console.log('Initializing Java Bridge Service...')
      await this.processManager.start()
      console.log('Java Bridge Service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Java Bridge Service:', error)
      throw error
    }
  }

  /**
   * Перезапуск Java процесса
   */
  public async restart(): Promise<void> {
    await this.cleanup()
    await this.initialize()
  }

  /**
   * Остановка Java процесса
   */
  public async stop(): Promise<void> {
    await this.processManager.stop()
  }

  /**
   * Очистка ресурсов
   */
  public async cleanup(): Promise<void> {
    try {
      await this.processManager.stop()
      console.log('Java Bridge Service cleaned up successfully')
    } catch (error) {
      console.error('Failed to cleanup Java Bridge Service:', error)
    }
  }

  /**
   * Получение статуса Java процесса
   */
  public getStatus(): any {
    return this.processManager.getStatus()
  }

  /**
   * Проверка здоровья Java процесса
   */
  public async checkHealth(): Promise<boolean> {
    return await this.processManager.checkHealth()
  }

  /**
   * Получение API клиента
   */
  public getApiClient(): JavaApiClient {
    return this.apiClient
  }

  /**
   * Настройка слушателей событий
   */
  private setupProcessListeners(): void {
    this.processManager.on('started', () => {
      console.log('Java process started event received')
      this.emit('javaProcessStarted')
    })

    this.processManager.on('stopped', () => {
      console.log('Java process stopped event received')
      this.emit('javaProcessStopped')
    })

    this.processManager.on('status', (status) => {
      this.emit('statusChange', status)
    })
  }
}