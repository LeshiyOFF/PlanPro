import { execFile } from 'child_process';
import { promisify } from 'util';


const execFileAsync = promisify(execFile);

import { IndividualTestResult } from '../interfaces/CommandLineTestInterfaces';

/**
 * Базовые тесты Java
 * Следует принципу Single Responsibility из SOLID
 */
export class BasicJavaTests {
  
  /**
   * Тестирует доступность Java
   */
  async testJavaAvailability(): Promise<IndividualTestResult> {
    const startTime = Date.now();
    
    try {
      const { JreManager } = await import('../JreManager');
      const jreManager = new JreManager();
      const isAvailable = await jreManager.isJreAvailable();
      
      return {
        testName: 'Java Availability Test',
        success: isAvailable,
        duration: Date.now() - startTime,
        details: isAvailable ? 'Java is available' : 'Java is not available'
      };
    } catch (error) {
      return {
        testName: 'Java Availability Test',
        success: false,
        duration: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Тестирует получение версии Java
   */
  async testJavaVersion(): Promise<IndividualTestResult> {
    const startTime = Date.now();
    
    try {
      const { JreManager } = await import('../JreManager');
      const jreManager = new JreManager();
      const version = await jreManager.getJavaVersion();
      
      return {
        testName: 'Java Version Test',
        success: !!version,
        duration: Date.now() - startTime,
        details: version ? `Java version: ${version}` : 'Unable to determine Java version'
      };
    } catch (error) {
      return {
        testName: 'Java Version Test',
        success: false,
        duration: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Тестирует запуск системной Java
   */
  async testSystemJavaLaunch(): Promise<IndividualTestResult> {
    const startTime = Date.now();
    
    try {
      const { JreManager } = await import('../JreManager');
      const jreManager = new JreManager();
      const jreType = await jreManager.getJreType();
      const hasSystemJava = jreType !== 'none';
      
      if (!hasSystemJava) {
        return {
          testName: 'System Java Launch Test',
          success: false,
          duration: Date.now() - startTime,
          errorMessage: 'No system Java installation found'
        };
      }

      const javaPath = await jreManager.getJavaExecutablePath();
      if (!javaPath) {
        throw new Error('Java executable not found');
      }

      await execFileAsync(javaPath, ['-version'], {
        timeout: 5000,
        windowsHide: true
      });

      return {
        testName: 'System Java Launch Test',
        success: true,
        duration: Date.now() - startTime,
        details: `System Java launched successfully from: ${javaPath}`
      };
    } catch (error) {
      return {
        testName: 'System Java Launch Test',
        success: false,
        duration: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Тестирует запуск embedded JRE
   */
  async testEmbeddedJreLaunch(): Promise<IndividualTestResult> {
    const startTime = Date.now();
    
    try {
      const { EmbeddedJreService } = await import('../EmbeddedJreService');
      const embeddedService = new EmbeddedJreService();
      
      const isEmbeddedAvailable = await embeddedService.isEmbeddedJreAvailable();
      if (!isEmbeddedAvailable) {
        return {
          testName: 'Embedded JRE Launch Test',
          success: false,
          duration: Date.now() - startTime,
          errorMessage: 'Embedded JRE not available'
        };
      }

      const javaPath = await embeddedService.getEmbeddedJavaPath();
      if (!javaPath) {
        throw new Error('Embedded Java executable not found');
      }

      await execFileAsync(javaPath, ['-version'], {
        timeout: 5000,
        windowsHide: true
      });

      return {
        testName: 'Embedded JRE Launch Test',
        success: true,
        duration: Date.now() - startTime,
        details: `Embedded JRE launched successfully from: ${javaPath}`
      };
    } catch (error) {
      return {
        testName: 'Embedded JRE Launch Test',
        success: false,
        duration: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}