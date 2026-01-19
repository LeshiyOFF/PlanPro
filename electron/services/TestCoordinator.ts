import { CommandLineTestOptions, IndividualTestResult } from './interfaces/CommandLineTestInterfaces';
import { BasicJavaTests } from './testers/BasicJavaTests';

/**
 * Координатор тестов
 * Следует принципу Single Responsibility из SOLID
 */
export class TestCoordinator {
  private readonly basicTests: BasicJavaTests;
  
  constructor() {
    this.basicTests = new BasicJavaTests();
  }

  /**
   * Выполняет базовые тесты Java
   */
  async runBasicTests(testResults: IndividualTestResult[], warnings: string[]): Promise<boolean> {
    // Тест 1: Проверка доступности Java
    const javaAvailabilityTest = await this.basicTests.testJavaAvailability();
    testResults.push(javaAvailabilityTest);
    if (!javaAvailabilityTest.success) {
      return false;
    }

    // Тест 2: Получение версии Java
    const javaVersionTest = await this.basicTests.testJavaVersion();
    testResults.push(javaVersionTest);
    if (!javaVersionTest.success) {
      warnings.push('Unable to determine Java version');
    }

    return true;
  }

  /**
   * Выполняет тесты системной и embedded Java
   */
  async runSystemTests(
    options: CommandLineTestOptions,
    testResults: IndividualTestResult[],
    warnings: string[]
  ): Promise<void> {
    // Тест 3: Тест системной Java
    if (options.testSystemJava !== false) {
      const systemJavaTest = await this.basicTests.testSystemJavaLaunch();
      testResults.push(systemJavaTest);
      if (!systemJavaTest.success) {
        warnings.push('System Java test failed');
      }
    }

    // Тест 4: Тест embedded JRE
    if (options.testEmbeddedJre !== false) {
      const embeddedJreTest = await this.basicTests.testEmbeddedJreLaunch();
      testResults.push(embeddedJreTest);
      if (!embeddedJreTest.success) {
        warnings.push('Embedded JRE test failed');
      }
    }
  }

  /**
   * Выполняет тест JAR файла (ВРЕМЕННО ОТКЛЮЧЕН до обновления JarTests)
   */
  async runJarTest(
    _options: CommandLineTestOptions,
    _testResults: IndividualTestResult[]
  ): Promise<boolean> {
    return true;
  }

  /**
   * Выполняет тест производительности (ВРЕМЕННО ОТКЛЮЧЕН до обновления PerformanceTests)
   */
  async runPerformanceTests(_testResults: IndividualTestResult[]): Promise<void> {
    // Резерв для будущих тестов производительности
  }
}
