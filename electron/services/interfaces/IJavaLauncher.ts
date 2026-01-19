/**
 * Интерфейс для запуска Java процессов
 */
export interface IJavaLauncher {
  launch(options: JavaLaunchOptions): Promise<ProcessInfo>
  stop(pid: number): Promise<void>
}

/**
 * Опции запуска Java процесса
 */
export interface JavaLaunchOptions {
  port: number
  classpath: string
  mainClass: string
  cwd?: string
  env?: Record<string, string>
  timeout?: number
}

/**
 * Информация о процессе
 */
export interface ProcessInfo {
  pid: number
  port: number
  startTime: Date
}