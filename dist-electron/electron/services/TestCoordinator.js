"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCoordinator = void 0;
const BasicJavaTests_1 = require("./testers/BasicJavaTests");
const PerformanceTests_1 = require("./testers/PerformanceTests");
const JarTests_1 = require("./testers/JarTests");
/**
 * Координатор тестов
 * Следует принципу Single Responsibility из SOLID
 */
class TestCoordinator {
    basicTests;
    performanceTests;
    jarTests;
    constructor() {
        this.basicTests = new BasicJavaTests_1.BasicJavaTests();
        this.performanceTests = new PerformanceTests_1.PerformanceTests();
        this.jarTests = new JarTests_1.JarTests();
    }
    /**
     * Выполняет базовые тесты Java
     */
    async runBasicTests(testResults, warnings) {
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
    async runSystemTests(options, testResults, warnings) {
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
    async runJarTest(options, testResults) {
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
    async runPerformanceTests(testResults) {
        const argsTest = await this.performanceTests.testCommandLineArgs();
        testResults.push(argsTest);
    }
}
exports.TestCoordinator = TestCoordinator;
//# sourceMappingURL=TestCoordinator.js.map