package com.projectlibre.api.config;

/**
 * Конфигурация очистки календарей с поддержкой режимов работы.
 * 
 * Режимы:
 * - DRY_RUN: Только логирование, без изменений (для тестирования)
 * - NORMAL: Стандартная очистка с консервативными правилами
 * - AGGRESSIVE: Агрессивная очистка (удаляет все сломанные)
 * 
 * Feature Flag паттерн для безопасного деплоя.
 * 
 * Clean Architecture: Configuration (Infrastructure Layer).
 * SOLID: Single Responsibility - только конфигурация очистки.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public final class CalendarCleanupConfig {
    
    /**
     * Режимы работы очистки календарей.
     */
    public enum CleanupMode {
        /** Только логирование, без реальных изменений */
        DRY_RUN,
        /** Стандартная очистка (рекомендуется) */
        NORMAL,
        /** Агрессивная очистка (использовать с осторожностью) */
        AGGRESSIVE
    }
    
    private static volatile CleanupMode currentMode = CleanupMode.NORMAL;
    private static volatile boolean auditEnabled = true;
    private static volatile boolean verboseLogging = false;
    
    private CalendarCleanupConfig() { }
    
    /**
     * Получить текущий режим очистки.
     */
    public static CleanupMode getMode() {
        return currentMode;
    }
    
    /**
     * Установить режим очистки.
     */
    public static void setMode(CleanupMode mode) {
        if (mode != currentMode) {
            System.out.println("[CalendarConfig] Cleanup mode changed: " + 
                currentMode + " → " + mode);
            currentMode = mode;
        }
    }
    
    /**
     * Проверка режима DRY_RUN (только логирование).
     */
    public static boolean isDryRun() {
        return currentMode == CleanupMode.DRY_RUN;
    }
    
    /**
     * Проверка режима AGGRESSIVE.
     */
    public static boolean isAggressive() {
        return currentMode == CleanupMode.AGGRESSIVE;
    }
    
    /**
     * Проверка, включён ли аудит.
     */
    public static boolean isAuditEnabled() {
        return auditEnabled;
    }
    
    /**
     * Включить/выключить аудит.
     */
    public static void setAuditEnabled(boolean enabled) {
        auditEnabled = enabled;
    }
    
    /**
     * Проверка verbose логирования.
     */
    public static boolean isVerboseLogging() {
        return verboseLogging;
    }
    
    /**
     * Включить/выключить verbose логирование.
     */
    public static void setVerboseLogging(boolean enabled) {
        verboseLogging = enabled;
    }
    
    /**
     * Сброс к значениям по умолчанию.
     */
    public static void reset() {
        currentMode = CleanupMode.NORMAL;
        auditEnabled = true;
        verboseLogging = false;
    }
}
