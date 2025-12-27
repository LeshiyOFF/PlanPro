import { GanttTask } from './GanttPrototype';

export class MemoryTest {
  private measurements: any[] = [];
  private startTime: number = 0;

  startTest() {
    this.startTime = performance.now();
    this.measurements = [];
    console.log('Memory test started');
    this.takeMeasurement('initial');
  }

  takeMeasurement(label: string) {
    const memoryInfo = (performance as any).memory;
    if (!memoryInfo) {
      console.warn('Memory API not available');
      return;
    }

    const measurement = {
      label,
      timestamp: performance.now() - this.startTime,
      usedJSHeapSize: memoryInfo.usedJSHeapSize,
      totalJSHeapSize: memoryInfo.totalJSHeapSize,
      jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
      usedJSHeapSizeMB: memoryInfo.usedJSHeapSize / 1024 / 1024,
      totalJSHeapSizeMB: memoryInfo.totalJSHeapSize / 1024 / 1024
    };

    this.measurements.push(measurement);
    console.log(`Memory measurement [${label}]:`, {
      used: `${measurement.usedJSHeapSizeMB.toFixed(2)}MB`,
      total: `${measurement.totalJSHeapSizeMB.toFixed(2)}MB`,
      utilization: `${((measurement.usedJSHeapSize / measurement.totalJSHeapSize) * 100).toFixed(1)}%`
    });
  }

  calculateTaskMemoryFootprint(tasks: GanttTask[]): number {
    // Расчет примерного потребления памяти на одну задачу
    const taskString = JSON.stringify(tasks[0]);
    const taskSizeBytes = new Blob([taskString]).size;
    return taskSizeBytes / 1024; // KB per task
  }

  simulateMemoryGrowth(taskCounts: number[]) {
    console.log('=== Memory Growth Simulation ===');
    
    taskCounts.forEach(count => {
      const memoryPerTask = this.calculateTaskMemoryFootprint(this.generateTestTasks(1));
      const estimatedMemory = (count * memoryPerTask) / 1024; // MB
      
      console.log(`${count} tasks: ~${estimatedMemory.toFixed(2)}MB (raw data)`);
    });
  }

  generateTestTasks(count: number): GanttTask[] {
    const tasks: GanttTask[] = [];
    const startDate = new Date(2024, 0, 1);
    
    for (let i = 0; i < count; i++) {
      const taskStart = new Date(startDate);
      taskStart.setDate(startDate.getDate() + Math.floor(i * 0.5));
      
      const taskEnd = new Date(taskStart);
      taskEnd.setDate(taskStart.getDate() + Math.floor(Math.random() * 20) + 5);
      
      tasks.push({
        id: `task-${i}`,
        name: `Task ${i + 1}`,
        start: taskStart.toISOString().split('T')[0],
        end: taskEnd.toISOString().split('T')[0],
        progress: Math.floor(Math.random() * 100),
        dependencies: i > 0 && Math.random() > 0.7 ? [`task-${Math.floor(Math.random() * i)}`] : undefined,
        assignee: `User ${(i % 10) + 1}`,
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        critical: Math.random() > 0.9
      });
    }
    
    return tasks;
  }

  analyzeMemoryLeaks() {
    if (this.measurements.length < 2) {
      console.warn('Insufficient measurements for leak analysis');
      return;
    }

    const initial = this.measurements[0];
    const final = this.measurements[this.measurements.length - 1];
    
    const memoryGrowth = final.usedJSHeapSize - initial.usedJSHeapSize;
    const memoryGrowthMB = memoryGrowth / 1024 / 1024;
    
    console.log('=== Memory Leak Analysis ===');
    console.log(`Initial memory: ${initial.usedJSHeapSizeMB.toFixed(2)}MB`);
    console.log(`Final memory: ${final.usedJSHeapSizeMB.toFixed(2)}MB`);
    console.log(`Memory growth: ${memoryGrowthMB.toFixed(2)}MB`);
    console.log(`Growth rate: ${(memoryGrowthMB / ((final.timestamp - initial.timestamp) / 1000)).toFixed(2)}MB/s`);
    
    // Проверка на потенциальные утечки
    if (memoryGrowthMB > 50) {
      console.warn('⚠️  High memory growth detected - potential memory leak');
    } else if (memoryGrowthMB > 20) {
      console.warn('⚠️  Moderate memory growth - monitor for leaks');
    } else {
      console.log('✅ Memory growth within acceptable limits');
    }
  }

  generateMemoryReport() {
    if (this.measurements.length === 0) {
      console.warn('No measurements available for report');
      return;
    }

    const report = {
      summary: {
        totalMeasurements: this.measurements.length,
        testDuration: this.measurements[this.measurements.length - 1].timestamp,
        peakMemoryUsage: Math.max(...this.measurements.map(m => m.usedJSHeapSizeMB)),
        averageMemoryUsage: this.measurements.reduce((sum, m) => sum + m.usedJSHeapSizeMB, 0) / this.measurements.length
      },
      measurements: this.measurements,
      recommendations: this.generateRecommendations()
    };

    console.log('=== Memory Test Report ===');
    console.table(report.summary);
    console.log('Recommendations:', report.recommendations);
    
    return report;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const latestMeasurement = this.measurements[this.measurements.length - 1];
    
    if (latestMeasurement.usedJSHeapSizeMB > 100) {
      recommendations.push('Consider implementing virtualization for large datasets');
    }
    
    if (latestMeasurement.usedJSHeapSizeMB > 200) {
      recommendations.push('Implement data pagination or lazy loading');
    }
    
    const memoryUtilization = (latestMeasurement.usedJSHeapSize / latestMeasurement.totalJSHeapSize) * 100;
    if (memoryUtilization > 80) {
      recommendations.push('High heap utilization - risk of garbage collection pauses');
    }
    
    return recommendations;
  }
}

// Usage example for React component
export const useMemoryTest = () => {
  const memoryTest = new MemoryTest();

  const startMemoryTest = () => {
    memoryTest.startTest();
  };

  const takeMeasurement = (label: string) => {
    memoryTest.takeMeasurement(label);
  };

  const generateReport = () => {
    return memoryTest.generateMemoryReport();
  };

  return {
    startMemoryTest,
    takeMeasurement,
    generateReport,
    simulateMemoryGrowth: memoryTest.simulateMemoryGrowth.bind(memoryTest)
  };
};