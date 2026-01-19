/**
 * Типы для JavaProcessManager
 */

/**
 * Тип статуса процесса
 */
export interface ProcessStatus {
  running: boolean;
  port: number;
  pid: number | null;
  isStarting: boolean;
  isStopping: boolean;
  error: Error | null;
}

/**
 * Информация о конфигурации
 */
export interface ConfigurationInfo {
  apiPort: number;
  managementPort: number;
  isDevelopment: boolean;
  classpath: string;
  mainClass: string;
  resourcesPath: string;
}

/**
 * Информация о статусе процесса
 */
export interface ProcessStatusInfo {
  status: string;
  pid: number | null;
  port: number;
  running: boolean;
  error: string | null;
  configuration: ConfigurationInfo;
}