import { ChildProcess } from 'child_process';
import { JavaLaunchOptions } from './JavaLauncher';
import { JreManager } from './JreManager';
import { JavaExecutableValidator } from './validators/JavaExecutableValidator';
import { JarFileValidator } from './validators/JarFileValidator';
import { ValidationResult, ValidationOptions, ValidationDetails } from './interfaces/ValidationInterfaces';

/**
 * Валидатор Java процессов
 * Следует принципу Single Responsibility из SOLID
 */
export class JavaProcessValidator {
  private readonly jreManager: JreManager;
  private readonly javaValidator: JavaExecutableValidator;
  private readonly jarValidator: JarFileValidator;
  
  constructor() {
    this.jreManager = new JreManager();
    this.javaValidator = new JavaExecutableValidator();
    this.jarValidator = new JarFileValidator();
  }

  /**
   * Валидирует параметры запуска Java процесса
   */
  async validateLaunchConfig(
    jarPath: string,
    options: Partial<JavaLaunchOptions> = {},
    vOptions: ValidationOptions = {}
  ): Promise<ValidationResult> {
    try {
      const warnings: string[] = [];
      const details: ValidationDetails = {
        javaValid: false, jarValid: false, portAvailable: true,
        memorySufficient: true, versionCompatible: false
      };

      const javaVal = await this.javaValidator.validateJavaExecutable();
      details.javaValid = javaVal.isValid;
      if (!javaVal.isValid) return { isValid: false, errorMessage: javaVal.errorMessage, warnings, details };
      if (javaVal.warnings) warnings.push(...javaVal.warnings);

      if (vOptions.checkVersion !== false) {
        const vVal = await this.javaValidator.validateJavaVersion();
        details.versionCompatible = vVal.isValid;
        if (!vVal.isValid) return { isValid: false, errorMessage: vVal.errorMessage, warnings, details };
        if (vVal.warnings) warnings.push(...vVal.warnings);
      }

      if (vOptions.checkJar !== false) {
        const jVal = await this.jarValidator.validateJarFile(jarPath);
        details.jarValid = jVal.isValid;
        if (!jVal.isValid) return { isValid: false, errorMessage: jVal.errorMessage, warnings, details };
        if (jVal.warnings) warnings.push(...jVal.warnings);
      } else details.jarValid = true;

      const port = this.extractPortFromArgs(options);
      if (vOptions.checkPort !== false && port) {
        const pVal = await this.jarValidator.validatePortAvailability(port);
        details.portAvailable = pVal.isValid;
        if (!pVal.isValid) return { isValid: false, errorMessage: pVal.errorMessage, warnings, details };
        if (pVal.warnings) warnings.push(...pVal.warnings);
      }

      return { isValid: true, warnings: warnings.length > 0 ? warnings : undefined, details };
    } catch (error) {
      return { isValid: false, errorMessage: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Валидирует запущенный процесс
   */
  async validateRunningProcess(process: ChildProcess, timeout: number = 10000): Promise<ValidationResult> {
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
  validateEnvironment(env?: Record<string, string>): ValidationResult {
    if (!env) {
      return { isValid: true };
    }

    const warnings: string[] = [];

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
  private extractPortFromArgs(options: Partial<JavaLaunchOptions>): number | null {
    const jvmOptions = options.jvmOptions || [];
    for (const option of jvmOptions) {
      const match = option.match(/-D(?:server\.)?port(?:=)?(\d+)/);
      if (match) return parseInt(match[1] || '0', 10);
    }

    const args = options.args ?? [];
    for (const arg of args) {
      const match = arg.match(/--server\.port(?:=)?(\d+)/);
      if (match) return parseInt(match[1] || '0', 10);
    }

    return null;
  }
}