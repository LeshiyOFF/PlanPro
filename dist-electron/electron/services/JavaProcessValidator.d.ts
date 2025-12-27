import { ChildProcess } from 'child_process';
import { JavaLaunchOptions } from './interfaces/IJavaLauncher';
import { ValidationResult, ValidationOptions } from './interfaces/ValidationInterfaces';
/**
 * Валидатор Java процессов
 * Следует принципу Single Responsibility из SOLID
 */
export declare class JavaProcessValidator {
    private readonly javaValidator;
    private readonly jarValidator;
    constructor();
    /**
     * Валидирует параметры запуска Java процесса
     */
    validateLaunchConfig(jarPath: string, options?: JavaLaunchOptions, validationOptions?: ValidationOptions): Promise<ValidationResult>;
    /**
     * Валидирует запущенный процесс
     */
    validateRunningProcess(process: ChildProcess, timeout?: number): Promise<ValidationResult>;
    /**
     * Валидирует переменные окружения
     */
    validateEnvironment(env?: Record<string, string>): ValidationResult;
    /**
     * Извлекает порт из опций
     */
    private extractPortFromArgs;
}
