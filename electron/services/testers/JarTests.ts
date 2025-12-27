import { IndividualTestResult } from '../interfaces/CommandLineTestInterfaces';

/**
 * JAR тесты
 * Следует принципу Single Responsibility из SOLID
 */
export class JarTests {
  
  /**
   * Тестирует запуск JAR файла
   */
  async testJarLaunch(jarPath: string): Promise<IndividualTestResult> {
    const startTime = Date.now();
    
    try {
      const { JavaProcessValidator } = await import('../JavaProcessValidator');
      const validator = new JavaProcessValidator();

      const validation = await validator.validateLaunchConfig(jarPath, {}, {
        checkJar: true,
        checkVersion: true,
        timeout: 10000
      });

      if (!validation.isValid) {
        return {
          testName: 'JAR Launch Test',
          success: false,
          duration: Date.now() - startTime,
          errorMessage: validation.errorMessage || 'JAR validation failed'
        };
      }

      const { JavaLauncher } = await import('../JavaLauncher');
      const launcher = new JavaLauncher();

      const result = await launcher.launchJar(jarPath, ['--test-mode'], {
        timeout: 10000,
        redirectOutput: true
      });

      if (result.success && result.process) {
        setTimeout(() => {
          result.process?.kill();
        }, 3000);
      }

      return {
        testName: 'JAR Launch Test',
        success: result.success,
        duration: Date.now() - startTime,
        details: result.success ? 
          `JAR ${jarPath} launched successfully` : 
          result.errorMessage,
        errorMessage: result.errorMessage
      };
    } catch (error) {
      return {
        testName: 'JAR Launch Test',
        success: false,
        duration: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}