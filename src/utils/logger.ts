/**
 * Система логирования для ProjectLibre
 * Заменяет console.log для production и development
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: string
  data?: unknown
}

class Logger {
  private context: string
  private minLevel: LogLevel

  constructor(context: string = 'App', minLevel: LogLevel = LogLevel.INFO) {
    this.context = context
    this.minLevel = minLevel
  }

  /**
   * Создание экземпляра логера с контекстом
   */
  static create(context: string, minLevel: LogLevel = LogLevel.INFO): Logger {
    return new Logger(context, minLevel)
  }

  /**
   * Логирование уровня DEBUG
   */
  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data)
  }

  /**
   * Логирование уровня INFO
   */
  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data)
  }

  /**
   * Логирование уровня WARN
   */
  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data)
  }

  /**
   * Логирование уровня ERROR
   */
  error(message: string, error?: Error | unknown): void {
    this.log(LogLevel.ERROR, message, error)
  }

  /**
   * Основной метод логирования
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    if (level < this.minLevel) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: this.context,
      data,
    }

    this.output(entry)
  }

  /**
   * Вывод лога в консоль
   */
  private output(entry: LogEntry): void {
    const levelName = LogLevel[entry.level]
    const timestamp = entry.timestamp.toISOString()
    const prefix = `[${timestamp}] [${levelName}] [${entry.context}]`

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.log(prefix, entry.message, entry.data || '')
        break
      case LogLevel.INFO:
        console.log(prefix, entry.message, entry.data || '')
        break
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.data || '')
        break
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.data || '')
        break
    }
  }

  /**
   * Получение уровня логирования из environment
   */
  static getLogLevel(): LogLevel {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
      switch (process.env.NODE_ENV) {
        case 'development':
          return LogLevel.DEBUG
        case 'production':
          return LogLevel.WARN
        default:
          return LogLevel.INFO
      }
    }
    return LogLevel.INFO
  }
}

// Глобальные экземпляры логера
export const logger = Logger.create('ProjectLibre', Logger.getLogLevel())
export const apiLogger = Logger.create('API')
export const uiLogger = Logger.create('UI')
export const perfLogger = Logger.create('Performance')

export { Logger }
