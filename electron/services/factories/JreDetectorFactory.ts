import { JreInfo, ISystemJreDetector } from '../interfaces/CommonTypes';

/**
 * Фабрика для создания дефолтных детекторов JRE
 */
export class JreDetectorFactory {
  /**
   * Создание дефолтного системного детектора JRE
   */
  public static createDefaultJreDetector(): ISystemJreDetector {
    return {
      detectSystemJre: async (): Promise<JreInfo | null> => {
        return {
          version: '1.8.0',
          path: '/usr/bin/java',
          vendor: 'OpenJDK',
          architecture: 'x64',
          executablePath: '/usr/bin/java',
          type: 'system',
          homePath: '/usr/lib/jvm',
          isValid: true
        };
      },
      isJavaInPath: async (): Promise<boolean> => true,
      getJavaFromPath: async (): Promise<JreInfo | null> => null,
      findSystemJavaInstallations: async (): Promise<JreInfo[]> => [],
      getJreInfo: async (pathToCheck: string): Promise<JreInfo | null> => {
        return {
          version: '1.8.0',
          path: pathToCheck,
          vendor: 'OpenJDK',
          architecture: 'x64',
          executablePath: `${pathToCheck}/bin/java`,
          type: 'system',
          homePath: pathToCheck,
          isValid: true
        };
      },
      validateJavaExecutable: async (pathToValidate: string): Promise<boolean> => true,
      validatePortAvailability: async (port: number): Promise<boolean> => port > 0 && port < 65535
    };
  }
}