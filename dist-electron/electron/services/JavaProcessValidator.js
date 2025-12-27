"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaProcessValidator = void 0;
// import { JreManager } from './JreManager'; // TODO: Use for enhanced validation
const JavaExecutableValidator_1 = require("./validators/JavaExecutableValidator");
const JarFileValidator_1 = require("./validators/JarFileValidator");
/**
 * Валидатор Java процессов
 * Следует принципу Single Responsibility из SOLID
 */
class JavaProcessValidator {
    // private readonly jreManager: JreManager; // TODO: Use for enhanced validation
    javaValidator;
    jarValidator;
    constructor() {
        // this.jreManager = new JreManager(); // TODO: Use for enhanced validation
        this.javaValidator = new JavaExecutableValidator_1.JavaExecutableValidator();
        this.jarValidator = new JarFileValidator_1.JarFileValidator();
    }
    /**
     * Валидирует параметры запуска Java процесса
     */
    async validateLaunchConfig(jarPath, options = {}, validationOptions = {}) {
        try {
            const warnings = [];
            const details = {
                javaValid: false,
                jarValid: false,
                portAvailable: true,
                memorySufficient: true,
                versionCompatible: false
            };
            // Валидация Java executable
            const javaValidation = await this.javaValidator.validateJavaExecutable();
            details.javaValid = javaValidation.isValid;
            if (!javaValidation.isValid) {
                return {
                    isValid: false,
                    errorMessage: javaValidation.errorMessage,
                    warnings,
                    details
                };
            }
            if (javaValidation.warnings) {
                warnings.push(...javaValidation.warnings);
            }
            // Валидация версии Java
            if (validationOptions.checkVersion !== false) {
                const versionValidation = await this.javaValidator.validateJavaVersion();
                details.versionCompatible = versionValidation.isValid;
                if (!versionValidation.isValid) {
                    return {
                        isValid: false,
                        errorMessage: versionValidation.errorMessage,
                        warnings,
                        details
                    };
                }
                if (versionValidation.warnings) {
                    warnings.push(...versionValidation.warnings);
                }
            }
            // Валидация JAR файла
            if (validationOptions.checkJar !== false) {
                const jarValidation = this.jarValidator.validateJarFile(jarPath);
                details.jarValid = jarValidation.isValid;
                if (!jarValidation.isValid) {
                    return {
                        isValid: false,
                        errorMessage: jarValidation.errorMessage,
                        warnings,
                        details
                    };
                }
                if (jarValidation.warnings) {
                    warnings.push(...jarValidation.warnings);
                }
            }
            else {
                details.jarValid = true;
            }
            // Валидация памяти
            if (validationOptions.checkMemory !== false && options.memory) {
                const memoryValidation = this.jarValidator.validateMemoryOptions(options.memory);
                details.memorySufficient = memoryValidation.isValid;
                if (!memoryValidation.isValid) {
                    return {
                        isValid: false,
                        errorMessage: memoryValidation.errorMessage,
                        warnings,
                        details
                    };
                }
                if (memoryValidation.warnings) {
                    warnings.push(...memoryValidation.warnings);
                }
            }
            // Валидация порта
            if (validationOptions.checkPort !== false && this.extractPortFromArgs(options)) {
                const port = this.extractPortFromArgs(options);
                const portValidation = await this.jarValidator.validatePortAvailability(port);
                details.portAvailable = portValidation.isValid;
                if (!portValidation.isValid) {
                    return {
                        isValid: false,
                        errorMessage: portValidation.errorMessage,
                        warnings,
                        details
                    };
                }
                if (portValidation.warnings) {
                    warnings.push(...portValidation.warnings);
                }
            }
            return {
                isValid: true,
                warnings: warnings.length > 0 ? warnings : undefined,
                details
            };
        }
        catch (error) {
            return {
                isValid: false,
                errorMessage: error instanceof Error ? error.message : 'Unknown validation error'
            };
        }
    }
    /**
     * Валидирует запущенный процесс
     */
    async validateRunningProcess(process, timeout = 10000) {
        return new Promise((resolve) => {
            if (!process || !process.pid) {
                resolve({
                    isValid: false,
                    errorMessage: 'Process is not running'
                });
                return;
            }
            let hasOutput = false;
            let hasError = false;
            const timeoutId = setTimeout(() => {
                if (!hasOutput && !hasError) {
                    resolve({
                        isValid: true,
                        warnings: ['Process started but no output detected within timeout']
                    });
                }
            }, timeout);
            process.stdout?.on('data', () => {
                hasOutput = true;
                clearTimeout(timeoutId);
                resolve({
                    isValid: true
                });
            });
            process.stderr?.on('data', () => {
                hasError = true;
                clearTimeout(timeoutId);
                resolve({
                    isValid: true,
                    warnings: ['Process started with stderr output']
                });
            });
            process.on('error', (error) => {
                clearTimeout(timeoutId);
                resolve({
                    isValid: false,
                    errorMessage: error.message
                });
            });
            process.on('close', (code) => {
                clearTimeout(timeoutId);
                resolve({
                    isValid: code === 0,
                    errorMessage: code !== 0 ? `Process exited with code ${code}` : undefined
                });
            });
        });
    }
    /**
     * Валидирует переменные окружения
     */
    validateEnvironment(env) {
        if (!env) {
            return { isValid: true };
        }
        const warnings = [];
        for (const [key, value] of Object.entries(env)) {
            if (!value || value.trim() === '') {
                warnings.push(`Environment variable ${key} is empty`);
            }
            if (key.includes(' ') || value.includes(' ')) {
                warnings.push(`Environment variable ${key} or its value contains spaces`);
            }
        }
        return {
            isValid: true,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }
    /**
     * Извлекает порт из опций
     */
    extractPortFromArgs(options) {
        if (options.jvmOptions) {
            for (const option of options.jvmOptions) {
                const match = option.match(/-D(?:server\.)?port(?:=)?(\d+)/);
                if (match) {
                    return parseInt(match[1] || '0', 10);
                }
            }
        }
        // TODO: Implement port validation when args are added to options
        // if (options && options.args) {
        //   for (const arg of options.args) {
        //     const match = arg.match(/--server\.port(?:=)?(\d+)/);
        //     if (match) {
        //       return parseInt(match[1] || '0', 10);
        //     }
        //   }
        // }
        return null;
    }
}
exports.JavaProcessValidator = JavaProcessValidator;
//# sourceMappingURL=JavaProcessValidator.js.map