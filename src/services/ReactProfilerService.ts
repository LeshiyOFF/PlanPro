import type { Profiler, ProfilerOnRenderCallback } from 'react';

/**
 * Интерфейс для метрик профилирования
 */
export interface ProfilerMetrics {
  id: string;
  phase: 'mount' | 'update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  interactions: string[];
}

/**
 * Интерфейс для конфигурации профилирования
 */
export interface ProfilerConfig {
  enabled: boolean;
  maxSamples?: number;
  samplingRate?: number;
  onMetrics?: (metrics: ProfilerMetrics) => void;
}

/**
 * Интерфейс для компонентного дерева профилирования
 */
export interface ComponentProfile {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  averageRenderTime: number;
  maxRenderTime: number;
  lastRenderTime: number;
}

/**
 * React DevTools Profiler сервис
 * Следует SOLID принципам:
 * - Single Responsibility: Только профилирование React компонентов
 * - Open/Closed: Расширяется через конфигурацию
 * - Dependency Inversion: Работает с интерфейсами метрик
 */
export class ReactProfilerService {
  private static instance: ReactProfilerService;
  private config: ProfilerConfig;
  private metrics: ProfilerMetrics[] = [];
  private componentProfiles: Map<string, ComponentProfile> = new Map();
  private enabled: boolean = false;

  private constructor(config: ProfilerConfig) {
    this.config = config;
    this.enabled = config.enabled;
  }

  /**
   * Singleton паттерн для единственного экземпляра
   */
  public static getInstance(config?: ProfilerConfig): ReactProfilerService {
    if (!ReactProfilerService.instance) {
      const defaultConfig: ProfilerConfig = {
        enabled: true,
        maxSamples: 1000,
        samplingRate: 1.0,
      };
      ReactProfilerService.instance = new ReactProfilerService(config || defaultConfig);
    }
    return ReactProfilerService.instance;
  }

  /**
   * Получить callback для React Profiler
   */
  public getProfilerCallback(id: string): ProfilerOnRenderCallback {
    if (!this.enabled) {
      return () => {};
    }

    return (
      id: string,
      phase: 'mount' | 'update',
      actualDuration: number,
      baseDuration: number,
      startTime: number,
      commitTime: number,
      interactions: any[]
    ) => {
      const metric: ProfilerMetrics = {
        id,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
        interactions: interactions ? interactions.map(i => i.id || i.name) : [],
      };

      this.recordMetric(metric);
      this.updateComponentProfile(id, actualDuration);
      
      // Вызов кастомного обработчика если предоставлен
      if (this.config.onMetrics) {
        this.config.onMetrics(metric);
      }
    };
  }

  /**
   * Записать метрику
   */
  private recordMetric(metric: ProfilerMetrics): void {
    this.metrics.push(metric);

    // Ограничение размера выборки
    const maxSamples = this.config.maxSamples || 1000;
    if (this.metrics.length > maxSamples) {
      this.metrics = this.metrics.slice(-maxSamples);
    }
  }

  /**
   * Обновить профиль компонента
   */
  private updateComponentProfile(componentId: string, renderTime: number): void {
    let profile = this.componentProfiles.get(componentId);
    
    if (!profile) {
      profile = {
        componentName: componentId,
        renderCount: 0,
        totalRenderTime: 0,
        averageRenderTime: 0,
        maxRenderTime: 0,
        lastRenderTime: 0,
      };
      this.componentProfiles.set(componentId, profile);
    }

    profile.renderCount++;
    profile.totalRenderTime += renderTime;
    profile.lastRenderTime = renderTime;
    profile.maxRenderTime = Math.max(profile.maxRenderTime, renderTime);
    profile.averageRenderTime = profile.totalRenderTime / profile.renderCount;
  }

  /**
   * Получить все метрики
   */
  public getMetrics(): ProfilerMetrics[] {
    return [...this.metrics];
  }

  /**
   * Получить профили компонентов
   */
  public getComponentProfiles(): ComponentProfile[] {
    return Array.from(this.componentProfiles.values());
  }

  /**
   * Получить самые медленные компоненты
   */
  public getSlowComponents(limit: number = 10): ComponentProfile[] {
    return this.getComponentProfiles()
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
      .slice(0, limit);
  }

  /**
   * Получить компоненты с наибольшим количеством рендеров
   */
  public getMostRenderedComponents(limit: number = 10): ComponentProfile[] {
    return this.getComponentProfiles()
      .sort((a, b) => b.renderCount - a.renderCount)
      .slice(0, limit);
  }

  /**
   * Получить статистику производительности
   */
  public getPerformanceStats(): {
    totalRenders: number;
    averageRenderTime: number;
    maxRenderTime: number;
    slowRenderCount: number;
    slowComponents: ComponentProfile[];
  } {
    const totalRenders = this.metrics.length;
    const renderTimes = this.metrics.map(m => m.actualDuration);
    const averageRenderTime = totalRenders > 0 
      ? renderTimes.reduce((sum, time) => sum + time, 0) / totalRenders 
      : 0;
    const maxRenderTime = Math.max(...renderTimes, 0);
    const slowRenderCount = renderTimes.filter(time => time > 16).length; // > 16ms
    const slowComponents = this.getSlowComponents();

    return {
      totalRenders,
      averageRenderTime,
      maxRenderTime,
      slowRenderCount,
      slowComponents,
    };
  }

  /**
   * Сбросить все метрики
   */
  public reset(): void {
    this.metrics = [];
    this.componentProfiles.clear();
  }

  /**
   * Включить/выключить профилирование
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.config.enabled = enabled;
  }

  /**
   * Проверить включено ли профилирование
   */
  public isEnabled(): boolean {
    return this.enabled;
  }
}

