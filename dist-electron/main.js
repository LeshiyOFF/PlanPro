"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const WindowManager_1 = require("./services/WindowManager");
const MenuService_1 = require("./services/MenuService");
const JavaBridgeService_1 = require("./services/JavaBridgeService");
const ConfigService_1 = require("./services/ConfigService");
/**
 * Основной класс приложения ProjectLibre Electron
 * Реализует SOLID принципы через разделение ответственности
 */
class ProjectLibreApp {
    windowManager;
    menuService;
    javaBridge;
    config;
    constructor() {
        this.config = new ConfigService_1.ConfigService();
        this.windowManager = new WindowManager_1.WindowManager(this.config);
        this.menuService = new MenuService_1.MenuService();
        this.javaBridge = new JavaBridgeService_1.JavaBridgeService(this.config);
        this.initializeEventHandlers();
    }
    /**
     * Инициализация обработчиков событий приложения
     */
    initializeEventHandlers() {
        electron_1.app.whenReady().then(() => this.onReady());
        electron_1.app.on('window-all-closed', () => this.onAllWindowsClosed());
        electron_1.app.on('activate', () => this.onActivate());
        electron_1.app.on('before-quit', () => this.onBeforeQuit());
    }
    /**
     * Обработчик готовности приложения
     */
    async onReady() {
        try {
            await this.javaBridge.initialize();
            this.windowManager.createMainWindow();
            this.menuService.setupMenu();
            this.setupIpcHandlers();
        }
        catch (error) {
            this.handleError(error);
        }
    }
    /**
     * Обработчик закрытия всех окон
     */
    onAllWindowsClosed() {
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    }
    /**
     * Обработчик активации приложения (macOS)
     */
    onActivate() {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            this.windowManager.createMainWindow();
        }
    }
    /**
     * Обработчик перед выходом из приложения
     */
    async onBeforeQuit() {
        await this.javaBridge.cleanup();
    }
    /**
     * Настройка IPC обработчиков
     */
    setupIpcHandlers() {
        electron_1.ipcMain.handle('java-execute', async (_, command, args) => {
            return await this.javaBridge.execute(command, args);
        });
        electron_1.ipcMain.handle('get-app-version', () => {
            return electron_1.app.getVersion();
        });
        electron_1.ipcMain.handle('show-message-box', async (_, options) => {
            return await electron_1.dialog.showMessageBox(options);
        });
        electron_1.ipcMain.handle('open-external', async (_, url) => {
            await electron_1.shell.openExternal(url);
        });
    }
    /**
     * Централизованный обработчик ошибок
     */
    handleError(error) {
        console.error('Application error:', error);
        this.showErrorMessage(error.message);
        electron_1.app.quit();
    }
    /**
     * Отображение сообщения об ошибке
     */
    showErrorMessage(message) {
        if (this.windowManager.hasMainWindow()) {
            electron_1.dialog.showErrorBox('ProjectLibre Error', message);
        }
    }
}
/**
 * Создание и запуск экземпляра приложения
 */
new ProjectLibreApp();
//# sourceMappingURL=main.js.map