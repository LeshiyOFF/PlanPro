import { JreManager } from '../JreManager';
import { ValidationResult } from '../interfaces/ValidationInterfaces';

/**
 * Валидатор Java executable
 * Следует принципу Single Responsibility из SOLID
 */
export class JavaExecutableValidator {
  private readonly jreManager: JreManager;
  
  constructor() {
    this.jreManager = new JreManager();
  }

  /**
   * Валидирует Java executable
   */
  async validateJavaExecutable(): Promise<ValidationResult> {
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
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'Java validation failed'
      };
    }
  }

  /**
   * Валидирует версию Java
   */
  async validateJavaVersion(): Promise<ValidationResult> {
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
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'Java version validation failed'
      };
    }
  }
}