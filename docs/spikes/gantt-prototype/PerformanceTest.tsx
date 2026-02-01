import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GanttChart, GanttTask } from './GanttPrototype';
import type { MemoryMeasurement, BenchmarkResult, BenchmarkReport } from '../types/MemoryTestTypes';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  visibleTasks: number;
  totalTasks: number;
  scrollFPS: number;
}

const PerformanceTest: React.FC = () => {
  const [taskCount, setTaskCount] = useState(1000);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const ganttRef = useRef<HTMLDivElement>(null);

  // Генерация тестовых данных
  const generateLargeDataset = (count: number): GanttTask[] => {
    console.log(`Generating ${count} tasks...`);
    const startTime = performance.now();

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
        critical: Math.random() > 0.9,
        baselineStart: Math.random() > 0.5 ? taskStart.toISOString().split('T')[0] : undefined,
        baselineEnd: Math.random() > 0.5 ? taskEnd.toISOString().split('T')[0] : undefined
      });
    }

    const endTime = performance.now();
    console.log(`Generated ${count} tasks in ${endTime - startTime}ms`);

    return tasks;
  };

  // Измерение производительности
  const measurePerformance = async () => {
    if (!ganttRef.current) return;

    setIsTestRunning(true);
    console.log(`Starting performance test with ${taskCount} tasks...`);

    // Генерация данных
    const tasks = generateLargeDataset(taskCount);

    // Измерение времени первого рендера
    const renderStart = performance.now();

    // Принудительный перерендер
    setMetrics(null);
    await new Promise(resolve => setTimeout(resolve, 100));

    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart;

    // Измерение использования памяти (если доступно)
    interface MemoryInfo {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    }
    const memoryInfo = (performance as { memory?: MemoryInfo }).memory;
    const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0;
    
    // Измерение FPS при скроллинге
    let scrollFPS = 0;
    const scrollContainer = ganttRef.current.querySelector('.gantt-container') as HTMLElement;
    
    if (scrollContainer) {
      let frameCount = 0;
      let lastTime = performance.now();
      
      const scrollTest = () => {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
          scrollFPS = Math.round((frameCount * 1000) / (currentTime - lastTime));
          frameCount = 0;
          lastTime = currentTime;
        }
        
        if (scrollContainer.scrollTop < scrollContainer.scrollHeight - scrollContainer.clientHeight) {
          scrollContainer.scrollTop += 50;
          requestAnimationFrame(scrollTest);
        }
      };
      
      requestAnimationFrame(scrollTest);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Подсчет видимых задач
    const visibleElements = ganttRef.current.querySelectorAll('.gantt-task-bar');
    const visibleTasks = visibleElements.length;
    
    setMetrics({
      renderTime,
      memoryUsage,
      visibleTasks,
      totalTasks: taskCount,
      scrollFPS
    });
    
    setIsTestRunning(false);
    console.log('Performance test completed:', {
      renderTime,
      memoryUsage,
      visibleTasks,
      totalTasks: taskCount,
      scrollFPS
    });
  };

  // Автоматический тест с разными размерами данных
  const runAutomatedTests = async () => {
    const testSizes = [100, 500, 1000, 2000, 5000];
    const results: BenchmarkResult[] = [];
    
    for (const size of testSizes) {
      console.log(`Testing with ${size} tasks...`);
      setTaskCount(size);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await measurePerformance();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (metrics) {
        results.push({
          taskCount: size,
          ...metrics
        });
      }
    }
    
    console.table(results);
    return results;
  };

  const testTasks = useMemo(() => generateLargeDataset(taskCount), [taskCount]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Gantt Performance Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h3>Test Configuration</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>Task Count: </label>
          <input 
            type="number" 
            value={taskCount} 
            onChange={(e) => setTaskCount(Number(e.target.value))}
            min="10"
            max="10000"
            step="100"
            disabled={isTestRunning}
          />
        </div>
        
        <button 
          onClick={measurePerformance} 
          disabled={isTestRunning}
          style={{
            padding: '10px 20px',
            backgroundColor: isTestRunning ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isTestRunning ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isTestRunning ? 'Testing...' : 'Run Performance Test'}
        </button>
        
        <button 
          onClick={runAutomatedTests} 
          disabled={isTestRunning}
          style={{
            padding: '10px 20px',
            backgroundColor: isTestRunning ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isTestRunning ? 'not-allowed' : 'pointer'
          }}
        >
          Run Automated Tests
        </button>
      </div>

      {metrics && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
          <h3>Performance Results</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div>
              <strong>Render Time:</strong> {metrics.renderTime.toFixed(2)}ms
            </div>
            <div>
              <strong>Memory Usage:</strong> {metrics.memoryUsage.toFixed(2)}MB
            </div>
            <div>
              <strong>Visible Tasks:</strong> {metrics.visibleTasks}
            </div>
            <div>
              <strong>Total Tasks:</strong> {metrics.totalTasks}
            </div>
            <div>
              <strong>Scroll FPS:</strong> {metrics.scrollFPS}
            </div>
            <div>
              <strong>Virtualization Ratio:</strong> {((metrics.visibleTasks / metrics.totalTasks) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      <div ref={ganttRef} style={{ border: '1px solid #ccc', borderRadius: '5px' }}>
        <GanttChart tasks={testTasks} containerHeight={600} />
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
        <h3>Performance Benchmarks</h3>
        <ul>
          <li><strong>Target Render Time:</strong> &lt; 100ms</li>
          <li><strong>Target Memory Usage:</strong> &lt; 100MB for 1000 tasks</li>
          <li><strong>Target Scroll FPS:</strong> &gt; 30 FPS</li>
          <li><strong>Virtualization Efficiency:</strong> &lt; 10% visible tasks</li>
        </ul>
      </div>
    </div>
  );
};

export default PerformanceTest;