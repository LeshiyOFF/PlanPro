import { IndividualTestResult } from '../interfaces/CommandLineTestInterfaces';
/**
 * Базовые тесты Java
 * Следует принципу Single Responsibility из SOLID
 */
export declare class BasicJavaTests {
    /**
     * Тестирует доступность Java
     */
    testJavaAvailability(): Promise<IndividualTestResult>;
    /**
     * Тестирует получение версии Java
     */
    testJavaVersion(): Promise<IndividualTestResult>;
    /**
     * Тестирует запуск системной Java
     */
    testSystemJavaLaunch(): Promise<IndividualTestResult>;
    /**
     * Тестирует запуск embedded JRE
     */
    testEmbeddedJreLaunch(): Promise<IndividualTestResult>;
}
