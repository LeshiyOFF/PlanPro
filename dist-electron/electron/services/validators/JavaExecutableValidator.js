"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaExecutableValidator = void 0;
const JreManager_1 = require("../JreManager");
/**
 * Валидатор Java executable
 * Следует принципу Single Responsibility из SOLID
 */
class JavaExecutableValidator {
    jreManager;
    constructor() {
        this.jreManager = new JreManager_1.JreManager();
    }
    /**
     * Валидирует Java executable
     */
    async validateJavaExecutable() {
        try {
            const javaPath = await this.jreManager.getJavaExecutablePath();
            if (!javaPath) {
                return {
                    isValid: false,
                    errorMessage: 'Java executable not found'
                };
            }
            const fs = require('fs');
            if (!fs.existsSync(javaPath)) {
                return {
                    isValid: false,
                    errorMessage: `Java executable not found at path: ${javaPath}`
                };
            }
            const isValid = await this.jreManager.validateJre(javaPath);
            if (!isValid) {
                return {
                    isValid: false,
                    errorMessage: 'Java executable validation failed'
                };
            }
            return {
                isValid: true
            };
        }
        catch (error) {
            return {
                isValid: false,
                errorMessage: error instanceof Error ? error.message : 'Java validation failed'
            };
        }
    }
    /**
     * Валидирует версию Java
     */
    async validateJavaVersion() {
        try {
            const version = await this.jreManager.getJavaVersion();
            if (!version) {
                return {
                    isValid: false,
                    errorMessage: 'Unable to determine Java version'
                };
            }
            const isCompatible = this.jreManager.isJavaVersionCompatible(version);
            if (!isCompatible) {
                return {
                    isValid: false,
                    errorMessage: `Java version ${version} is not compatible. Required version: 11-21`
                };
            }
            return {
                isValid: true
            };
        }
        catch (error) {
            return {
                isValid: false,
                errorMessage: error instanceof Error ? error.message : 'Java version validation failed'
            };
        }
    }
}
exports.JavaExecutableValidator = JavaExecutableValidator;
//# sourceMappingURL=JavaExecutableValidator.js.map