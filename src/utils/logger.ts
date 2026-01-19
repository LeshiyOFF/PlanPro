export enum LogLevel {
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  component?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createLogEntry(level: LogLevel, message: string, data?: any, component?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      component
    };
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (process.env.NODE_ENV === 'development') {
      const { timestamp, level, message, data, component } = entry;
      const componentPrefix = component ? `[${component}]` : '';
      
      switch (level) {
        case LogLevel.ERROR:
          console.error(`${timestamp} ${componentPrefix} ERROR: ${message}`, data);
          break;
        case LogLevel.WARNING:
          console.warn(`${timestamp} ${componentPrefix} WARNING: ${message}`, data);
          break;
        case LogLevel.INFO:
          console.info(`${timestamp} ${componentPrefix} INFO: ${message}`, data);
          break;
        case LogLevel.DEBUG:
          console.debug(`${timestamp} ${componentPrefix} DEBUG: ${message}`, data);
          break;
      }
    }
  }

  error(message: string, data?: any, component?: string): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, data, component);
    this.addLog(entry);
  }

  warning(message: string, data?: any, component?: string): void {
    const entry = this.createLogEntry(LogLevel.WARNING, message, data, component);
    this.addLog(entry);
  }

  info(message: string, data?: any, component?: string): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, data, component);
    this.addLog(entry);
  }

  debug(message: string, data?: any, component?: string): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, data, component);
    this.addLog(entry);
  }

  dialog(message: string, data?: any, dialogName?: string): void {
    this.info(message, data, dialogName ? `Dialog:${dialogName}` : 'Dialog');
  }

  dialogError(message: string, data?: any, dialogName?: string): void {
    this.error(message, data, dialogName ? `Dialog:${dialogName}` : 'Dialog');
  }

  api(message: string, data?: any): void {
    this.info(message, data, 'API');
  }

  apiError(message: string, data?: any): void {
    this.error(message, data, 'API');
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = Logger.getInstance();
export const apiLogger = logger;

