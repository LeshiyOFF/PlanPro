/**
 * Полезная нагрузка событий Java Bridge (on/emit).
 * Опциональные поля по факту использования в JavaBridgeService и ProcessErrorHandler.
 */
export interface JavaBridgeEventPayload {
  timestamp?: string
  status?: string
  running?: boolean
  port?: number
  pid?: number | null
  isStarting?: boolean
  isStopping?: boolean
  error?: string | Error | null
  code?: string
  context?: string
  suggestions?: string[]
  recoverable?: boolean
  classpath?: string
  mainClass?: string
}
