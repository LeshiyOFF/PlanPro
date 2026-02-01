import { SentryService } from '@/services/SentryService'
import type { JsonValue } from '@/types/json-types'
import type { JsonValue } from '@/types/json-types'

/**
 * Интерфейс для метрик производительности
 */
interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage?: number;
  networkRequests?: number;
}

/**
 * Интерфейс для транзакции
 */
interface TransactionOptions {
  name: string;
  operation: string;
  tags?: Record<string, string>;
  data?: Record<string, JsonValue>;
}

/** Объект с методами setTag/setData/finish для совместимости с Sentry span/transaction */
interface SentryTransactionLike {
  setTag(key: string, value: string): void;
  setData(key: string, value: unknown): void;
  finish?(status?: string): void;
}

/**
 * Performance monitoring сервис
 * Следует SOLID принципу Single Responsibility
 */
export class PerformanceMonitor {
  private sentryService: SentryService
  private transactions: Map<string, SentryTransactionLike> = new Map()
  private metrics: PerformanceMetrics[] = []

  constructor(sentryService: SentryService) {
    this.sentryService = sentryService
  }

  /**
   * Начать измерение производительности
   */
  public startTransaction(options: TransactionOptions): SentryTransactionLike | undefined {
    const raw = this.sentryService.startTransaction(options.name, options.operation)
    const transaction = raw as SentryTransactionLike | undefined

    if (transaction) {
      this.transactions.set(options.name, transaction)
      if (options.tags) {
        transaction.setTag('component', options.name)
        Object.entries(options.tags).forEach(([key, value]) => {
          transaction.setTag(key, value)
        })
      }
      if (options.data) {
        Object.entries(options.data).forEach(([key, value]) => {
          transaction.setData(key, value)
        })
      }
    }

    return transaction
  }

  /**
   * Завершить транзакцию
   */
  public finishTransaction(name: string, status?: 'ok' | 'cancelled' | 'unknown' | 'internal_error' | 'deadline_exceeded'): void {
    const transaction = this.transactions.get(name)
    if (transaction?.finish) {
      transaction.finish(status)
    }
    this.transactions.delete(name)
  }

  /**
   * Измерить время рендеринга компонента
   */
  public measureRenderTime(componentName: string, renderFn: () => void): number {
    const startTime = performance.now()
    renderFn()
    const endTime = performance.now()
    const renderTime = endTime - startTime

    this.recordMetrics({
      renderTime,
      componentCount: 1,
    })

    if (renderTime > 100) { // Порог для медленного рендера
      this.sentryService.captureMessage(
        `Slow render detected: ${componentName} (${renderTime.toFixed(2)}ms)`,
        'warning',
        {
          component: componentName,
          renderTime,
          threshold: '100ms',
        },
      )
    }

    return renderTime
  }

  /** Chrome/Node: performance.memory (не в стандарте Performance) */
  private static getMemoryInfo(): { usedJSHeapSize: number } | undefined {
    const p = performance as Performance & { memory?: { usedJSHeapSize: number } }
    return p.memory
  }

  /**
   * Измерить использование памяти
   */
  public measureMemoryUsage(): number | null {
    const memory = PerformanceMonitor.getMemoryInfo()
    if (memory) {
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
      this.recordMetrics({
        renderTime: 0,
        componentCount: 0,
        memoryUsage,
      })

      if (memoryUsage > 100) { // Порог для высокого использования памяти
        this.sentryService.captureMessage(
          `High memory usage detected: ${memoryUsage.toFixed(2)}MB`,
          'warning',
          {
            memoryUsage,
            threshold: '100MB',
          },
        )
      }

      return memoryUsage
    }

    return null
  }

  /**
   * Отследить количество сетевых запросов
   */
  public trackNetworkRequests(): void {
    let requestCount = 0

    const originalFetch = window.fetch

    window.fetch = async (...args) => {
      requestCount++
      this.recordMetrics({
        renderTime: 0,
        componentCount: 0,
        networkRequests: requestCount,
      })

      try {
        return await originalFetch.apply(window, args)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        this.sentryService.captureException(err, {
          type: 'network',
          requestCount,
          url: typeof args[0] === 'string' ? args[0] : String(args[0]),
        })
        throw error
      }
    }
  }

  /**
   * Записать метрики
   */
  private recordMetrics(metrics: Partial<PerformanceMetrics>): void {
    this.metrics.push({
      renderTime: 0,
      componentCount: 0,
      ...metrics,
    })

    // Ограничиваем размер массива метрик
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-50)
    }
  }

  /**
   * Получить среднее время рендеринга
   */
  public getAverageRenderTime(): number {
    const renderTimes = this.metrics
      .filter(m => m.renderTime > 0)
      .map(m => m.renderTime)

    if (renderTimes.length === 0) return 0

    return renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length
  }

  /**
   * Получить пиковое использование памяти
   */
  public getPeakMemoryUsage(): number {
    const memoryUsages = this.metrics
      .filter(m => m.memoryUsage !== undefined)
      .map(m => m.memoryUsage!)

    if (memoryUsages.length === 0) return 0

    return Math.max(...memoryUsages)
  }

  /**
   * Сбросить метрики
   */
  public resetMetrics(): void {
    this.metrics = []
  }
}

