import { EventEmitter } from 'events';
import { ConfigService } from './ConfigService';
import { JavaApiClient } from './JavaApiClient';
/**
 * Сервис для взаимодействия с Java backend
 * Управляет интеграцией между процессами и API клиентом
 */
export declare class JavaBridgeService extends EventEmitter {
    private readonly processManager;
    private readonly apiClient;
    constructor(config: ConfigService);
    /**
     * Инициализация сервиса
     */
    initialize(): Promise<void>;
    /**
     * Перезапуск Java процесса
     */
    restart(): Promise<void>;
    /**
     * Остановка Java процесса
     */
    stop(): Promise<void>;
    /**
     * Очистка ресурсов
     */
    cleanup(): Promise<void>;
    /**
     * Получение статуса Java процесса
     */
    getStatus(): any;
    /**
     * Проверка здоровья Java процесса
     */
    checkHealth(): Promise<boolean>;
    /**
     * Получение API клиента
     */
    getApiClient(): JavaApiClient;
    /**
     * Настройка слушателей событий
     */
    private setupProcessListeners;
}
