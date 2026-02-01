/**
 * Обработчики событий Java процесса для useIpcService.
 */

import {
  JavaProcessStartedEvent,
  JavaProcessStoppedEvent,
  JavaStatusChangeEvent,
  JavaProcessErrorEvent,
} from '@/types/ipc/JavaProcessEvents'
import { JavaStatusState } from './useIpcServiceTypes'

/**
 * Создаёт обработчик события запуска Java
 */
export function createStartedHandler(
  setJavaStatus: (status: JavaStatusState) => void,
): (data: JavaProcessStartedEvent) => void {
  return (data: JavaProcessStartedEvent): void => {
    console.log('Java process started:', data)
    setJavaStatus({
      running: true,
      status: data.status || 'running',
      pid: data.pid,
      port: data.port,
    })
  }
}

/**
 * Создаёт обработчик события остановки Java
 */
export function createStoppedHandler(
  setJavaStatus: (status: JavaStatusState) => void,
): (data: JavaProcessStoppedEvent) => void {
  return (data: JavaProcessStoppedEvent): void => {
    console.log('Java process stopped:', data)
    setJavaStatus({
      running: false,
      status: data.status || 'stopped',
      pid: data.pid,
      port: data.port,
    })
  }
}

/**
 * Создаёт обработчик события изменения статуса Java
 */
export function createStatusChangeHandler(
  setJavaStatus: (status: JavaStatusState) => void,
): (data: JavaStatusChangeEvent) => void {
  return (data: JavaStatusChangeEvent): void => {
    console.log('Java status changed:', data)
    setJavaStatus({
      running: data.running,
      status: data.status,
      pid: data.pid,
      port: data.port,
    })
  }
}

/**
 * Создаёт обработчик события ошибки Java
 */
export function createErrorHandler(): (data: JavaProcessErrorEvent) => void {
  return (data: JavaProcessErrorEvent): void => {
    console.error('Java process error:', data)
  }
}
