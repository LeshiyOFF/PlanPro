import * as fs from 'fs';
import * as path from 'path';
import * as net from 'net';
import { ValidationResult } from '../interfaces/ValidationInterfaces';

/**
 * Валидатор JAR файлов
 * Следует принципу Single Responsibility из SOLID
 */
export class JarFileValidator {
  /**
   * Валидирует JAR файл
   */
  validateJarFile(jarPath: string): ValidationResult {
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
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'JAR file validation failed'
      };
    }
  }

  /**
   * Валидирует опции памяти
   */
  validateMemoryOptions(memory: { min?: number; max?: number }): ValidationResult {
    const warnings: string[] = [];

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
  async validatePortAvailability(port: number): Promise<ValidationResult> {
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
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'Port validation failed'
      };
    }
  }

  /**
   * Проверяет доступность порта
   */
  private async isPortAvailable(port: number): Promise<boolean> {
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