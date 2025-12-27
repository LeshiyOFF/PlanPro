/**
 * Интерфейсы для валидации Java процессов
 */
export interface ValidationResult {
    /** Успешность валидации */
    isValid: boolean;
    /** Сообщение об ошибке если есть */
    errorMessage?: string;
    /** Предупреждения */
    warnings?: string[];
    /** Дополнительная информация */
    details?: ValidationDetails;
}
export interface ValidationDetails {
    /** Валидность Java executable */
    javaValid: boolean;
    /** Валидность JAR файла */
    jarValid: boolean;
    /** Доступность порта */
    portAvailable: boolean;
    /** Достаточно памяти */
    memorySufficient: boolean;
    /** Версия Java совместима */
    versionCompatible: boolean;
}
export interface ValidationOptions {
    /** Проверять JAR файл */
    checkJar?: boolean;
    /** Проверять порт */
    checkPort?: boolean;
    /** Проверять память */
    checkMemory?: boolean;
    /** Проверять версию Java */
    checkVersion?: boolean;
    /** Таймаут валидации в миллисекундах */
    timeout?: number;
}
