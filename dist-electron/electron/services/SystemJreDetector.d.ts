import { JreInfo } from './interfaces/IJreManager';
/**
 * Детектор системной Java Runtime Environment
 * Следует принципу Single Responsibility из SOLID
 */
export declare class SystemJreDetector {
    private readonly platform;
    private readonly javaExecutableNames;
    constructor();
    /**
     * Получает имена исполняемых файлов Java для текущей платформы
     */
    private getJavaExecutableNames;
    /**
     * Ищет системные установки Java
     */
    findSystemJavaInstallations(): Promise<JreInfo[]>;
    /**
     * Проверяет доступность Java в PATH
     */
    isJavaInPath(): Promise<boolean>;
    /**
     * Получает путь к Java из PATH
     */
    getJavaFromPath(): Promise<string | null>;
    /**
     * Получает информацию о JRE по пути к исполняемому файлу
     */
    getJreInfo(javaPath: string): Promise<JreInfo | null>;
    /**
     * Получает версию Java
     */
    getJavaVersion(javaPath: string): Promise<string | null>;
    /**
     * Получает архитектуру Java
     */
    getJavaArchitecture(javaPath: string): Promise<string | null>;
    /**
     * Валидирует исполняемый файл Java
     */
    validateJavaExecutable(javaPath: string): Promise<boolean>;
    /**
     * Получает пути поиска системной Java
     */
    private getSystemJavaSearchPaths;
    /**
     * Ищет Java в указанном пути
     */
    private searchJavaInPath;
    /**
     * Ищет исполняемый файл Java в директории
     */
    private findJavaExecutable;
    /**
     * Получает JAVA_HOME из переменных окружения
     */
    private getJavaHome;
    /**
     * Удаляет дубликаты из списка JRE
     */
    private deduplicateJreList;
}
