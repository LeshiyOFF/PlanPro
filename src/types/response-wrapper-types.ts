/**
 * Типы для безопасной работы с API и Java сервисами
 */

import type { JsonObject } from '@/types/json-types';

export interface ApiResponse<T = JsonObject> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface DataResponse<T> extends ApiResponse<T> {
  success: true
  data: T
}

export interface ErrorResponse extends ApiResponse {
  success: false
  error: string
}

export interface JavaExecutor {
  execute(command: string, args?: string[]): Promise<ApiResponse>
}

export interface JavaServiceConfig {
  executor: JavaExecutor
  timeout?: number
  retries?: number
}

