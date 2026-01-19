import React, { Profiler } from 'react';
import { ReactProfilerService, type ProfilerMetrics, type ProfilerConfig } from '@/services/ReactProfilerService';

interface ReactProfilerProviderProps {
  children: React.ReactNode;
  config?: ProfilerConfig;
  id?: string;
}

/**
 * React Profiler Provider для интеграции с DevTools
 * Следует SOLID принципам:
 * - Single Responsibility: Только обертка для профилирования
 * - Open/Closed: Расширяется через props
 * - Dependency Inversion: Работает через ReactProfilerService
 */
export const ReactProfilerProvider: React.FC<ReactProfilerProviderProps> = ({
  children,
  config,
  id = 'root'
}) => {
  // Инициализация сервиса с конфигурацией
  const profilerService = ReactProfilerService.getInstance(config);

  // Callback для профилирования
  const onRender = profilerService.getProfilerCallback(id);

  // Если профилирование выключено, возвращаем children без обертки
  if (!profilerService.isEnabled()) {
    return <>{children}</>;
  }

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
};

/**
 * HOC для профилирования конкретного компонента
 */
export const withProfiler = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  profilerId?: string
) => {
  const WithProfilerComponent = (props: P) => {
    const id = profilerId || WrappedComponent.name || 'UnknownComponent';
    const profilerService = ReactProfilerService.getInstance();
    const onRender = profilerService.getProfilerCallback(id);

    if (!profilerService.isEnabled()) {
      return <WrappedComponent {...props} />;
    }

    return (
      <Profiler id={id} onRender={onRender}>
        <WrappedComponent {...props} />
      </Profiler>
    );
  };

  WithProfilerComponent.displayName = `withProfiler(${WrappedComponent.displayName || WrappedComponent.name})`;
  return WithProfilerComponent;
};

/**
 * Hook для доступа к профилировщику
 */
export const useProfiler = () => {
  const profilerService = ReactProfilerService.getInstance();

  return {
    /**
     * Получить все метрики
     */
    getMetrics: () => profilerService.getMetrics(),

    /**
     * Получить профили компонентов
     */
    getComponentProfiles: () => profilerService.getComponentProfiles(),

    /**
     * Получить самые медленные компоненты
     */
    getSlowComponents: (limit?: number) => profilerService.getSlowComponents(limit),

    /**
     * Получить компоненты с наибольшим количеством рендеров
     */
    getMostRenderedComponents: (limit?: number) => profilerService.getMostRenderedComponents(limit),

    /**
     * Получить статистику производительности
     */
    getPerformanceStats: () => profilerService.getPerformanceStats(),

    /**
     * Сбросить все метрики
     */
    reset: () => profilerService.reset(),

    /**
     * Включить/выключить профилирование
     */
    setEnabled: (enabled: boolean) => profilerService.setEnabled(enabled),

    /**
     * Проверить включено ли профилирование
     */
    isEnabled: () => profilerService.isEnabled(),
  };
};

// Экспортируем класс для использования в других компонентах
export { ReactProfilerService };
export { PerformanceMetricsCollector } from '@/services/PerformanceMetricsCollector';

