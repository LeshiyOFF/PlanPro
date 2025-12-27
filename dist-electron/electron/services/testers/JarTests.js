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
exports.JarTests = void 0;
/**
 * JAR тесты
 * Следует принципу Single Responsibility из SOLID
 */
class JarTests {
    /**
     * Тестирует запуск JAR файла
     */
    async testJarLaunch(jarPath) {
        const startTime = Date.now();
        try {
            const { JavaProcessValidator } = await Promise.resolve().then(() => __importStar(require('../JavaProcessValidator')));
            const validator = new JavaProcessValidator();
            const validation = await validator.validateLaunchConfig(jarPath, {}, {
                checkJar: true,
                checkVersion: true,
                timeout: 10000
            });
            if (!validation.isValid) {
                return {
                    testName: 'JAR Launch Test',
                    success: false,
                    duration: Date.now() - startTime,
                    errorMessage: validation.errorMessage || 'JAR validation failed'
                };
            }
            const { JavaLauncher } = await Promise.resolve().then(() => __importStar(require('../JavaLauncher')));
            const launcher = new JavaLauncher();
            const result = await launcher.launchJar(jarPath, ['--test-mode'], {
                timeout: 10000,
                redirectOutput: true
            });
            if (result.success && result.process) {
                setTimeout(() => {
                    result.process?.kill();
                }, 3000);
            }
            return {
                testName: 'JAR Launch Test',
                success: result.success,
                duration: Date.now() - startTime,
                details: result.success ?
                    `JAR ${jarPath} launched successfully` :
                    result.errorMessage,
                errorMessage: result.errorMessage
            };
        }
        catch (error) {
            return {
                testName: 'JAR Launch Test',
                success: false,
                duration: Date.now() - startTime,
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
exports.JarTests = JarTests;
//# sourceMappingURL=JarTests.js.map