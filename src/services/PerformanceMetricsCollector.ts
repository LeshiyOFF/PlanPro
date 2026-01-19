import { ReactProfilerService, type ProfilerMetrics, type ComponentProfile } from '@/services/ReactProfilerService';
import { SentryService } from '@/services/SentryService';

/**
 * Интерфейс для собранных метрик
 */
export interface CollectedMetrics {
  timestamp: number;
  sessionDuration: number;
  totalRenders: number;
  averageRenderTime: number;
  maxRenderTime: number;
  slowRenderCount: number;
  memoryUsage?: number;
  componentStats: {
    totalComponents: number;
    slowComponents: ComponentProfile[];
    mostRendered: ComponentProfile[];
  };
  performanceScore: number; // 0-100
}

/**
 * Интерфейс для конфигурации коллектора
 */
export interface MetricsCollectorConfig {
  enabled: boolean;
  collectInterval: number; // ms
  maxHistorySize: number;
  performanceThresholds: {
    renderTime: number; // ms
    memoryUsage: number; // MB
    score: number; // 0-100
  };
}

/**
 * Performance Metrics Collector
 * Следует SOLID принципу Single Responsibility
 */
export class PerformanceMetricsCollector {
  private static instance: PerformanceMetricsCollector;
  private config: MetricsCollectorConfig;
  private sentryService: SentryService;
  private profilerService: ReactProfilerService;
  private metrics: CollectedMetrics[] = [];
  private sessionStartTime: number;
  private collectTimer?: NodeJS.Timeout;

  private constructor(config: MetricsCollectorConfig) {
    this.config = config;
    this.sentryService = SentryService.getInstance();
    this.profilerService = ReactProfilerService.getInstance();
    this.sessionStartTime = Date.now();
  }

  /**
   * Singleton паттерн
   */
  public static getInstance(config?: MetricsCollectorConfig): PerformanceMetricsCollector {
    if (!PerformanceMetricsCollector.instance) {
      const defaultConfig: MetricsCollectorConfig = {
        enabled: true,
        collectInterval: 30000, // 30 секунд
        maxHistorySize: 100,
        performanceThresholds: {
          renderTime: 16, // 60fps
          memoryUsage: 100, // MB
          score: 80, // минимальный балл
        },
      };
      PerformanceMetricsCollector.instance = new PerformanceMetricsCollector(config || defaultConfig);
    }
    return PerformanceMetricsCollector.instance;
  }

  /**
   * Начать сбор метрик
   */
  public start(): void {
    if (!this.config.enabled) {
      return;
    }

    this.collectMetrics(); // Немедленный сбор
    this.collectTimer = setInterval(
      () => this.collectMetrics(),
      this.config.collectInterval
    );
  }

  /**
   * Остановить сбор метрик
   */
  public stop(): void {
    if (this.collectTimer) {
      clearInterval(this.collectTimer);
      this.collectTimer = undefined;
    }
  }

  /**
   * Собрать метрики производительности
   */
  private collectMetrics(): void {
    const now = Date.now();
    const sessionDuration = now - this.sessionStartTime;
    const profilerStats = this.profilerService.getPerformanceStats();
    const componentProfiles = this.profilerService.getComponentProfiles();

    // Расчет памяти
    const memoryUsage = this.getMemoryUsage();

    // Расчет производительности
    const metrics: CollectedMetrics = {
      timestamp: now,
      sessionDuration,
      totalRenders: profilerStats.totalRenders,
      averageRenderTime: profilerStats.averageRenderTime,
      maxRenderTime: profilerStats.maxRenderTime,
      slowRenderCount: profilerStats.slowRenderCount,
      memoryUsage,
      componentStats: {
        totalComponents: componentProfiles.length,
        slowComponents: profilerStats.slowComponents,
        mostRendered: this.profilerService.getMostRenderedComponents(10),
      },
      performanceScore: this.calculatePerformanceScore(profilerStats, memoryUsage),
    };

    this.recordMetrics(metrics);
    this.checkPerformanceThresholds(metrics);
  }

  /**
   * Записать метрики в историю
   */
  private recordMetrics(metrics: CollectedMetrics): void {
    this.metrics.push(metrics);

    // Ограничение размера истории
    const maxSize = this.config.maxHistorySize || 100;
    if (this.metrics.length > maxSize) {
      this.metrics = this.metrics.slice(-maxSize);
    }

    // Отправка в Sentry для critical метрик
    if (metrics.performanceScore < this.config.performanceThresholds.score) {
      this.sentryService.captureMessage(
        `Low performance score: ${metrics.performanceScore}`,
        'warning',
        {
          performanceMetrics: metrics,
          threshold: this.config.performanceThresholds.score,
        }
      );
    }
  }

  /**
   * Получить использование памяти
   */
  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return undefined;
  }

  /**
   * Рассчитать оценку производительности (0-100)
   */
  private calculatePerformanceScore(
    profilerStats: any,
    memoryUsage?: number
  ): number {
    let score = 100;

    // Штраф за медленные рендеры
    const slowRenderRatio = profilerStats.totalRenders > 0
      ? profilerStats.slowRenderCount / profilerStats.totalRenders
      : 0;
    score -= slowRenderRatio * 30;

    // Штраф за медленный средний рендер
    if (profilerStats.averageRenderTime > this.config.performanceThresholds.renderTime) {
      const overThreshold = profilerStats.averageRenderTime - this.config.performanceThresholds.renderTime;
      score -= Math.min(overThreshold / 2, 25);
    }

    // Штраф за использование памяти
    if (memoryUsage && memoryUsage > this.config.performanceThresholds.memoryUsage) {
      const overThreshold = memoryUsage - this.config.performanceThresholds.memoryUsage;
      score -= Math.min(overThreshold / 5, 20);
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Проверить пороги производительности
   */
  private checkPerformanceThresholds(metrics: CollectedMetrics): void {
    const thresholds = this.config.performanceThresholds;

    // Проверка времени рендеринга
    if (metrics.maxRenderTime > thresholds.renderTime * 3) {
      this.sentryService.captureMessage(
        `Very slow render detected: ${metrics.maxRenderTime}ms`,
        'error',
        {
          type: 'performance',
          renderTime: metrics.maxRenderTime,
          threshold: thresholds.renderTime * 3,
        }
      );
    }

    // Проверка использования памяти
    if (metrics.memoryUsage && metrics.memoryUsage > thresholds.memoryUsage * 2) {
      this.sentryService.captureMessage(
        `High memory usage detected: ${metrics.memoryUsage}MB`,
        'warning',
        {
          type: 'performance',
          memoryUsage: metrics.memoryUsage,
          threshold: thresholds.memoryUsage * 2,
        }
      );
    }
  }

  /**
   * Получить все собранные метрики
   */
  public getMetrics(): CollectedMetrics[] {
    return [...this.metrics];
  }

  /**
   * Получить последние метрики
   */
  public getLatestMetrics(): CollectedMetrics | undefined {
    return this.metrics[this.metrics.length - 1];
  }

  /**
   * Получить средний балл производительности
   */
  public getAveragePerformanceScore(): number {
    if (this.metrics.length === 0) return 100;
    
    const totalScore = this.metrics.reduce((sum, m) => sum + m.performanceScore, 0);
    return Math.round(totalScore / this.metrics.length);
  }

  /**
   * Сбросить историю метрик
   */
  public reset(): void {
    this.metrics = [];
    this.sessionStartTime = Date.now();
  }

  /**
   * Обновить конфигурацию
   */
  public updateConfig(config: Partial<MetricsCollectorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Получить конфигурацию
   */
  public getConfig(): MetricsCollectorConfig {
    return { ...this.config };
  }
}
