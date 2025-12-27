import { CommandLineTestResult, CommandLineTestOptions } from './interfaces/CommandLineTestInterfaces';
/**
 * Тестировщик командной строки Java
 * Следует принципу Single Responsibility из SOLID
 */
export declare class CommandLineTester {
    private readonly coordinator;
    constructor();
    /**
     * Запускает полное тестирование командной строки Java
     */
    runFullCommandLineTest(options?: CommandLineTestOptions): Promise<CommandLineTestResult>;
    /**
     * Генерирует отчет о тестировании
     */
    generateTestReport(result: CommandLineTestResult): string;
}
