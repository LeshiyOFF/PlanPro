package com.projectlibre.api.converter;

/**
 * Утилиты для работы с именами календарей.
 * 
 * Clean Architecture: Utility class (Domain Layer).
 * SOLID: Single Responsibility - только операции с именами.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public final class CalendarNameUtils {
    
    private CalendarNameUtils() { }
    
    /**
     * Санитизация имени для использования в ID.
     * Удаляет спецсимволы, заменяет пробелы на underscore.
     */
    public static String sanitize(String name) {
        if (name == null) return "unnamed";
        return name.trim()
            .replaceAll("[^a-zA-Zа-яА-Я0-9\\s-]", "")
            .replaceAll("\\s+", "_")
            .toLowerCase();
    }
    
    /**
     * Восстанавливает оригинальное имя из sanitized версии.
     * Заменяет underscore на пробелы, делает первую букву заглавной.
     */
    public static String reconstruct(String sanitized) {
        if (sanitized == null || sanitized.isEmpty()) return "";
        
        String[] words = sanitized.split("_");
        StringBuilder result = new StringBuilder();
        
        for (int i = 0; i < words.length; i++) {
            if (i > 0) result.append(" ");
            String word = words[i];
            if (!word.isEmpty()) {
                result.append(Character.toUpperCase(word.charAt(0)));
                if (word.length() > 1) result.append(word.substring(1));
            }
        }
        return result.toString();
    }
    
    /**
     * Нормализация legacy ID форматов (CAL-STANDARD, CAL-24-7, etc).
     */
    public static String normalizeLegacyId(String calendarId) {
        if (calendarId == null || !calendarId.startsWith("CAL-")) {
            return calendarId;
        }
        
        String withoutPrefix = calendarId.substring(4);
        switch (withoutPrefix) {
            case "STANDARD": return "standard";
            case "24-7": case "24_7": return "24_7";
            case "NIGHT": case "NIGHT_SHIFT": return "night_shift";
            default: return "custom_legacy_" + sanitize(withoutPrefix);
        }
    }
    
    /**
     * Проверяет, является ли ID системным календарем.
     */
    public static boolean isSystemCalendarId(String calendarId) {
        return "standard".equals(calendarId) 
            || "24_7".equals(calendarId) 
            || "night_shift".equals(calendarId);
    }
    
    /**
     * Проверяет, является ли ID кастомным календарем.
     */
    public static boolean isCustomCalendarId(String calendarId) {
        return calendarId != null && calendarId.startsWith("custom_");
    }
}
