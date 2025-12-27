import { ValidationResult } from '../interfaces/ValidationInterfaces';
/**
 * Валидатор Java executable
 * Следует принципу Single Responsibility из SOLID
 */
export declare class JavaExecutableValidator {
    private readonly jreManager;
    constructor();
    /**
     * Валидирует Java executable
     */
    validateJavaExecutable(): Promise<ValidationResult>;
    /**
     * Валидирует версию Java
     */
    validateJavaVersion(): Promise<ValidationResult>;
}
