import { EventEmitter } from 'events'
import { ConfigService } from './ConfigService'
import { JavaLauncher } from './JavaLauncher'
import { JavaProcessValidator } from './JavaProcessValidator'
import { CommandLineTester } from './CommandLineTester'
import { ProcessEventHandler } from './interfaces/IJavaLauncher'

/**
 * Менеджер Java процесса
 * Следует принципу Single Responsibility из SOLID
 * Использует новые сервисы для управления Java процессами
 */
export class JavaProcessManager extends EventEmitter {
  private javaLauncher: JavaLauncher
  private validator: JavaProcessValidator
  private commandLineTester: CommandLineTester
  private config: ConfigService
  private status = {
    running: false,
    port: 8080,
    pid: null as number | null,
    isStarting: false,
    isStopping: false,
    error: null as Error | null
  }

  constructor(config: ConfigService) {
    super()
    this.config = config
    this.javaLauncher = new JavaLauncher()
    this.validator = new JavaProcessValidator()
    this.commandLineTester = new CommandLineTester()
    this.status.port = this.config.getJavaApiPort()
  }

  /**
   * Запуск Java процесса
   */
  async start(): Promise<void> {
    try {
      console.log('Starting Java process...')
      
      const jarPath = this.config.getProjectLibreJarPath()
      console.log('JAR path:', jarPath)
      
      // Валидация конфигурации запуска
      const validation = await this.validator.validateLaunchConfig(jarPath, {
        memory: { min: 512, max: 1024 },
        timeout: 30000,
        env: {
          PROJECTLIBRE_MODE: 'electron',
          SPRING_PROFILES_ACTIVE: 'electron'
        }
      })
      
      if (!validation.isValid) {
        throw new Error(validation.errorMessage || 'Java launch validation failed')
      }
      
      const launchOptions = {
        memory: { min: 512, max: 1024 },
        timeout: 30000,
        redirectOutput: true,
        env: {
          PROJECTLIBRE_MODE: 'electron',
          SPRING_PROFILES_ACTIVE: 'electron'
        },
        jvmOptions: [
          `-Dserver.port=${this.status.port}`,
          '-Dspring.profiles.active=electron'
        ]
      }
      
      this.status.isStarting = true
      this.emit('status', this.status)
      
      const result = await this.javaLauncher.launchJar(jarPath, [
        '--server.port=' + this.status.port,
        '--spring.profiles.active=electron'
      ], launchOptions)
      
      if (!result.success || !result.process) {
        this.status.isStarting = false
        this.status.error = new Error(result.errorMessage || 'Failed to start Java process')
        this.emit('status', this.status)
        throw new Error(result.errorMessage || 'Failed to start Java process')
      }
      
      this.status.pid = result.pid || null
      this.setupProcessHandlers(result.process)
      
      console.log('Java process started successfully with PID:', result.pid)
    } catch (error) {
      this.status.isStarting = false
      this.status.error = error instanceof Error ? error : new Error('Unknown error')
      this.emit('status', this.status)
      throw error
    }
  }

  /**
   * Остановка Java процесса
   */
  async stop(): Promise<void> {
    if (!this.status.pid) {
      return
    }
    
    this.status.isStopping = true
    this.emit('status', this.status)
    
    try {
      // Получаем информацию о процессе для остановки
      const processes = this.javaLauncher.getActiveProcesses()
      const currentProcess = processes.find(p => p.pid === this.status.pid)
      
      if (currentProcess) {
        // Создаем моковый процесс для остановки (в реальной реализации нужно хранить ссылки)
        const mockProcess = { 
          pid: this.status.pid, 
          kill: () => {} 
        } as any
        
        const stopped = await this.javaLauncher.stopProcess(mockProcess, 10000)
        
        if (stopped) {
          this.status.running = false
          this.status.isStopping = false
          this.status.pid = null
          this.emit('stopped')
          this.emit('status', this.status)
        } else {
          throw new Error('Failed to stop Java process gracefully')
        }
      }
    } catch (error) {
      this.status.error = error instanceof Error ? error : new Error('Stop failed')
      this.emit('status', this.status)
      throw error
    }
  }

  /**
   * Получение статуса
   */
  getStatus(): any {
    return { ...this.status }
  }

  /**
   * Проверка доступности Java процесса
   */
  async checkHealth(): Promise<boolean> {
    return this.status.running && this.status.pid !== null
  }

  /**
   * Получение порта
   */
  getPort(): number {
    return this.status.port
  }

  /**
   * Проверка, запущен ли процесс
   */
  isRunning(): boolean {
    return this.status.running
  }

  /**
   * Настройка обработчиков событий процесса
   */
  private setupProcessHandlers(process: any): void {
    if (!process) {
      return
    }

    const eventHandlers: ProcessEventHandler = {
      onStart: (proc) => {
        console.log('Java process started with PID:', proc.pid)
        this.status.running = true
        this.status.isStarting = false
        this.emit('started')
        this.emit('status', this.status)
      },
      onStop: (code, signal) => {
        console.log(`Java process stopped with code ${code}, signal ${signal}`)
        this.status.running = false
        this.status.isStarting = false
        this.status.isStopping = false
        this.status.pid = null
        this.emit('stopped')
        this.emit('status', this.status)
      },
      onError: (error) => {
        console.error('Java process error:', error)
        this.status.isStarting = false
        this.status.error = error
        this.emit('status', this.status)
      },
      onOutput: (data, type) => {
        if (type === 'stdout') {
          console.log(`Java stdout: ${data}`)
        } else {
          console.log(`Java stderr: ${data}`)
        }
      }
    }

    // Устанавливаем обработчики через JavaLauncher
    this.javaLauncher.launchWithConfig({
      javaPath: '', // Будет определен в JavaLauncher
      jarPath: this.config.getProjectLibreJarPath()
    }, eventHandlers)
  }

  /**
   * Запуск командной строки тестирования
   */
  async runCommandLineTest(): Promise<void> {
    try {
      console.log('Running command line Java test...')
      
      const testResult = await this.commandLineTester.runFullCommandLineTest({
        jarPath: this.config.getProjectLibreJarPath(),
        testSystemJava: true,
        testEmbeddedJre: true,
        verbose: true,
        testTimeout: 15000
      })
      
      console.log('Command line test completed:', testResult)
      
      if (testResult.success) {
        this.emit('test-completed', testResult)
      } else {
        this.emit('test-failed', testResult)
      }
      
      const report = this.commandLineTester.generateTestReport(testResult)
      console.log('Test Report:\n', report)
      
    } catch (error) {
      console.error('Command line test failed:', error)
      this.emit('test-failed', error)
    }
  }

  /**
   * Получение информации о JRE
   */
  async getJreInfo(): Promise<any> {
    return await this.config.getJreInfo()
  }

  /**
   * Проверка доступности JRE
   */
  async isJreAvailable(): Promise<boolean> {
    return await this.config.isJreAvailable()
  }
}