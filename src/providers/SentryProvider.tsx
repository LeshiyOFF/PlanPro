import React, { useEffect, ReactNode } from 'react'
import { SentryService } from '@/services/SentryService'
import { PerformanceMonitor } from '@/services/PerformanceMonitor'
import { EnvironmentConfig } from '@/config'

interface SentryProviderProps {
  children: ReactNode;
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };
  tags?: Record<string, string>;
}

/**
 * Провайдер для интеграции Sentry и Performance Monitoring
 * Следует SOLID принципам и Clean Architecture
 */
export const SentryProvider: React.FC<SentryProviderProps> = ({
  children,
  user,
  tags,
}) => {
  let sentryService: SentryService
  let performanceMonitor: PerformanceMonitor

  useEffect(() => {
    try {
      // Инициализация Sentry с конфигурацией из окружения
      const config = EnvironmentConfig.getSentryConfig()
      sentryService = SentryService.getInstance(config)
      sentryService.initialize()

      // Инициализация Performance Monitor
      performanceMonitor = new PerformanceMonitor(sentryService)

      // Установка пользовательского контекста
      if (user) {
        sentryService.setUser(user)
      }

      // Установка глобальных тегов
      const globalTags = {
        ...tags,
        environment: EnvironmentConfig.getEnvironment(),
        application: 'PlanPro',
        version: EnvironmentConfig.getRelease(),
      }

      sentryService.setTags(globalTags)

      // Начать мониторинг производительности
      performanceMonitor.trackNetworkRequests()

      // Установка интервала для мониторинга памяти
      const memoryInterval = setInterval(() => {
        performanceMonitor.measureMemoryUsage()
      }, 30000) // Каждые 30 секунд

      return () => {
        clearInterval(memoryInterval)
      }
    } catch (error) {
      console.error('Failed to initialize Sentry provider:', error)
      return undefined
    }
  }, [])

  // Обновление пользователя при изменении
  useEffect(() => {
    if (sentryService?.isInitialized() && user) {
      sentryService.setUser(user)
    }
  }, [user])

  // Обновление тегов при изменении
  useEffect(() => {
    if (sentryService?.isInitialized() && tags) {
      sentryService.setTags(tags)
    }
  }, [tags])

  return <>{children}</>
}

/**
 * Hook для использования Sentry функциональности
 */
export const useSentry = () => {
  const sentryService = SentryService.getInstance()
  const performanceMonitor = new PerformanceMonitor(sentryService)

  return {
    /**
     * Отправить ошибку в Sentry
     */
    captureError: (error: Error, context?: Record<string, string | number | boolean | null | undefined>) => {
      sentryService.captureException(error, context)
    },

    /**
     * Отправить сообщение в Sentry
     */
    captureMessage: (message: string, level: 'error' | 'warning' | 'info' | 'debug' = 'info') => {
      sentryService.captureMessage(message, level)
    },

    /**
     * Начать транзакцию
     */
    startTransaction: (name: string, operation?: string) => {
      return performanceMonitor.startTransaction({
        name,
        operation: operation || 'custom',
      })
    },

    /**
     * Измерить производительность компонента
     */
    measurePerformance: (componentName: string, callback: () => void) => {
      return performanceMonitor.measureRenderTime(componentName, callback)
    },

    /**
     * Установить пользователя
     */
    setUser: (user: { id?: string; email?: string; username?: string }) => {
      sentryService.setUser(user)
    },

    /**
     * Очистить пользователя
     */
    clearUser: () => {
      sentryService.clearUser()
    },

    /**
     * Установить теги
     */
    setTags: (tags: Record<string, string>) => {
      sentryService.setTags(tags)
    },
  }
}

