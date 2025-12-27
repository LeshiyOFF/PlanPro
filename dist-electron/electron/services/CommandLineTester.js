"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandLineTester = void 0;
const TestCoordinator_1 = require("./TestCoordinator");
/**
 * Тестировщик командной строки Java
 * Следует принципу Single Responsibility из SOLID
 */
class CommandLineTester {
    coordinator;
    constructor() {
        this.coordinator = new TestCoordinator_1.TestCoordinator();
    }
    /**
     * Запускает полное тестирование командной строки Java
     */
    async runFullCommandLineTest(options = {}) {
        const startTime = Date.now();
        const testResults = [];
        const warnings = [];
        try {
            // Базовые тесты Java
            const basicTestsPassed = await this.coordinator.runBasicTests(testResults, warnings);
            if (!basicTestsPassed) {
                return {
                    success: false,
                    errorMessage: 'Java is not available',
                    warnings,
                    testResults,
                    duration: Date.now() - startTime
                };
            }
            // Тесты системной и embedded Java
            await this.coordinator.runSystemTests(options, testResults, warnings);
            // Тест JAR файла
            const jarTestPassed = await this.coordinator.runJarTest(options, testResults);
            if (!jarTestPassed) {
                return {
                    success: false,
                    errorMessage: `JAR launch test failed`,
                    warnings,
                    testResults,
                    duration: Date.now() - startTime
                };
            }
            // Тесты производительности
            await this.coordinator.runPerformanceTests(testResults);
            const success = testResults.every(result => result.success);
            return {
                success,
                warnings: warnings.length > 0 ? warnings : undefined,
                testResults,
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : 'Test execution failed',
                testResults,
                duration: Date.now() - startTime
            };
        }
    }
    /**
     * Генерирует отчет о тестировании
     */
    generateTestReport(result) {
        let report = `=== Java Command Line Test Report ===\n`;
        report += `Overall Success: ${result.success}\n`;
        report += `Duration: ${result.duration}ms\n`;
        if (result.errorMessage) {
            report += `Error: ${result.errorMessage}\n`;
        }
        if (result.warnings && result.warnings.length > 0) {
            report += `Warnings:\n`;
            result.warnings.forEach(warning => {
                report += `  - ${warning}\n`;
            });
        }
        report += `\n=== Individual Test Results ===\n`;
        result.testResults.forEach(testResult => {
            report += `${testResult.testName}: ${testResult.success ? 'PASS' : 'FAIL'} (${testResult.duration}ms)\n`;
            if (testResult.details) {
                report += `  Details: ${testResult.details}\n`;
            }
            if (testResult.errorMessage) {
                report += `  Error: ${testResult.errorMessage}\n`;
            }
        });
        return report;
    }
}
exports.CommandLineTester = CommandLineTester;
//# sourceMappingURL=CommandLineTester.js.map