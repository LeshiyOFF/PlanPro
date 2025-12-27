"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const electron_1 = require("electron");
const path_1 = require("path");
/**
 * Сервис конфигурации приложения
 * Управляет настройками и путями к ресурсам
 */
class ConfigService {
    isDev;
    resourcesPath;
    userDataPath;
    constructor() {
        this.isDev = process.env.NODE_ENV === 'development';
        this.userDataPath = electron_1.app.getPath('userData');
        this.resourcesPath = this.getResourcesPath();
    }
    /**
     * Получение пути к ресурсам приложения
     */
    getResourcesPath() {
        if (this.isDev) {
            return (0, path_1.join)(__dirname, '../../resources');
        }
        return process.resourcesPath;
    }
    /**
     * Получение пути к Java процессу
     */
    getJavaExecutablePath() {
        const javaPath = (0, path_1.join)(this.resourcesPath, 'jre', 'bin');
        const executable = process.platform === 'win32' ? 'java.exe' : 'java';
        return (0, path_1.join)(javaPath, executable);
    }
    /**
     * Получение пути к JAR файлу ProjectLibre
     */
    getProjectLibreJarPath() {
        return (0, path_1.join)(this.resourcesPath, 'projectlibre.jar');
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