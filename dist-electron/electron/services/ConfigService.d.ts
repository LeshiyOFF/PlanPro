import { JreType } from './interfaces/IJreManager';
/**
 * Сервис конфигурации приложения
 * Управляет настройками и путями к ресурсам
 * Следует принципу Single Responsibility из SOLID
 */
export declare class ConfigService {
    private readonly isDev;
    private readonly resourcesPath;
    private readonly userDataPath;
    private readonly jreManager;
    constructor();
    /**
     * Получение пути к ресурсам приложения
     */
    private getResourcesPath;
    /**
     * Получение пути к Java процессу
     */
    getJavaExecutablePath(): Promise<string | null>;
    /**
     * Получение пути к JAR файлу ProjectLibre
     */
    getProjectLibreJarPath(): string;
    /**
     * Получение информации о JRE
     */
    getJreInfo(): Promise<import("./interfaces/IJreManager").JreInfo | null>;
    /**
     * Получение типа JRE
     */
    getJreType(): Promise<JreType>;
    /**
     * Проверка доступности JRE
     */
    isJreAvailable(): Promise<boolean>;
    /**
     * Получение пути к файлу логов
     */
    getLogFilePath(): string;
    /**
     * Получение порта для Java REST API
     */
    getJavaApiPort(): number;
    /**
     * Получение URL для фронтенда в режиме разработки
     */
    getDevServerUrl(): string;
    /**
     * Проверка режима разработки
     */
    isDevelopmentMode(): boolean;
    /**
     * Получение пути к файлу конфигурации
     */
    getConfigFilePath(): string;
}
