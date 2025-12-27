"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaBridgeService = void 0;
const events_1 = require("events");
const JavaProcessManager_1 = require("./JavaProcessManager");
const JavaApiClient_1 = require("./JavaApiClient");
/**
 * Сервис для взаимодействия с Java backend
 * Управляет интеграцией между процессами и API клиентом
 */
class JavaBridgeService extends events_1.EventEmitter {
    processManager;
    apiClient;
    constructor(config) {
        super();
        this.processManager = new JavaProcessManager_1.JavaProcessManager(config);
        this.apiClient = new JavaApiClient_1.JavaApiClient(config.getJavaApiPort());
        this.setupProcessListeners();
    }
    /**
     * Инициализация сервиса
     */
    async initialize() {
        try {
            console.log('Initializing Java Bridge Service...');
            await this.processManager.start();
            console.log('Java Bridge Service initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize Java Bridge Service:', error);
            throw error;
        }
    }
    /**
     * Перезапуск Java процесса
     */
    async restart() {
        await this.cleanup();
        await this.initialize();
    }
    /**
     * Остановка Java процесса
     */
    async stop() {
        await this.processManager.stop();
    }
    /**
     * Очистка ресурсов
     */
    async cleanup() {
        try {
            await this.processManager.stop();
            console.log('Java Bridge Service cleaned up successfully');
        }
        catch (error) {
            console.error('Failed to cleanup Java Bridge Service:', error);
        }
    }
    /**
     * Получение статуса Java процесса
     */
    getStatus() {
        return this.processManager.getStatus();
    }
    /**
     * Проверка здоровья Java процесса
     */
    async checkHealth() {
        return await this.processManager.checkHealth();
    }
    /**
     * Получение API клиента
     */
    getApiClient() {
        return this.apiClient;
    }
    /**
     * Настройка слушателей событий
     */
    setupProcessListeners() {
        this.processManager.on('started', () => {
            console.log('Java process started event received');
            this.emit('javaProcessStarted');
        });
        this.processManager.on('stopped', () => {
            console.log('Java process stopped event received');
            this.emit('javaProcessStopped');
        });
        this.processManager.on('status', (status) => {
            this.emit('statusChange', status);
        });
    }
}
exports.JavaBridgeService = JavaBridgeService;
//# sourceMappingURL=JavaBridgeService.js.map