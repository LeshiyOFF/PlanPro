/**
 * Типы для тестов производительности и измерений памяти
 * Используются в gantt-prototype/MemoryTest.ts и PerformanceTest.tsx
 */

/**
 * Результат одного измерения памяти
 */
export interface MemoryMeasurement {
  label: string;
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedJSHeapSizeMB: number;
  totalJSHeapSizeMB: number;
  utilization: number;
}

/**
 * Результат автоматического теста
 */
export interface BenchmarkResult {
  taskCount: number;
  renderTime: number;
  memoryUsage: number;
  visibleTasks: number;
  totalTasks: number;
  scrollFPS: number;
}

/**
 * Сводный отчёт по тестам
 */
export interface BenchmarkReport {
  summary: {
    totalMeasurements: number;
    testDuration: number;
    peakMemoryUsage: number;
    averageMemoryUsage: number;
  };
  measurements: MemoryMeasurement[];
  recommendations: string[];
}
