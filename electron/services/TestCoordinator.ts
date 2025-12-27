import { CommandLineTestOptions, IndividualTestResult } from './interfaces/CommandLineTestInterfaces';
import { BasicJavaTests } from './testers/BasicJavaTests';
import { PerformanceTests } from './testers/PerformanceTests';
import { JarTests } from './testers/JarTests';

/**
 * Координатор тестов
 * Следует принципу Single Responsibility из SOLID
 */
export class TestCoordinator {
  private readonly basicTests: BasicJavaTests;
  private readonly performanceTests: PerformanceTests;
  private readonly jarTests: JarTests;
  
  constructor() {
    this.basicTests = new BasicJavaTests();
    this.performanceTests = new PerformanceTests();
    this.jarTests = new JarTests();
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
   * Выполняет тест JAR файла
   */
  async runJarTest(
    options: CommandLineTestOptions,
    testResults: IndividualTestResult[]
  ): Promise<boolean> {
    if (options.jarPath) {
      const jarLaunchTest = await this.jarTests.testJarLaunch(options.jarPath);
      testResults.push(jarLaunchTest);
      if (!jarLaunchTest.success) {
        return false;
      }
    }
    return true;
  }

  /**
   * Выполняет тест производительности
   */
  async runPerformanceTests(testResults: IndividualTestResult[]): Promise<void> {
    const argsTest = await this.performanceTests.testCommandLineArgs();
    testResults.push(argsTest);
  }
}