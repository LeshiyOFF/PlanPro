/**
 * Валидатор параметров запуска Java процесса
 */
export class LaunchParameterValidator {
  /**
   * Валидация основных параметров запуска
   */
  public static validateLaunchParameters(classpath: string, mainClass: string): void {
    if (!classpath || classpath.trim().length === 0) {
      throw new Error('Classpath cannot be empty');
    }
    
    if (!mainClass || mainClass.trim().length === 0) {
      throw new Error('Main class cannot be empty');
    }
    
    if (!mainClass.includes('projectlibre.api')) {
      console.warn(`⚠️ Unexpected main class format: ${mainClass}. Expected projectlibre.api.*`);
    }
    
    if (!classpath.includes('projectlibre.jar') && !classpath.includes('projectlibre-api-final.jar')) {
      console.warn(`⚠️ Unexpected classpath format: ${classpath}. Expected projectlibre.jar or projectlibre-api-final.jar`);
    }
  }

  /**
   * Валидация путей к файлам
   */
  public static validatePath(path: string, pathType: string): void {
    if (!path || path.trim().length === 0) {
      throw new Error(`${pathType} cannot be empty`);
    }
  }

  /**
   * Валидация конфигурации портов
   */
  public static validatePorts(apiPort: number, managementPort: number): void {
    if (apiPort <= 0 || apiPort > 65535) {
      throw new Error(`Invalid API port: ${apiPort}`);
    }
    
    if (managementPort <= 0 || managementPort > 65535) {
      throw new Error(`Invalid management port: ${managementPort}`);
    }
    
    if (apiPort === managementPort) {
      console.warn(`⚠️ API and management ports should be different for security`);
    }
  }
}