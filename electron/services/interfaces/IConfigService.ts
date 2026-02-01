/**
 * Интерфейс для конфигурации сервиса
 * Следует принципу Interface Segregation из SOLID
 */
export interface IConfigService {
  getJavaApiPort(): number;
  getJavaPort(): number;
  isDevelopment(): boolean;
  getResourcesPath(): string;
  getClasspath(): string;
  getMainClass(): string;
  getJrePath(): string;
  getDefaultJvmArgs(): string[];
  validateJavaFiles(): { valid: boolean; error?: string };
  resolveAvailablePorts(): Promise<void>;
  isExecutableJarMode(): boolean;
  getExecutableJarPath(): string | null;
}
