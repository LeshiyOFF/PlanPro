"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowManager = void 0;
const electron_1 = require("electron");
const path_1 = require("path");
/**
 * Менеджер окон приложения
 * Управляет созданием и конфигурацией окон
 */
class WindowManager {
    mainWindow = null;
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Создание главного окна приложения
     */
    createMainWindow() {
        const { width, height } = electron_1.screen.getPrimaryDisplay().workAreaSize;
        const mainWindowConfig = {
            width: Math.min(1400, width - 100),
            height: Math.min(900, height - 100),
            minWidth: 1024,
            minHeight: 768,
            show: false,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: (0, path_1.join)(__dirname, '../preload.js'),
                webSecurity: true
            },
            icon: this.getAppIconPath(),
            titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
        };
        this.mainWindow = new electron_1.BrowserWindow(mainWindowConfig);
        this.setupMainWindowEvents();
        this.loadMainWindowContent();
        return this.mainWindow;
    }
    /**
     * Настройка событий главного окна
     */
    setupMainWindowEvents() {
        if (!this.mainWindow)
            return;
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow?.show();
            this.mainWindow?.focus();
            if (this.config.isDevelopmentMode()) {
                this.mainWindow?.webContents.openDevTools();
            }
        });
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
        this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            require('electron').shell.openExternal(url);
            return { action: 'deny' };
        });
    }
    /**
     * Загрузка содержимого главного окна
     */
    loadMainWindowContent() {
        if (!this.mainWindow)
            return;
        if (this.config.isDevelopmentMode()) {
            this.mainWindow.loadURL(this.config.getDevServerUrl());
        }
        else {
            this.mainWindow.loadFile((0, path_1.join)(__dirname, '../dist/index.html'));
        }
    }
    /**
     * Получение пути к иконке приложения
     */
    getAppIconPath() {
        const iconFormats = {
            win32: 'icon.ico',
            darwin: 'icon.icns',
            linux: 'icon.png'
        };
        const iconFile = iconFormats[process.platform];
        if (!iconFile)
            return undefined;
        return (0, path_1.join)(__dirname, '../../assets', iconFile);
    }
    /**
     * Получение главного окна
     */
    getMainWindow() {
        return this.mainWindow;
    }
    /**
     * Проверка наличия главного окна
     */
    hasMainWindow() {
        return this.mainWindow !== null && !this.mainWindow.isDestroyed();
    }
    /**
     * Закрытие главного окна
     */
    closeMainWindow() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.close();
        }
    }
    /**
     * Фокусировка на главном окне
     */
    focusMainWindow() {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            if (this.mainWindow.isMinimized()) {
                this.mainWindow.restore();
            }
            this.mainWindow.focus();
        }
    }
}
exports.WindowManager = WindowManager;
//# sourceMappingURL=WindowManager.js.map