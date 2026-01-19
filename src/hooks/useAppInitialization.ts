import { useEffect, useCallback } from 'react';
import { PerformanceMetricsCollector } from '@/providers/ReactProfilerProvider';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useSentry } from '@/providers/SentryProvider';
import { logger } from '@/utils/logger';
import { RecalculationEngine } from '@/services/RecalculationEngine';
import { useIpcService } from '@/hooks/useIpcService';
import { useAutoSave } from '@/hooks/useAutoSave';

/**
 * Хук для инициализации системных сервисов приложения
 */
export const useAppInitialization = () => {
  const { handleError } = useErrorHandler();
  const { captureError } = useSentry();
  const ipcService = useIpcService();

  // Инициализация автосохранения
  useAutoSave();

  // Инициализация Profiler и Metrics Collector
  useEffect(() => {
    const metricsCollector = PerformanceMetricsCollector.getInstance({
      enabled: process.env.NODE_ENV === 'development',
      collectInterval: 30000,
      performanceThresholds: {
        renderTime: 16,
        memoryUsage: 100,
        score: 80,
      },
    });

    metricsCollector.start();
    return () => metricsCollector.stop();
  }, []);

  // Инициализация движка пересчета и Java событий
  useEffect(() => {
    RecalculationEngine.getInstance();
    
    const initializeJavaEvents = async () => {
      try {
        await ipcService.subscribeToJavaEvents();
        logger.info('Subscribed to Java events via IPC service');
      } catch (error) {
        logger.error('Failed to subscribe to Java events:', error);
      }
    };

    initializeJavaEvents();
  }, [ipcService]);

  const handleGlobalError = useCallback((error: Error, errorInfo: any) => {
    handleError(error, 'App Root');
    captureError(error, {
      component: 'App',
      errorBoundary: true,
      errorInfo,
    });
  }, [handleError, captureError]);

  return { handleGlobalError };
};
