import { CommandLineTestOptions, IndividualTestResult } from './interfaces/CommandLineTestInterfaces';
/**
 * Координатор тестов
 * Следует принципу Single Responsibility из SOLID
 */
export declare class TestCoordinator {
    private readonly basicTests;
    private readonly performanceTests;
    private readonly jarTests;
    constructor();
    /**
     * Выполняет базовые тесты Java
     */
    runBasicTests(testResults: IndividualTestResult[], warnings: string[]): Promise<boolean>;
    /**
     * Выполняет тесты системной и embedded Java
     */
    runSystemTests(options: CommandLineTestOptions, testResults: IndividualTestResult[], warnings: string[]): Promise<void>;
    /**
     * Выполняет тест JAR файла
     */
    runJarTest(options: CommandLineTestOptions, testResults: IndividualTestResult[]): Promise<boolean>;
    /**
     * Выполняет тест производительности
     */
    runPerformanceTests(testResults: IndividualTestResult[]): Promise<void>;
}
