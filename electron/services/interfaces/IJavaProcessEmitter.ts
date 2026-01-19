/**
 * Интерфейс для классов, поддерживающих события Java процесса
 */
export interface IJavaProcessEmitter {
  on(event: string, listener: (...args: any[]) => void): IJavaProcessEmitter;
  emit(event: string, ...args: any[]): boolean;
  once(event: string, listener: (...args: any[]) => void): IJavaProcessEmitter;
  off(event: string, listener: (...args: any[]) => void): IJavaProcessEmitter;
  addListener(event: string, listener: (...args: any[]) => void): IJavaProcessEmitter;
  removeListener(event: string, listener: (...args: any[]) => void): IJavaProcessEmitter;
  removeAllListeners(event?: string): IJavaProcessEmitter;
}

/**
 * Интерфейс для статуса процесса
 */
export interface IProcessStatus {
  running: boolean
  port: number
  pid: number | null
  isStarting: boolean
  isStopping: boolean
  error: Error | null
}