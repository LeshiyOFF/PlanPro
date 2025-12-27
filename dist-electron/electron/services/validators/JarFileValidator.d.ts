import { ValidationResult } from '../interfaces/ValidationInterfaces';
/**
 * Валидатор JAR файлов
 * Следует принципу Single Responsibility из SOLID
 */
export declare class JarFileValidator {
    /**
     * Валидирует JAR файл
     */
    validateJarFile(jarPath: string): ValidationResult;
    /**
     * Валидирует опции памяти
     */
    validateMemoryOptions(memory: {
        min?: number;
        max?: number;
    }): ValidationResult;
    /**
     * Валидирует доступность порта
     */
    validatePortAvailability(port: number): Promise<ValidationResult>;
    /**
     * Проверяет доступность порта
     */
    private isPortAvailable;
}
