import { useState, useEffect, useCallback } from 'react'
import { ipcService } from '@/services/IpcService'
import type { JsonObject } from '@/types/json-types'
import {
  JavaApiResponseBase,
  JavaApiResponse,
  JavaStatusData,
  JavaCommandArgs,
  JavaCommandResponse,
} from '@/types/ipc'
import { JavaStatusState, type UseIpcServiceReturn } from './useIpcServiceTypes'
import {
  createStartedHandler,
  createStoppedHandler,
  createStatusChangeHandler,
  createErrorHandler,
} from './useJavaEventHandlers'
import type {
  JavaProcessStartedEvent,
  JavaProcessStoppedEvent,
  JavaStatusChangeEvent,
  JavaProcessErrorEvent,
} from '@/types/ipc/JavaProcessEvents'
import { getElectronAPI } from '@/utils/electronAPI'

/**
 * React Hook для работы с IPC сервисом.
 */
export const useIpcService = (): UseIpcServiceReturn => {
  const [javaStatus, setJavaStatus] = useState<JavaStatusState | null>(null)
  const [isJavaEventsSubscribed, setIsJavaEventsSubscribed] = useState(false)

  const startJava = useCallback(async (): Promise<JavaApiResponseBase> => {
    try {
      const result = await ipcService.startJava()
      if (result.success) await refreshJavaStatus()
      else console.error('Failed to start Java:', result.error)
      return result
    } catch (error) {
      console.error('Error starting Java:', error)
      return { success: false, error: (error as Error).message }
    }
  }, [])

  const stopJava = useCallback(async (): Promise<JavaApiResponseBase> => {
    try {
      const result = await ipcService.stopJava()
      if (result.success) await refreshJavaStatus()
      else console.error('Failed to stop Java:', result.error)
      return result
    } catch (error) {
      console.error('Error stopping Java:', error)
      return { success: false, error: (error as Error).message }
    }
  }, [])

  const restartJava = useCallback(async (): Promise<JavaApiResponseBase> => {
    try {
      const result = await ipcService.restartJava()
      if (result.success) await refreshJavaStatus()
      else console.error('Failed to restart Java:', result.error)
      return result
    } catch (error) {
      console.error('Error restarting Java:', error)
      return { success: false, error: (error as Error).message }
    }
  }, [])

  const refreshJavaStatus = useCallback(async (): Promise<
    JavaApiResponse<JavaStatusData>
  > => {
    try {
      const result = await ipcService.getJavaStatus()
      if (result.success && result.data) {
        setJavaStatus({
          running: result.data.running,
          status: result.data.status,
          pid: result.data.pid,
          port: result.data.port,
        })
      }
      return result
    } catch (error) {
      console.error('Error getting Java status:', error)
      return { success: false, error: (error as Error).message }
    }
  }, [])

  const executeJavaCommand = useCallback(
    async (command: string, args: JavaCommandArgs[] = []): Promise<JavaCommandResponse> => {
      try {
        return await ipcService.executeJavaCommand(command, args)
      } catch (error) {
        console.error('Error executing Java command:', error)
        return { success: false, error: (error as Error).message, command, args }
      }
    },
    [],
  )

  const executeJavaApiRequest = useCallback(
    async <T extends JsonObject = JsonObject>(
      command: string,
      args: JavaCommandArgs[] = [],
    ): Promise<JavaApiResponse<T>> => {
      try {
        return await ipcService.executeJavaApiRequest<T>(command, args)
      } catch (error) {
        console.error('Error executing Java API request:', error)
        return { success: false, error: (error as Error).message }
      }
    },
    [],
  )

  const subscribeToJavaEvents = useCallback(async (): Promise<JavaApiResponseBase> => {
    try {
      const result = await ipcService.subscribeToJavaEvents()
      if (result.success) setIsJavaEventsSubscribed(true)
      return result
    } catch (error) {
      console.error('Error subscribing to Java events:', error)
      return { success: false, error: (error as Error).message }
    }
  }, [])

  const unsubscribeFromJavaEvents = useCallback(async (): Promise<JavaApiResponseBase> => {
    try {
      const result = await ipcService.unsubscribeFromJavaEvents()
      if (result.success) setIsJavaEventsSubscribed(false)
      return result
    } catch (error) {
      console.error('Error unsubscribing from Java events:', error)
      return { success: false, error: (error as Error).message }
    }
  }, [])

  useEffect(() => {
    refreshJavaStatus()
  }, [refreshJavaStatus])

  useEffect(() => {
    const api = getElectronAPI()
    if (!api?.onJavaProcessStarted || !api?.onJavaProcessStopped || !api?.onJavaStatusChange || !api?.onJavaProcessError) return

    const unsubscribeStarted = api.onJavaProcessStarted(
      (data: unknown) => createStartedHandler(setJavaStatus)(data as JavaProcessStartedEvent),
    )
    const unsubscribeStopped = api.onJavaProcessStopped(
      (data: unknown) => createStoppedHandler(setJavaStatus)(data as JavaProcessStoppedEvent),
    )
    const unsubscribeStatusChange = api.onJavaStatusChange(
      (data: unknown) => createStatusChangeHandler(setJavaStatus)(data as JavaStatusChangeEvent),
    )
    const unsubscribeError = api.onJavaProcessError(
      (data: unknown) => createErrorHandler()(data as JavaProcessErrorEvent),
    )

    return () => {
      unsubscribeStarted?.()
      unsubscribeStopped?.()
      unsubscribeStatusChange?.()
      unsubscribeError?.()
    }
  }, [])

  return {
    javaStatus,
    isJavaEventsSubscribed,
    startJava,
    stopJava,
    restartJava,
    refreshJavaStatus,
    /** Получение детального статуса Java (то же, что refreshJavaStatus, для совместимости с StatusMonitor/useStatusMonitor) */
    getJavaStatus: refreshJavaStatus,
    executeJavaCommand,
    executeJavaApiRequest,
    subscribeToJavaEvents,
    unsubscribeFromJavaEvents,
    ipcService,
  }
}

export type { UseIpcServiceReturn } from './useIpcServiceTypes'
