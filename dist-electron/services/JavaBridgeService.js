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
     * Инициализация Java backend
     */
    async initialize() {
        try {
            await this.processManager.start();
            this.emit('started');
        }
        catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    /**
     * Выполнение команды через Java API
     */
    async execute(command, args = []) {
        if (!this.processManager.isRunning()) {
            throw new Error('Java process is not running');
        }
        try {
            const response = await this.apiClient.makeRequest(command, args);
            return response;
        }
        catch (error) {
            this.emit('api-error', error);
            throw error;
        }
    }
    /**
     * Получение текущего статуса Java процесса
     */
    getStatus() {
        return this.processManager.getStatus();
    }
    /**
     * Проверка работает ли Java процесс
     */
    isRunning() {
        return this.processManager.isRunning();
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
     * Очистка ресурсов при закрытии приложения
     */
    async cleanup() {
        try {
            await this.stop();
        }
        catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
    /**
     * Отправка данных в Java процесс
     */
    sendData(data) {
        console.log('Sending data to Java process:', data);
    }
    /**
     * Настройка слушателей событий процесса
     */
    setupProcessListeners() {
        this.processManager.on('started', () => {
            this.emit('started');
        });
        this.processManager.on('stopped', () => {
            this.emit('stopped');
        });
        this.processManager.on('error', (error) => {
            this.emit('error', error);
        });
    }
}
exports.JavaBridgeService = JavaBridgeService;
//# sourceMappingURL=JavaBridgeService.js.map