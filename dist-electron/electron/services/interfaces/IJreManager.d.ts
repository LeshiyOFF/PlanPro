/**
 * Интерфейс для управления JRE (Java Runtime Environment)
 * Следует принципам Ports & Adapters из Clean Architecture
 */
export interface IJreManager {
    /**
     * Проверяет наличие JRE
     * @returns Promise<boolean> - true если JRE доступно
     */
    isJreAvailable(): Promise<boolean>;
    /**
     * Получает путь к исполняемому файлу Java
     * @returns Promise<string | null> - путь к java.exe или null если не найдено
     */
    getJavaExecutablePath(): Promise<string | null>;
    /**
     * Получает версию Java
     * @param javaPath - опциональный путь к Java для проверки
     * @returns Promise<string | null> - версия Java или null если не удалось определить
     */
    getJavaVersion(javaPath?: string): Promise<string | null>;
    /**
     * Проверяет совместимость версии Java с требуемой
     * @param version - версия Java для проверки
     * @returns boolean - true если версия совместима
     */
    isJavaVersionCompatible(version: string): boolean;
    /**
     * Получает информацию о JRE
     * @returns Promise<JreInfo | null> - детальная информация о JRE
     */
    getJreInfo(): Promise<JreInfo | null>;
    /**
     * Проверяет валидность JRE (запускаемость и базовую функциональность)
     * @param javaPath - опциональный путь к Java для проверки
     * @returns Promise<boolean> - true если JRE валидно
     */
    validateJre(javaPath?: string): Promise<boolean>;
    /**
     * Получает тип JRE (embedded или system)
     * @returns Promise<JreType> - тип JRE
     */
    getJreType(): Promise<JreType>;
}
/**
 * Информация о JRE
 */
export interface JreInfo {
    /** Путь к исполняемому файлу Java */
    executablePath: string;
    /** Версия Java */
    version: string;
    /** Тип JRE */
    type: JreType;
    /** Путь к домашней директории JRE */
    homePath: string;
    /** Архитектура (x86, x64) */
    architecture: string;
    /** Валидно ли JRE */
    isValid: boolean;
}
/**
 * Типы JRE
 */
export declare enum JreType {
    /** Встроенное JRE */
    EMBEDDED = "embedded",
    /** Системное JRE */
    SYSTEM = "system",
    /** JRE не найдено */
    NONE = "none"
}
/**
 * Результаты поиска JRE
 */
export interface JreSearchResult {
    /** Найденные JRE */
    jreList: JreInfo[];
    /** Рекомендуемое JRE */
    recommendedJre: JreInfo | null;
    /** Успешность поиска */
    success: boolean;
    /** Сообщение об ошибке если есть */
    errorMessage?: string;
}
