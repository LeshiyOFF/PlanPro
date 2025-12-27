import { EventEmitter } from 'events';
import { ConfigService } from './ConfigService';
/**
 * Менеджер Java процесса
 * Следует принципу Single Responsibility из SOLID
 * Использует новые сервисы для управления Java процессами
 */
export declare class JavaProcessManager extends EventEmitter {
    private javaLauncher;
    private validator;
    private commandLineTester;
    private config;
    private status;
    constructor(config: ConfigService);
    /**
     * Запуск Java процесса
     */
    start(): Promise<void>;
    /**
     * Остановка Java процесса
     */
    stop(): Promise<void>;
    /**
     * Получение статуса
     */
    getStatus(): any;
    /**
     * Проверка доступности Java процесса
     */
    checkHealth(): Promise<boolean>;
    /**
     * Получение порта
     */
    getPort(): number;
    /**
     * Проверка, запущен ли процесс
     */
    isRunning(): boolean;
    /**
     * Настройка обработчиков событий процесса
     */
    private setupProcessHandlers;
    /**
     * Запуск командной строки тестирования
     */
    runCommandLineTest(): Promise<void>;
    /**
     * Получение информации о JRE
     */
    getJreInfo(): Promise<any>;
    /**
     * Проверка доступности JRE
     */
    isJreAvailable(): Promise<boolean>;
}
