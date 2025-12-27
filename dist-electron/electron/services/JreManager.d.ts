import { IJreManager, JreInfo, JreType, JreSearchResult } from './interfaces/IJreManager';
/**
 * Основной сервис управления JRE (Java Runtime Environment)
 * Реализует интерфейс IJreManager согласно принципам Clean Architecture
 * Следует принципу Dependency Inversion из SOLID
 */
export declare class JreManager implements IJreManager {
    private readonly systemJreDetector;
    private readonly embeddedJreService;
    private readonly minJavaVersion;
    private readonly maxJavaVersion;
    constructor();
    /**
     * Проверяет наличие JRE
     */
    isJreAvailable(): Promise<boolean>;
    /**
     * Получает путь к исполняемому файлу Java
     */
    getJavaExecutablePath(): Promise<string | null>;
    /**
     * Получает версию Java
     */
    getJavaVersion(javaPath?: string): Promise<string | null>;
    /**
     * Проверяет совместимость версии Java
     */
    isJavaVersionCompatible(version: string): boolean;
    /**
     * Получает информацию о JRE
     */
    getJreInfo(): Promise<JreInfo | null>;
    /**
     * Валидирует JRE
     */
    validateJre(javaPath?: string): Promise<boolean>;
    /**
     * Получает тип JRE
     */
    getJreType(): Promise<JreType>;
    /**
     * Ищет все доступные JRE
     */
    findAllJreInstallations(): Promise<JreSearchResult>;
    /**
     * Получает рекомендации по установке Java
     */
    getJavaInstallationRecommendations(): Promise<string[]>;
    /**
     * Нормализует версию для сравнения
     */
    private normalizeVersion;
    /**
     * Сравнивает версии
     */
    private compareVersions;
}
