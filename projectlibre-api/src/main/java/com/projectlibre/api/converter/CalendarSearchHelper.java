package com.projectlibre.api.converter;

import com.projectlibre.api.util.CalendarNameNormalizer;
import com.projectlibre1.pm.calendar.CalendarService;
import com.projectlibre1.pm.calendar.WorkCalendar;
import com.projectlibre1.pm.calendar.WorkingCalendar;

/**
 * Хелпер для поиска календарей в CalendarService V2.0.
 * 
 * ИЗМЕНЕНИЯ V2.0:
 * - Поддержка legacy-формата (custom_legacy_...)
 * - Нормализация имён через CalendarNameNormalizer
 * - Приоритизация валидных календарей (uniqueId > 0)
 * 
 * Clean Architecture: Infrastructure (поиск в хранилище).
 * SOLID: Single Responsibility - только поиск календарей.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
public class CalendarSearchHelper {
    
    private static final String LEGACY_PREFIX = "custom_legacy_";
    private static final String CUSTOM_PREFIX = "custom_";
    
    /**
     * Поиск календаря по uniqueId в base и derived calendars.
     * V2.0: Пропускает невалидные ID (<=0).
     */
    public WorkCalendar findByUniqueId(long uniqueId) {
        if (uniqueId <= 0) return null;
        
        CalendarService calService = CalendarService.getInstance();
        
        WorkCalendar cal = calService.findBaseCalendar(uniqueId);
        if (cal != null) return cal;
        
        return calService.findDerivedCalendar(uniqueId);
    }
    
    /**
     * Поиск календаря по имени в base и derived calendars.
     * V2.0: Использует нормализацию для сравнения.
     */
    public WorkCalendar findByName(String name) {
        if (name == null || name.isEmpty()) return null;
        
        CalendarService calService = CalendarService.getInstance();
        
        // Сначала в base (точное совпадение)
        WorkCalendar cal = CalendarService.findBaseCalendar(name);
        if (cal != null) return cal;
        
        // Потом в derived (с нормализацией)
        return calService.findDerivedCalendar(name);
    }
    
    /**
     * Поиск существующего кастомного календаря по ID V2.0.
     * Поддерживает как стандартный, так и legacy формат.
     */
    public WorkCalendar findExistingCustom(String calendarId) {
        if (calendarId == null) return null;
        
        // Проверка на legacy-формат
        if (calendarId.startsWith(LEGACY_PREFIX)) {
            return findLegacyCalendar(calendarId);
        }
        
        // Стандартный формат: custom_<uniqueId>_<name>
        if (!calendarId.startsWith(CUSTOM_PREFIX)) return null;
        
        return findStandardCustomCalendar(calendarId);
    }
    
    /**
     * Поиск календаря по стандартному формату: custom_<uniqueId>_<name>.
     */
    private WorkCalendar findStandardCustomCalendar(String calendarId) {
        String withoutPrefix = calendarId.substring(CUSTOM_PREFIX.length());
        String[] parts = withoutPrefix.split("_", 2);
        if (parts.length == 0) return null;
        
        // Попытка поиска по uniqueId
        try {
            long uniqueId = Long.parseLong(parts[0]);
            WorkCalendar cal = findByUniqueId(uniqueId);
            if (cal != null) return cal;
        } catch (NumberFormatException ignored) { }
        
        // Fallback: поиск по имени
        if (parts.length > 1) {
            String name = CalendarNameNormalizer.reconstruct(parts[1]);
            return findByName(name);
        }
        
        return null;
    }
    
    /**
     * Поиск legacy-календаря (из старых файлов).
     * Формат: custom_legacy_<sha1_hash>_<sanitized_name>
     */
    private WorkCalendar findLegacyCalendar(String calendarId) {
        String withoutPrefix = calendarId.substring(LEGACY_PREFIX.length());
        String[] parts = withoutPrefix.split("_", 2);
        
        if (parts.length < 2) return null;
        
        // Legacy календари ищем только по имени
        String name = CalendarNameNormalizer.reconstruct(parts[1]);
        return findByName(name);
    }
    
    /**
     * Проверяет, является ли ID legacy-форматом.
     */
    public boolean isLegacyId(String calendarId) {
        return calendarId != null && calendarId.startsWith(LEGACY_PREFIX);
    }
}
