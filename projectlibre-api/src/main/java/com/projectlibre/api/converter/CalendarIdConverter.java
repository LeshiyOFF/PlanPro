package com.projectlibre.api.converter;

import com.projectlibre.api.util.CalendarHashGenerator;
import com.projectlibre.api.util.CalendarNameNormalizer;
import com.projectlibre1.pm.calendar.CalendarService;
import com.projectlibre1.pm.calendar.WorkCalendar;
import com.projectlibre1.pm.calendar.WorkingCalendar;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Конвертер календарей между Core и Frontend представлениями V4.0.
 * 
 * Форматы ID:
 * - Системные календари: standard, 24_7, night_shift
 * - Кастомные календари: custom_<uniqueId>_<sanitized_name>
 * - Legacy календари: custom_legacy_<sha1_hash>_<sanitized_name>
 * 
 * ИЗМЕНЕНИЯ V4.0:
 * - SHA-1 хеш для legacy календарей вместо случайного UUID
 * - Использование CalendarNameNormalizer для санитизации
 * - Детерминистические ID между сессиями
 * 
 * Clean Architecture: Adapter для преобразования данных между слоями.
 * SOLID: Single Responsibility - конвертация ID календарей.
 * 
 * @author ProjectLibre Team
 * @version 4.0.0
 */
public class CalendarIdConverter {
    
    private static final Logger log = LoggerFactory.getLogger(CalendarIdConverter.class);
    
    private final SystemCalendarResolver systemResolver = new SystemCalendarResolver();
    private final CustomCalendarFactory customFactory = new CustomCalendarFactory();
    private final CalendarSearchHelper searchHelper = new CalendarSearchHelper();
    private final com.projectlibre.api.validator.CalendarSafetyValidator safetyValidator = 
        new com.projectlibre.api.validator.CalendarSafetyValidator();
    
    /**
     * Конвертирует WorkCalendar в calendarId для Frontend.
     */
    public String toCalendarId(WorkCalendar calendar) {
        if (calendar == null || !(calendar instanceof WorkingCalendar)) {
            return null;
        }
        
        WorkingCalendar wc = (WorkingCalendar) calendar;
        int fixedId = wc.getFixedId();
        
        switch (fixedId) {
            case 1: return "standard";
            case 2: return "24_7";
            case 3: return "night_shift";
            default: return convertCustomToId(wc);
        }
    }
    
    /**
     * Конвертирует calendarId из Frontend в WorkCalendar Core.
     * Если кастомный календарь не найден - создает его.
     */
    public WorkCalendar fromCalendarId(String calendarId) {
        if (calendarId == null || calendarId.trim().isEmpty()) {
            return null;
        }
        
        try {
            String normalizedId = CalendarNameUtils.normalizeLegacyId(calendarId);
            WorkCalendar calendar = findCalendar(normalizedId, calendarId);
            
            if (calendar == null) {
                log.warn("[CalendarConv] ⚠️ Calendar '{}' not found", calendarId);
                return null;
            }
            
            var validation = safetyValidator.validate(calendar);
            if (!validation.isValid()) {
                log.error("[CalendarConv] ❌ Unsafe '{}': {}", calendarId, validation.getErrorCode());
                return null;
            }
            
            return calendar;
        } catch (Exception e) {
            log.error("[CalendarConv] Failed to find '{}': {}", calendarId, e.getMessage());
            return null;
        }
    }
    
    /**
     * Поиск календаря по нормализованному ID.
     */
    private WorkCalendar findCalendar(String normalizedId, String originalId) {
        if (CalendarNameUtils.isSystemCalendarId(normalizedId)) {
            return findSystemCalendar(normalizedId);
        }
        return findOrCreateCustomCalendar(normalizedId, originalId);
    }
    
    /**
     * Поиск системного календаря.
     */
    private WorkCalendar findSystemCalendar(String id) {
        switch (id) {
            case "standard": return systemResolver.findStandard();
            case "24_7": return systemResolver.find24Hours();
            case "night_shift": return systemResolver.findNightShift();
            default: return null;
        }
    }
    
    /**
     * Поиск или создание кастомного календаря.
     */
    private WorkCalendar findOrCreateCustomCalendar(String normalizedId, String originalId) {
        if (!CalendarNameUtils.isCustomCalendarId(normalizedId)) {
            return CalendarService.getInstance().findBaseCalendar(originalId);
        }
        
        WorkCalendar existing = searchHelper.findExistingCustom(normalizedId);
        if (existing != null) {
            return existing;
        }
        
        log.info("[CalendarConv] Creating custom calendar for '{}'", normalizedId);
        return customFactory.createOrFind(normalizedId);
    }
    
    /**
     * Конвертация кастомного календаря в ID V4.0.
     * 
     * ВАЖНОЕ ИЗМЕНЕНИЕ: Для legacy календарей (uniqueId <= 0) используется
     * детерминистический SHA-1 хеш вместо случайного UUID.
     * Это обеспечивает стабильность ID между сессиями.
     */
    private String convertCustomToId(WorkingCalendar calendar) {
        String name = calendar.getName();
        String sanitizedName = (name != null && !name.trim().isEmpty()) 
            ? CalendarNameNormalizer.sanitize(name) : "unnamed";
        
        long uniqueId = calendar.getUniqueId();
        
        if (uniqueId > 0) {
            // Нормальный путь — используем реальный uniqueId
            return "custom_" + uniqueId + "_" + sanitizedName;
        }
        
        // Legacy путь — детерминистический SHA-1 хеш (БЕЗ timestamp!)
        log.warn("[CalendarConv] ⚠️ Calendar '{}' has invalid uniqueId={}, using SHA-1 hash", 
            name, uniqueId);
        
        String hash = CalendarHashGenerator.generateHash(name);
        return "custom_legacy_" + hash + "_" + sanitizedName;
    }
    
    /**
     * Проверяет, является ли ID legacy-форматом.
     */
    public static boolean isLegacyId(String calendarId) {
        return calendarId != null && calendarId.startsWith("custom_legacy_");
    }
}
