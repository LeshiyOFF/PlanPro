import { BrowserWindow } from 'electron';
import { ConfigService } from './ConfigService';
/**
 * Менеджер окон приложения
 * Управляет созданием и конфигурацией окон
 */
export declare class WindowManager {
    private mainWindow;
    private readonly config;
    constructor(config: ConfigService);
    /**
     * Создание главного окна приложения
     */
    createMainWindow(): BrowserWindow;
    /**
     * Настройка событий главного окна
     */
    private setupMainWindowEvents;
    /**
     * Загрузка содержимого главного окна
     */
    private loadMainWindowContent;
    /**
     * Получение пути к иконке приложения
     */
    private getAppIconPath;
    /**
     * Получение главного окна
     */
    getMainWindow(): BrowserWindow | null;
    /**
     * Проверка наличия главного окна
     */
    hasMainWindow(): boolean;
    /**
     * Закрытие главного окна
     */
    closeMainWindow(): void;
    /**
     * Фокусировка на главном окне
     */
    focusMainWindow(): void;
}
