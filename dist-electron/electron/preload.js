"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
/**
 * Создание и регистрация безопасного API
 */
const electronAPI = {
    // Java взаимодействие
    javaExecute: (command, args) => electron_1.ipcRenderer.invoke('java-execute', command, args || []),
    // Системные функции
    getAppVersion: () => electron_1.ipcRenderer.invoke('get-app-version'),
    showMessageBox: (options) => electron_1.ipcRenderer.invoke('show-message-box', options),
    openExternal: (url) => electron_1.ipcRenderer.invoke('open-external', url),
    // События
    onJavaStarted: (callback) => {
        electron_1.ipcRenderer.on('java-started', callback);
    },
    onJavaStopped: (callback) => {
        electron_1.ipcRenderer.on('java-stopped', callback);
    },
    onJavaError: (callback) => {
        electron_1.ipcRenderer.on('java-error', (_, error) => callback(error));
    },
    // Удаление слушателей
    removeAllListeners: (channel) => {
        electron_1.ipcRenderer.removeAllListeners(channel);
    }
};
/**
 * Регистрация API в глобальном контексте
 */
electron_1.contextBridge.exposeInMainWorld('electronAPI', electronAPI);
/**
 * Вспомогательные утилиты для renderer процесса
 */
const utils = {
    /**
     * Получение информации о приложении
     */
    async getAppInfo() {
        const version = globalThis.electronAPI ?
            await globalThis.electronAPI.getAppVersion() :
            'Unknown';
        return {
            version,
            platform: 'Unknown'
        };
    }
};
// Экспорт утилит для использования в приложении
electron_1.contextBridge.exposeInMainWorld('appUtils', utils);
//# sourceMappingURL=preload.js.map