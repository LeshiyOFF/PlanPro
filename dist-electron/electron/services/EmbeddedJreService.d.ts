import { JreInfo } from './interfaces/IJreManager';
/**
 * Сервис для работы с встроенным JRE (Java Runtime Environment)
 * Следует принципу Single Responsibility из SOLID
 */
export declare class EmbeddedJreService {
    private readonly resourcesPath;
    private readonly isDev;
    private readonly platform;
    constructor();
    /**
     * Получает путь к ресурсам приложения
     */
    private getResourcesPath;
    /**
     * Проверяет наличие встроенного JRE
     */
    isEmbeddedJreAvailable(): Promise<boolean>;
    /**
     * Получает путь к встроенному Java
     */
    getEmbeddedJavaPath(): Promise<string | null>;
    /**
     * Получает путь к директории встроенного JRE
     */
    private getEmbeddedJrePath;
    /**
     * Получает имя исполняемого файла Java для текущей платформы
     */
    private getJavaExecutableName;
    /**
     * Получает информацию о встроенном JRE
     */
    getEmbeddedJreInfo(): Promise<JreInfo | null>;
    /**
     * Получает версию Java
     */
    private getJavaVersion;
    /**
     * Получает архитектуру Java
     */
    private getJavaArchitecture;
    /**
     * Валидирует встроенное JRE
     */
    validateEmbeddedJre(javaPath?: string): Promise<boolean>;
    /**
     * Валидирует наличие необходимых библиотек JRE
     */
    private validateJreLibraries;
    /**
     * Получает список необходимых файлов JRE для текущей платформы
     */
    private getRequiredJreFiles;
    /**
     * Создает структуру директорий для встроенного JRE
     */
    createEmbeddedJreStructure(): Promise<boolean>;
    /**
     * Проверяет целостность встроенного JRE
     */
    checkEmbeddedJreIntegrity(): Promise<boolean>;
    /**
     * Получает размер встроенного JRE в байтах
     */
    getEmbeddedJreSize(): Promise<number>;
    /**
     * Рекурсивно вычисляет размер директории
     */
    private calculateDirectorySize;
    /**
     * Получает информацию о доступном месте на диске
     */
    getAvailableDiskSpace(): Promise<number>;
}
