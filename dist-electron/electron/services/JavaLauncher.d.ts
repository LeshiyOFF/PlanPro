import { ChildProcess } from 'child_process';
import { IJavaLauncher, JavaLaunchOptions, JavaLaunchResult, ProcessState, ProcessInfo, ProcessEventHandler, JavaProcessConfig } from './interfaces/IJavaLauncher';
/**
 * Сервис запуска Java приложений
 * Реализует интерфейс IJavaLauncher согласно принципам Clean Architecture
 * Следует принципу Single Responsibility из SOLID
 */
export declare class JavaLauncher implements IJavaLauncher {
    private readonly jreManager;
    private readonly activeProcesses;
    constructor();
    /**
     * Запускает JAR файл
     */
    launchJar(jarPath: string, args?: string[], options?: JavaLaunchOptions): Promise<JavaLaunchResult>;
    /**
     * Запускает Java класс
     */
    launchClass(className: string, classpath: string, args?: string[], options?: JavaLaunchOptions): Promise<JavaLaunchResult>;
    /**
     * Запускает Java с произвольными аргументами
     */
    launchCustom(javaArgs: string[], options?: JavaLaunchOptions): Promise<JavaLaunchResult>;
    /**
     * Останавливает Java процесс
     */
    stopProcess(process: ChildProcess, timeout?: number): Promise<boolean>;
    /**
     * Проверяет состояние процесса
     */
    getProcessState(process: ChildProcess): ProcessState;
    /**
     * Получает информацию о запущенном процессе
     */
    getProcessInfo(process: ChildProcess): ProcessInfo | null;
    /**
     * Запускает Java процесс с настройками
     */
    launchWithConfig(config: JavaProcessConfig, eventHandlers?: ProcessEventHandler): Promise<JavaLaunchResult>;
    /**
     * Запускает Java процесс
     */
    private launchJavaProcess;
    /**
     * Строит аргументы для запуска JAR
     */
    private buildJarArgs;
    /**
     * Строит аргументы для запуска класса
     */
    private buildClassArgs;
    /**
     * Устанавливает обработчики событий процесса
     */
    private setupEventHandlers;
    /**
     * Получает все активные процессы
     */
    getActiveProcesses(): ProcessInfo[];
    /**
     * Останавливает все активные процессы
     */
    stopAllProcesses(): Promise<boolean[]>;
}
