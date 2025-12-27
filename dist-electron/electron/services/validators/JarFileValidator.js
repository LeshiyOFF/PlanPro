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
exports.JarFileValidator = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const net = __importStar(require("net"));
/**
 * Валидатор JAR файлов
 * Следует принципу Single Responsibility из SOLID
 */
class JarFileValidator {
    /**
     * Валидирует JAR файл
     */
    validateJarFile(jarPath) {
        try {
            if (!jarPath || jarPath.trim() === '') {
                return {
                    isValid: false,
                    errorMessage: 'JAR path is required'
                };
            }
            const resolvedPath = path.resolve(jarPath);
            if (!fs.existsSync(resolvedPath)) {
                return {
                    isValid: false,
                    errorMessage: `JAR file not found: ${resolvedPath}`
                };
            }
            const stats = fs.statSync(resolvedPath);
            if (!stats.isFile()) {
                return {
                    isValid: false,
                    errorMessage: `JAR path is not a file: ${resolvedPath}`
                };
            }
            // Проверяем расширение файла
            if (!resolvedPath.toLowerCase().endsWith('.jar')) {
                return {
                    isValid: false,
                    errorMessage: `File is not a JAR file: ${resolvedPath}`
                };
            }
            // Проверяем размер файла
            if (stats.size === 0) {
                return {
                    isValid: false,
                    errorMessage: `JAR file is empty: ${resolvedPath}`
                };
            }
            return {
                isValid: true
            };
        }
        catch (error) {
            return {
                isValid: false,
                errorMessage: error instanceof Error ? error.message : 'JAR file validation failed'
            };
        }
    }
    /**
     * Валидирует опции памяти
     */
    validateMemoryOptions(memory) {
        const warnings = [];
        if (memory.min && memory.min < 64) {
            warnings.push('Minimum memory less than 64MB may cause performance issues');
        }
        if (memory.max && memory.max < 128) {
            warnings.push('Maximum memory less than 128MB may cause performance issues');
        }
        if (memory.min && memory.max && memory.min > memory.max) {
            return {
                isValid: false,
                errorMessage: 'Minimum memory cannot be greater than maximum memory'
            };
        }
        if (memory.max && memory.max > 8192) {
            warnings.push('Maximum memory greater than 8GB may not be available on all systems');
        }
        return {
            isValid: true,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }
    /**
     * Валидирует доступность порта
     */
    async validatePortAvailability(port) {
        try {
            if (port < 1 || port > 65535) {
                return {
                    isValid: false,
                    errorMessage: `Port ${port} is out of valid range (1-65535)`
                };
            }
            if (port < 1024) {
                return {
                    isValid: true,
                    warnings: [`Port ${port} requires administrator privileges`]
                };
            }
            // Проверяем занятость порта
            const isAvailable = await this.isPortAvailable(port);
            if (!isAvailable) {
                return {
                    isValid: false,
                    errorMessage: `Port ${port} is already in use`
                };
            }
            return {
                isValid: true
            };
        }
        catch (error) {
            return {
                isValid: false,
                errorMessage: error instanceof Error ? error.message : 'Port validation failed'
            };
        }
    }
    /**
     * Проверяет доступность порта
     */
    async isPortAvailable(port) {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.listen(port, () => {
                server.close(() => {
                    resolve(true);
                });
            });
            server.on('error', () => {
                resolve(false);
            });
        });
    }
}
exports.JarFileValidator = JarFileValidator;
//# sourceMappingURL=JarFileValidator.js.map