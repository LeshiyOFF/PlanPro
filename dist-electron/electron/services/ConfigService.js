"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const electron_1 = require("electron");
const path_1 = require("path");
const JreManager_1 = require("./JreManager");
const IJreManager_1 = require("./interfaces/IJreManager");
/**
 * Сервис конфигурации приложения
 * Управляет настройками и путями к ресурсам
 * Следует принципу Single Responsibility из SOLID
 */
class ConfigService {
    isDev;
    resourcesPath;
    userDataPath;
    jreManager;
    constructor() {
        this.isDev = process.env.NODE_ENV === 'development';
        this.userDataPath = electron_1.app.getPath('userData');
        this.resourcesPath = this.getResourcesPath();
        this.jreManager = new JreManager_1.JreManager();
    }
    /**
     * Получение пути к ресурсам приложения
     */
    getResourcesPath() {
        if (this.isDev) {
            return (0, path_1.join)(__dirname, '../../resources');
        }
        return process.resourcesPath || this.resourcesPath;
    }
    /**
     * Получение пути к Java процессу
     */
    async getJavaExecutablePath() {
        try {
            return await this.jreManager.getJavaExecutablePath();
        }
        catch {
            return null;
        }
    }
    /**
     * Получение пути к JAR файлу ProjectLibre
     */
    getProjectLibreJarPath() {
        if (this.isDev) {
            // В режиме разработки используем JAR из директории сборки
            return (0, path_1.join)(__dirname, '../../projectlibre_build/dist/projectlibre.jar');
        }
        // В production используем JAR из ресурсов приложения
        return (0, path_1.join)(process.resourcesPath || this.resourcesPath, 'java/projectlibre.jar');
    }
    /**
     * Получение информации о JRE
     */
    async getJreInfo() {
        try {
            return await this.jreManager.getJreInfo();
        }
        catch {
            return null;
        }
    }
    /**
     * Получение типа JRE
     */
    async getJreType() {
        try {
            return await this.jreManager.getJreType();
        }
        catch {
            return IJreManager_1.JreType.NONE;
        }
    }
    /**
     * Проверка доступности JRE
     */
    async isJreAvailable() {
        try {
            return await this.jreManager.isJreAvailable();
        }
        catch {
            return false;
        }
    }
    /**
     * Получение пути к файлу логов
     */
    getLogFilePath() {
        return (0, path_1.join)(this.userDataPath, 'logs', 'projectlibre.log');
    }
    /**
     * Получение порта для Java REST API
     */
    getJavaApiPort() {
        return 8080;
    }
    /**
     * Получение URL для фронтенда в режиме разработки
     */
    getDevServerUrl() {
        return 'http://localhost:5173';
    }
    /**
     * Проверка режима разработки
     */
    isDevelopmentMode() {
        return this.isDev;
    }
    /**
     * Получение пути к файлу конфигурации
     */
    getConfigFilePath() {
        return (0, path_1.join)(this.userDataPath, 'config.json');
    }
}
exports.ConfigService = ConfigService;
//# sourceMappingURL=ConfigService.js.map