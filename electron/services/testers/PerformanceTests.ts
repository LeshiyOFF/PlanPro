import { IndividualTestResult } from '../interfaces/CommandLineTestInterfaces';

/**
 * Тесты производительности Java
 * Следует принципу Single Responsibility из SOLID
 */
export class PerformanceTests {
  
  /**
   * Тестирует аргументы командной строки
   */
  async testCommandLineArgs(): Promise<IndividualTestResult> {
    const startTime = Date.now();
    
    try {
      const { JreManager } = await import('../JreManager');
      const jreManager = new JreManager();
      const javaPath = await jreManager.getJavaExecutablePath();
      
      if (!javaPath) {
        throw new Error('Java executable not found');
      }

      const { execFile } = require('child_process');
      const { promisify } = require('util');
      const execFileAsync = promisify(execFile);
      
      const testArgs = ['-Xmx32m', '-Dtest.arg=value', '-version'];
      
      await execFileAsync(javaPath, testArgs, {
        timeout: 5000,
        windowsHide: true
      });

      return {
        testName: 'Command Line Args Test',
        success: true,
        duration: Date.now() - startTime,
        details: `Command line arguments processed successfully: ${testArgs.join(' ')}`
      };
    } catch (error) {
      return {
        testName: 'Command Line Args Test',
        success: false,
        duration: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Тестирует производительность запуска
   */
  async testStartupPerformance(jarPath?: string, iterations: number = 5): Promise<IndividualTestResult> {
    const startTime = Date.now();
    const times: number[] = [];
    
    try {
      for (let i = 0; i < iterations; i++) {
        const iterationStart = Date.now();
        
        if (jarPath) {
          const { JavaLauncher } = await import('../JavaLauncher');
          const launcher = new JavaLauncher();
          
          const result = await launcher.launchJar(jarPath, ['--test-mode'], {
            timeout: 10000,
            redirectOutput: false
          });
          
          if (result.process) {
            result.process.kill();
          }
          
          if (!result.success) {
            throw new Error(result.errorMessage || 'Launch failed');
          }
        } else {
          const { JreManager } = await import('../JreManager');
          const jreManager = new JreManager();
          const javaPath = await jreManager.getJavaExecutablePath();
          
          if (!javaPath) {
            throw new Error('Java executable not found');
          }
          
          const { execFile } = require('child_process');
          const { promisify } = require('util');
          const execFileAsync = promisify(execFile);
          
          await execFileAsync(javaPath, ['-version'], {
            timeout: 5000,
            windowsHide: true
          });
        }
        
        times.push(Date.now() - iterationStart);
      }
      
      const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      
      return {
        testName: 'Startup Performance Test',
        success: true,
        duration: Date.now() - startTime,
        details: `Average: ${averageTime.toFixed(2)}ms, Min: ${minTime}ms, Max: ${maxTime}ms`
      };
    } catch (error) {
      return {
        testName: 'Startup Performance Test',
        success: false,
        duration: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}