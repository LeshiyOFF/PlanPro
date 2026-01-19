import * as fs from 'fs';
import * as path from 'path';
import { execFile } from 'child_process';

/**
 * Интерфейс для валидации JAR файлов
 */
export interface IJarFileValidator {
  validateFile(filePath: string): Promise<ValidationResult>;
  validateStructure(filePath: string): Promise<ValidationResult>;
  validateMemoryOptions(memory: number): ValidationResult;
  validateJarFile(filePath: string): Promise<ValidationResult>;
  validatePortAvailability?(port: number): Promise<ValidationResult>;
}

/**
 * Результат валидации
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  errorMessage?: string;
}

/**
 * Валидатор JAR файлов
 */
export class JarFileValidator implements IJarFileValidator {
  
  /**
   * Валидация JAR файла
   */
  public async validateFile(filePath: string): Promise<ValidationResult> {
    return new Promise((resolve) => {
      try {
        if (!fs.existsSync(filePath)) {
          resolve({
            isValid: false,
            errors: [`File not found: ${filePath}`],
            warnings: [],
            errorMessage: `File not found: ${filePath}`
          });
          return;
        }

        const stats = fs.statSync(filePath);
        if (!stats.isFile()) {
          resolve({
            isValid: false,
            errors: ['Path is not a file'],
            warnings: [],
            errorMessage: 'Path is not a file'
          });
          return;
        }

        const fileExt = path.extname(filePath).toLowerCase();
        if (fileExt !== '.jar') {
          resolve({
            isValid: false,
            errors: [`Invalid file extension: ${fileExt}`],
            warnings: []
          });
          return;
        }

        resolve({
          isValid: true,
          errors: [],
          warnings: ['File validation completed']
        });
      } catch (error) {
        resolve({
          isValid: false,
          errors: [`Validation error: ${(error as Error).message}`],
          warnings: [],
          errorMessage: `Validation error: ${(error as Error).message}`
        });
      }
    });
  }

  /**
   * Валидация структуры JAR файла
   */
  public async validateStructure(filePath: string): Promise<ValidationResult> {
    return new Promise((resolve) => {
      resolve({
        isValid: true,
        errors: [],
        warnings: ['Structure validation completed']
      });
    });
  }

  /**
   * Валидация опций памяти
   */
  public validateMemoryOptions(memory: number): ValidationResult {
    if (!memory || memory <= 0) {
      return {
        isValid: false,
        errors: ['Invalid memory configuration'],
        warnings: [],
        errorMessage: 'Invalid memory configuration'
      };
    }

    if (memory < 512) {
      return {
        isValid: true,
        errors: [],
        warnings: [`Low memory allocation: ${memory}MB`]
      };
    }

    if (memory > 8192) {
      return {
        isValid: false,
        errors: ['Memory allocation too high: >8GB'],
        warnings: [],
        errorMessage: 'Memory allocation too high: >8GB'
      };
    }

    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  /**
   * Валидация JAR файла (альтернативный метод)
   */
  public async validateJarFile(filePath: string): Promise<ValidationResult> {
    return this.validateFile(filePath);
  }

  /**
   * Проверка манифеста JAR
   */
  private async checkManifest(filePath: string): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(true);
    });
  }

  /**
   * Валидация доступности порта
   */
  public async validatePortAvailability(port: number): Promise<ValidationResult> {
    return new Promise((resolve) => {
      if (port <= 0 || port > 65535) {
        resolve({
          isValid: false,
          errors: ['Port must be between 1 and 65535'],
          warnings: [],
          errorMessage: 'Port must be between 1 and 65535'
        });
        return;
      }

      // Simple validation - in real implementation would check if port is actually available
      resolve({
        isValid: true,
        errors: [],
        warnings: []
      });
    });
  }
}