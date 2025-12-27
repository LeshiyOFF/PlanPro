import { ChildProcess } from 'child_process';

/**
 * Интерфейс для запуска Java приложений
 * Следует принципам Ports & Adapters из Clean Architecture
 */
export interface IJavaLauncher {
  /**
   * Запускает JAR файл
   * @param jarPath - путь к JAR файлу
   * @param args - аргументы командной строки
   * @param options - опции запуска
   * @returns Promise<JavaLaunchResult> - результат запуска
   */
  launchJar(jarPath: string, args?: string[], options?: JavaLaunchOptions): Promise<JavaLaunchResult>;

  /**
   * Запускает Java класс
   * @param className - имя класса для запуска
   * @param classpath - classpath
   * @param args - аргументы командной строки
   * @param options - опции запуска
   * @returns Promise<JavaLaunchResult> - результат запуска
   */
  launchClass(className: string, classpath: string, args?: string[], options?: JavaLaunchOptions): Promise<JavaLaunchResult>;

  /**
   * Запускает Java с произвольными аргументами
   * @param javaArgs - полная строка аргументов Java
   * @param options - опции запуска
   * @returns Promise<JavaLaunchResult> - результат запуска
   */
  launchCustom(javaArgs: string[], options?: JavaLaunchOptions): Promise<JavaLaunchResult>;

  /**
   * Останавливает Java процесс
   * @param process - процесс для остановки
   * @param timeout - таймаут для принудительного завершения
   * @returns Promise<boolean> - true если процесс успешно остановлен
   */
  stopProcess(process: ChildProcess, timeout?: number): Promise<boolean>;

  /**
   * Проверяет состояние процесса
   * @param process - процесс для проверки
   * @returns ProcessState - текущее состояние процесса
   */
  getProcessState(process: ChildProcess): ProcessState;

  /**
   * Получает информацию о запущенном процессе
   * @param process - процесс
   * @returns ProcessInfo | null - информация о процессе
   */
  getProcessInfo(process: ChildProcess): ProcessInfo | null;
}

/**
 * Опции запуска Java
 */
export interface JavaLaunchOptions {
  /** Рабочая директория */
  cwd?: string;
  /** Переменные окружения */
  env?: Record<string, string>;
  /** Таймаут запуска в миллисекундах */
  timeout?: number;
  /** Память JVM в мегабайтах */
  memory?: {
    min?: number;
    max?: number;
  };
  /** Дополнительные JVM опции */
  jvmOptions?: string[];
  /** Перенаправление вывода */
  redirectOutput?: boolean;
  /** Флаг автоматического перезапуска при падении */
  autoRestart?: boolean;
  /** Максимальное количество перезапусков */
  maxRestarts?: number;
}

/**
 * Результат запуска Java
 */
export interface JavaLaunchResult {
  /** Успешность запуска */
  success: boolean;
  /** Запущенный процесс */
  process?: ChildProcess;
  /** ID процесса */
  pid?: number;
  /** Время запуска в миллисекундах */
  startTime?: number;
  /** Сообщение об ошибке если есть */
  errorMessage?: string;
  /** Код ошибки если есть */
  errorCode?: number;
  /** Стандартный вывод */
  stdout?: string;
  /** Вывод ошибок */
  stderr?: string;
}

/**
 * Состояния процесса
 */
export enum ProcessState {
  /** Процесс не запущен */
  NOT_STARTED = 'not_started',
  /** Процесс запускается */
  STARTING = 'starting',
  /** Процесс работает */
  RUNNING = 'running',
  /** Процесс остановлен */
  STOPPED = 'stopped',
  /** Процесс завершился с ошибкой */
  ERROR = 'error',
  /** Процесс принудительно завершен */
  KILLED = 'killed'
}

/**
 * Информация о процессе
 */
export interface ProcessInfo {
  /** ID процесса */
  pid: number;
  /** Состояние процесса */
  state: ProcessState;
  /** Время запуска */
  startTime: number;
  /** Время работы в миллисекундах */
  uptime: number;
  /** Использование памяти (если доступно) */
  memoryUsage?: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  /** Количество перезапусков */
  restartCount: number;
  /** Последний код выхода */
  lastExitCode?: number;
  /** Последняя ошибка */
  lastError?: string;
}

/**
 * Конфигурация Java процесса
 */
export interface JavaProcessConfig {
  /** Путь к Java */
  javaPath: string;
  /** Путь к JAR файлу */
  jarPath?: string;
  /** Classpath */
  classpath?: string;
  /** Имя главного класса */
  mainClass?: string;
  /** Аргументы */
  args?: string[];
  /** Опции запуска */
  options?: JavaLaunchOptions;
}

/**
 * События жизненного цикла процесса
 */
export type ProcessEventHandler = {
  onStart?: (process: ChildProcess) => void;
  onStop?: (code: number | null, signal: string | null) => void;
  onError?: (error: Error) => void;
  onOutput?: (data: string, type: 'stdout' | 'stderr') => void;
  onRestart?: (attempt: number) => void;
};