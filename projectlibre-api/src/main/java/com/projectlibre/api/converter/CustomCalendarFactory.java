package com.projectlibre.api.converter;

import com.projectlibre.api.calendar.WorkWeekBuilder;
import com.projectlibre.api.dto.CalendarSyncDto;
import com.projectlibre.api.util.CalendarNameNormalizer;
import com.projectlibre1.pm.calendar.CalendarService;
import com.projectlibre1.pm.calendar.WorkCalendar;
import com.projectlibre1.pm.calendar.WorkingCalendar;
import com.projectlibre1.configuration.CircularDependencyException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Фабрика кастомных календарей V3.0.
 * 
 * КРИТИЧЕСКИЕ ИЗМЕНЕНИЯ V3.0:
 * 1. Добавлен метод createWithSettings() для создания с полными настройками WorkWeek
 * 2. Использует WorkWeekBuilder для применения рабочих дней и часов
 * 3. Сохраняет оригинальный регистр названия (CalendarNameNormalizer V2.0)
 * 
 * КРИТИЧЕСКИЕ ИЗМЕНЕНИЯ V2.0:
 * 1. Использует SystemCalendarResolver.findStandard() (fixedId=1) как baseCalendar
 * 2. НЕ использует getStandardInstance() - это "default base" (fixedId=0)!
 * 3. Устанавливает baseCalendar (необходимо для getConcreteInstance() и сериализации)
 * 4. Добавляет в derivedCalendars через CalendarService.add()
 * 
 * Clean Architecture: Factory (Domain Layer).
 * SOLID: Single Responsibility - только создание кастомных календарей.
 * 
 * @author ProjectLibre Team
 * @version 3.0.0
 */
public class CustomCalendarFactory {
    
    private static final Logger log = LoggerFactory.getLogger(CustomCalendarFactory.class);
    
    private final SystemCalendarResolver systemResolver = new SystemCalendarResolver();
    private final WorkWeekBuilder workWeekBuilder = new WorkWeekBuilder();
    
    /**
     * Создаёт кастомный календарь с полными настройками WorkWeek.
     * 
     * КРИТИЧЕСКОЕ: Это основной метод для создания календарей с кастомными настройками.
     * Применяет рабочие дни и часы из CalendarSyncDto.
     * 
     * @param syncDto полные данные календаря (имя, рабочие дни, часы)
     * @return созданный календарь с применёнными настройками, null при ошибке
     */
    public WorkCalendar createWithSettings(CalendarSyncDto syncDto) {
        if (syncDto == null || syncDto.getName() == null) {
            log.error("[CalFactory] ❌ CalendarSyncDto or name is null");
            return null;
        }
        
        String name = syncDto.getName();
        CalendarService calService = CalendarService.getInstance();
        
        log.info("[CalFactory] Creating calendar with settings: name='{}', workingDays={}, hours={}",
            name, syncDto.getWorkingDaysCount(), syncDto.getHoursPerDay());
        
        WorkCalendar existing = findExistingByName(calService, name);
        if (existing != null) {
            log.info("[CalFactory] Found existing calendar '{}', updating settings", name);
            return updateExistingCalendar(existing, syncDto);
        }
        
        return createNewWithSettings(calService, syncDto);
    }
    
    /**
     * Создаёт или находит кастомный календарь (без применения настроек WorkWeek).
     * Используется для совместимости с legacy кодом.
     * 
     * @param calendarId ID календаря в формате custom_<id>_<name>
     * @return Созданный или найденный календарь, null при ошибке
     */
    public WorkCalendar createOrFind(String calendarId) {
        if (!CalendarNameUtils.isCustomCalendarId(calendarId)) {
            log.debug("[CalFactory] Not a custom calendar ID: '{}'", calendarId);
            return null;
        }
        
        String calendarName = extractNameFromId(calendarId);
        CalendarService calService = CalendarService.getInstance();
        
        WorkCalendar existing = findExisting(calService, calendarName, calendarId);
        if (existing != null) {
            log.debug("[CalFactory] Found existing: '{}'", calendarName);
            return existing;
        }
        
        return createNew(calService, calendarName, calendarId);
    }
    
    /**
     * Создаёт или находит календарь и применяет настройки.
     * Комбинирует поиск по ID с применением настроек.
     * 
     * @param calendarId ID календаря
     * @param syncDto настройки для применения
     * @return календарь с применёнными настройками
     */
    public WorkCalendar createOrFindWithSettings(String calendarId, CalendarSyncDto syncDto) {
        if (syncDto != null && syncDto.getName() != null) {
            return createWithSettings(syncDto);
        }
        return createOrFind(calendarId);
    }
    
    /**
     * Извлекает имя календаря из ID формата custom_<uniqueId>_<sanitized_name>.
     * V3.0: Использует CalendarNameNormalizer.extractNameFromCalendarId()
     */
    private String extractNameFromId(String calendarId) {
        String extracted = CalendarNameNormalizer.extractNameFromCalendarId(calendarId);
        if (extracted != null && !extracted.isEmpty()) {
            return extracted;
        }
        
        String withoutPrefix = calendarId.substring(7);
        String[] parts = withoutPrefix.split("_", 2);
        
        if (parts.length < 2) {
            return "Custom Calendar";
        }
        
        return CalendarNameNormalizer.reconstruct(parts[1]);
    }
    
    /**
     * Поиск существующего календаря по имени.
     */
    private WorkCalendar findExistingByName(CalendarService calService, String name) {
        WorkCalendar cal = calService.findDerivedCalendar(name);
        if (cal != null) return cal;
        
        return CalendarService.findBaseCalendar(name);
    }
    
    /**
     * Поиск существующего календаря.
     */
    private WorkCalendar findExisting(CalendarService calService, String name, String calendarId) {
        WorkCalendar cal = calService.findDerivedCalendar(name);
        if (cal != null) return cal;
        
        cal = CalendarService.findBaseCalendar(name);
        if (cal != null) return cal;
        
        long uniqueId = extractUniqueIdFromCalendarId(calendarId);
        if (uniqueId > 0) {
            cal = calService.findDerivedCalendar(uniqueId);
            if (cal != null) return cal;
            
            cal = calService.findBaseCalendar(uniqueId);
            if (cal != null) return cal;
        }
        
        return null;
    }
    
    /**
     * Извлекает uniqueId из calendarId.
     */
    private long extractUniqueIdFromCalendarId(String calendarId) {
        try {
            String withoutPrefix = calendarId.substring(7);
            String[] parts = withoutPrefix.split("_", 2);
            return Long.parseLong(parts[0]);
        } catch (Exception e) {
            return -1;
        }
    }
    
    /**
     * Обновляет настройки существующего календаря.
     */
    private WorkCalendar updateExistingCalendar(WorkCalendar calendar, CalendarSyncDto syncDto) {
        if (!(calendar instanceof WorkingCalendar)) {
            log.warn("[CalFactory] Cannot update non-WorkingCalendar");
            return calendar;
        }
        
        WorkingCalendar wc = (WorkingCalendar) calendar;
        
        if (workWeekBuilder.applySettings(wc, syncDto)) {
            log.info("[CalFactory] ✅ Updated settings for '{}'", syncDto.getName());
        } else {
            log.warn("[CalFactory] ⚠️ Failed to update settings for '{}'", syncDto.getName());
        }
        
        return wc;
    }
    
    /**
     * Создаёт новый кастомный календарь с настройками WorkWeek.
     */
    private WorkCalendar createNewWithSettings(CalendarService calService, CalendarSyncDto syncDto) {
        try {
            WorkCalendar standardCal = systemResolver.findStandard();
            
            if (standardCal == null) {
                log.error("[CalFactory] ❌ Cannot create '{}': Standard calendar not found", syncDto.getName());
                return null;
            }
            
            if (!isValidStandardBase(standardCal)) {
                log.error("[CalFactory] ❌ Wrong base calendar for '{}': not fixedId=1", syncDto.getName());
                return null;
            }
            
            WorkingCalendar newCalendar = WorkingCalendar.getInstance();
            newCalendar.setName(syncDto.getName());
            newCalendar.setFixedId(0);
            
            setBaseCalendarSafe(newCalendar, standardCal);
            
            long uniqueId = generateUniqueId();
            newCalendar.setUniqueId(uniqueId);
            
            if (!workWeekBuilder.applySettings(newCalendar, syncDto)) {
                log.warn("[CalFactory] ⚠️ Failed to apply WorkWeek settings for '{}'", syncDto.getName());
            }
            
            calService.add(newCalendar);
            
            log.info("[CalFactory] ✅ Created '{}' with settings: uniqueId={}, workingDays={}, hours={}", 
                syncDto.getName(), uniqueId, syncDto.getWorkingDaysCount(), syncDto.getHoursPerDay());
            
            return newCalendar;
            
        } catch (Exception e) {
            log.error("[CalFactory] ❌ Failed to create '{}': {}", syncDto.getName(), e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * Создаёт новый кастомный календарь (legacy метод без настроек).
     */
    private WorkCalendar createNew(CalendarService calService, String name, String calendarId) {
        try {
            WorkCalendar standardCal = systemResolver.findStandard();
            
            if (standardCal == null) {
                log.error("[CalFactory] ❌ Cannot create '{}': Standard calendar not found", name);
                return null;
            }
            
            if (!isValidStandardBase(standardCal)) {
                log.error("[CalFactory] ❌ Wrong base calendar for '{}': not fixedId=1", name);
                return null;
            }
            
            WorkingCalendar newCalendar = WorkingCalendar.getInstance();
            newCalendar.setName(name);
            newCalendar.setFixedId(0);
            
            setBaseCalendarSafe(newCalendar, standardCal);
            
            long uniqueId = generateUniqueId();
            newCalendar.setUniqueId(uniqueId);
            
            calService.add(newCalendar);
            
            logCreatedCalendar(newCalendar, standardCal);
            return newCalendar;
            
        } catch (Exception e) {
            log.error("[CalFactory] ❌ Failed to create '{}': {}", name, e.getMessage());
            return null;
        }
    }
    
    /**
     * Проверяет что календарь - валидный Standard (fixedId=1).
     */
    private boolean isValidStandardBase(WorkCalendar cal) {
        if (!(cal instanceof WorkingCalendar)) return false;
        WorkingCalendar wc = (WorkingCalendar) cal;
        return wc.getFixedId() == 1;
    }
    
    /**
     * Безопасная установка baseCalendar с обработкой CircularDependencyException.
     */
    private void setBaseCalendarSafe(WorkingCalendar calendar, WorkCalendar base) {
        try {
            calendar.setBaseCalendar(base);
        } catch (CircularDependencyException e) {
            log.error("[CalFactory] ❌ Circular dependency: {}", e.getMessage());
        }
    }
    
    /**
     * Генерирует уникальный ID с защитой от коллизий.
     */
    private long generateUniqueId() {
        return System.currentTimeMillis() * 1000 + (long)(Math.random() * 999);
    }
    
    private void logCreatedCalendar(WorkingCalendar newCal, WorkCalendar baseCal) {
        String baseName = (baseCal instanceof WorkingCalendar) 
            ? ((WorkingCalendar) baseCal).getName() : "unknown";
        log.info("[CalFactory] ✅ Created '{}': uniqueId={}, baseCalendar='{}'", 
            newCal.getName(), newCal.getUniqueId(), baseName);
    }
}
