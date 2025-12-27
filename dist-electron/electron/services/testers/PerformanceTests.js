"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceTests = void 0;
/**
 * Тесты производительности Java
 * Следует принципу Single Responsibility из SOLID
 */
class PerformanceTests {
    /**
     * Тестирует аргументы командной строки
     */
    async testCommandLineArgs() {
        const startTime = Date.now();
        try {
            const { JreManager } = await Promise.resolve().then(() => __importStar(require('../JreManager')));
            const jreManager = new JreManager();
            const javaPath = await jreManager.getJavaExecutablePath();
            if (!javaPath) {
                throw new Error('Java executable not found');
            }
            const { execFile } = require('child_process');
            const { promisify } = require('util');
            const execFileAsync = promisify(execFile);
            const testArgs = ['-Xmx32m', '-Dtest.arg=value', '-version'];
            await execFileAsync(javaPath, testArgs, {
                timeout: 5000,
                windowsHide: true
            });
            return {
                testName: 'Command Line Args Test',
                success: true,
                duration: Date.now() - startTime,
                details: `Command line arguments processed successfully: ${testArgs.join(' ')}`
            };
        }
        catch (error) {
            return {
                testName: 'Command Line Args Test',
                success: false,
                duration: Date.now() - startTime,
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Тестирует производительность запуска
     */
    async testStartupPerformance(jarPath, iterations = 5) {
        const startTime = Date.now();
        const times = [];
        try {
            for (let i = 0; i < iterations; i++) {
                const iterationStart = Date.now();
                if (jarPath) {
                    const { JavaLauncher } = await Promise.resolve().then(() => __importStar(require('../JavaLauncher')));
                    const launcher = new JavaLauncher();
                    const result = await launcher.launchJar(jarPath, ['--test-mode'], {
                        timeout: 10000,
                        redirectOutput: false
                    });
                    if (result.process) {
                        result.process.kill();
                    }
                    if (!result.success) {
                        throw new Error(result.errorMessage || 'Launch failed');
                    }
                }
                else {
                    const { JreManager } = await Promise.resolve().then(() => __importStar(require('../JreManager')));
                    const jreManager = new JreManager();
                    const javaPath = await jreManager.getJavaExecutablePath();
                    if (!javaPath) {
                        throw new Error('Java executable not found');
                    }
                    const { execFile } = require('child_process');
                    const { promisify } = require('util');
                    const execFileAsync = promisify(execFile);
                    await execFileAsync(javaPath, ['-version'], {
                        timeout: 5000,
                        windowsHide: true
                    });
                }
                times.push(Date.now() - iterationStart);
            }
            const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
            const minTime = Math.min(...times);
            const maxTime = Math.max(...times);
            return {
                testName: 'Startup Performance Test',
                success: true,
                duration: Date.now() - startTime,
                details: `Average: ${averageTime.toFixed(2)}ms, Min: ${minTime}ms, Max: ${maxTime}ms`
            };
        }
        catch (error) {
            return {
                testName: 'Startup Performance Test',
                success: false,
                duration: Date.now() - startTime,
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
exports.PerformanceTests = PerformanceTests;
//# sourceMappingURL=PerformanceTests.js.map