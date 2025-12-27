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
exports.BasicJavaTests = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
/**
 * Базовые тесты Java
 * Следует принципу Single Responsibility из SOLID
 */
class BasicJavaTests {
    /**
     * Тестирует доступность Java
     */
    async testJavaAvailability() {
        const startTime = Date.now();
        try {
            const { JreManager } = await Promise.resolve().then(() => __importStar(require('../JreManager')));
            const jreManager = new JreManager();
            const isAvailable = await jreManager.isJreAvailable();
            return {
                testName: 'Java Availability Test',
                success: isAvailable,
                duration: Date.now() - startTime,
                details: isAvailable ? 'Java is available' : 'Java is not available'
            };
        }
        catch (error) {
            return {
                testName: 'Java Availability Test',
                success: false,
                duration: Date.now() - startTime,
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Тестирует получение версии Java
     */
    async testJavaVersion() {
        const startTime = Date.now();
        try {
            const { JreManager } = await Promise.resolve().then(() => __importStar(require('../JreManager')));
            const jreManager = new JreManager();
            const version = await jreManager.getJavaVersion();
            return {
                testName: 'Java Version Test',
                success: !!version,
                duration: Date.now() - startTime,
                details: version ? `Java version: ${version}` : 'Unable to determine Java version'
            };
        }
        catch (error) {
            return {
                testName: 'Java Version Test',
                success: false,
                duration: Date.now() - startTime,
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Тестирует запуск системной Java
     */
    async testSystemJavaLaunch() {
        const startTime = Date.now();
        try {
            const { JreManager } = await Promise.resolve().then(() => __importStar(require('../JreManager')));
            const jreManager = new JreManager();
            const jreType = await jreManager.getJreType();
            const hasSystemJava = jreType !== 'none';
            if (!hasSystemJava) {
                return {
                    testName: 'System Java Launch Test',
                    success: false,
                    duration: Date.now() - startTime,
                    errorMessage: 'No system Java installation found'
                };
            }
            const javaPath = await jreManager.getJavaExecutablePath();
            if (!javaPath) {
                throw new Error('Java executable not found');
            }
            await execFileAsync(javaPath, ['-version'], {
                timeout: 5000,
                windowsHide: true
            });
            return {
                testName: 'System Java Launch Test',
                success: true,
                duration: Date.now() - startTime,
                details: `System Java launched successfully from: ${javaPath}`
            };
        }
        catch (error) {
            return {
                testName: 'System Java Launch Test',
                success: false,
                duration: Date.now() - startTime,
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Тестирует запуск embedded JRE
     */
    async testEmbeddedJreLaunch() {
        const startTime = Date.now();
        try {
            const { EmbeddedJreService } = await Promise.resolve().then(() => __importStar(require('../EmbeddedJreService')));
            const embeddedService = new EmbeddedJreService();
            const isEmbeddedAvailable = await embeddedService.isEmbeddedJreAvailable();
            if (!isEmbeddedAvailable) {
                return {
                    testName: 'Embedded JRE Launch Test',
                    success: false,
                    duration: Date.now() - startTime,
                    errorMessage: 'Embedded JRE not available'
                };
            }
            const javaPath = await embeddedService.getEmbeddedJavaPath();
            if (!javaPath) {
                throw new Error('Embedded Java executable not found');
            }
            await execFileAsync(javaPath, ['-version'], {
                timeout: 5000,
                windowsHide: true
            });
            return {
                testName: 'Embedded JRE Launch Test',
                success: true,
                duration: Date.now() - startTime,
                details: `Embedded JRE launched successfully from: ${javaPath}`
            };
        }
        catch (error) {
            return {
                testName: 'Embedded JRE Launch Test',
                success: false,
                duration: Date.now() - startTime,
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
exports.BasicJavaTests = BasicJavaTests;
//# sourceMappingURL=BasicJavaTests.js.map