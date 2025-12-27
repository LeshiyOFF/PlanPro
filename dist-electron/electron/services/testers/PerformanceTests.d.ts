import { IndividualTestResult } from '../interfaces/CommandLineTestInterfaces';
/**
 * Тесты производительности Java
 * Следует принципу Single Responsibility из SOLID
 */
export declare class PerformanceTests {
    /**
     * Тестирует аргументы командной строки
     */
    testCommandLineArgs(): Promise<IndividualTestResult>;
    /**
     * Тестирует производительность запуска
     */
    testStartupPerformance(jarPath?: string, iterations?: number): Promise<IndividualTestResult>;
}
