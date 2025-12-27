import { IndividualTestResult } from '../interfaces/CommandLineTestInterfaces';
/**
 * JAR тесты
 * Следует принципу Single Responsibility из SOLID
 */
export declare class JarTests {
    /**
     * Тестирует запуск JAR файла
     */
    testJarLaunch(jarPath: string): Promise<IndividualTestResult>;
}
