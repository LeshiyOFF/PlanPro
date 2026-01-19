

import { ChildProcess } from 'child_process';

/**
 * Интерфейс для информации о JRE
 */
export interface JreInfo {
  version: string;
  path: string;
  vendor: string;
  architecture: string;
  executablePath?: string;
  type?: string;
  homePath?: string;
  isValid?: boolean;
}

/**
 * Расширенный интерфейс JRE информации
 */
export interface ExtendedJreInfo extends JreInfo {
  type: 'system' | 'embedded' | 'custom';
  homePath: string;
  executablePath: string;
  isValid: true;
}

/**
 * Опции запуска Java процесса
 */
export interface JavaLaunchOptions {
  port: number;
  classpath: string;
  mainClass: string;
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  memory?: number;
  jvmOptions?: string[];
}

/**
 * Опции запуска JAR файла
 */
export interface JarLaunchOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  memory?: number;
  jvmOptions?: string[];
  redirectOutput?: boolean;
}

/**
 * Информация о процессе
 */
export interface ProcessInfo {
  pid: number;
  port: number;
  startTime: Date;
  success?: boolean;
  process?: ChildProcess;
  errorMessage?: string;
}

/**
 * Расширенная информация о процессе
 */
export interface ExtendedProcessInfo extends ProcessInfo {
  success: true;
  process: ChildProcess;
  errorMessage?: string;
  memoryUsage?: number;
  cpuUsage?: number;
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
 * Интерфейс для детектора JRE
 */
export interface ISystemJreDetector {
  detectSystemJre(): Promise<JreInfo | null>;
  isJavaInPath(): Promise<boolean>;
  getJavaFromPath(): Promise<JreInfo | null>;
  findSystemJavaInstallations(): Promise<JreInfo[]>;
  getJreInfo?(pathToCheck: string): Promise<JreInfo | null>;
  validateJavaExecutable?(pathToValidate: string): Promise<boolean>;
  validatePortAvailability?(port: number): Promise<boolean>;
}

/**
 * Интерфейс для тестирования командной строки
 */
export interface ICommandLineTester {
  testBasicJava(): Promise<void>;
  isJavaInPath(): Promise<boolean>;
  getJavaFromPath(): Promise<JreInfo | null>;
}

/**
 * Интерфейс для валидации JAR файлов
 */
export interface IJarFileValidator {
  validateFile(filePath: string): Promise<ValidationResult>;
  validateStructure(filePath: string): Promise<ValidationResult>;
  validateMemoryOptions?(memory: number): ValidationResult;
  validateJarFile?(filePath: string): Promise<ValidationResult>;
  validatePortAvailability?(port: number): Promise<boolean>;
}

/**
 * Интерфейс для запуска Java процессов
 */
export interface IJavaLauncher {
  launch(options: JavaLaunchOptions): Promise<ProcessInfo>;
  stop(pid: number): Promise<void>;
  launchJar?(jarPath: string, args?: string[], options?: JarLaunchOptions): Promise<ProcessInfo>;
  checkJavaAvailability?(): Promise<boolean>;
  getJavaVersion?(): Promise<string>;
  validateLaunchOptions?(options: JavaLaunchOptions): ValidationResult;
}

/**
 * Интерфейс для управления JRE
 */
export interface IJreManager {
  detectJava(): Promise<JreInfo[]>;
  getJavaExecutablePath(): Promise<string>;
  getRecommendedJre(): Promise<JreInfo | null>;
  getJreInfo(javaPath: string): Promise<JreInfo>;
  validateJre(javaPath: string): Promise<boolean>;
  isJavaVersionCompatible(version: string): boolean;
  compareVersions(v1: string, v2: string): number;
  normalizeVersion(version: string): string;
  findBestJre(jreList: JreInfo[]): JreInfo | null;
}

/**
 * Типы JRE
 */
export enum JreType {
  NONE = 'none',
  SYSTEM = 'system',
  EMBEDDED = 'embedded',
  CUSTOM = 'custom'
}

/**
 * Результат поиска JRE
 */
export interface JreSearchResult {
  systemJre: JreInfo[];
  embeddedJre: JreInfo | null;
  customJre: JreInfo[];
  recommendedJre: JreInfo | null;
}