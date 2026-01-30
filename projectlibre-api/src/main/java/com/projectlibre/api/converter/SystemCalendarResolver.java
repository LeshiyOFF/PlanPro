package com.projectlibre.api.converter;

import com.projectlibre1.pm.calendar.CalendarService;
import com.projectlibre1.pm.calendar.WorkCalendar;
import com.projectlibre1.pm.calendar.WorkingCalendar;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Резолвер системных календарей V2.0 с ПРИОРИТЕТОМ по fixedId.
 * 
 * КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ V2.0:
 * - НЕ использовать getStandardInstance() - это "default base" (fixedId=0)
 * - Использовать findByFixedId() или getDefaultInstance() для Standard (fixedId=1)
 * 
 * Поддерживаемые системные календари:
 * - Standard (fixedId=1) - стандартный офисный график ("Пятидневка")
 * - 24/7 (fixedId=2) - круглосуточный режим
 * - Night Shift (fixedId=3) - ночная смена
 * 
 * Clean Architecture: Infrastructure (поиск в CalendarService).
 * SOLID: Single Responsibility - только поиск системных календарей.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
public class SystemCalendarResolver {
    
    private static final Logger log = LoggerFactory.getLogger(SystemCalendarResolver.class);
    
    private static final int FIXED_ID_STANDARD = 1;
    private static final int FIXED_ID_24_HOURS = 2;
    private static final int FIXED_ID_NIGHT_SHIFT = 3;
    
    /**
     * Поиск Standard календаря (fixedId=1).
     * КРИТИЧЕСКОЕ: Использует findByFixedId(1) и getDefaultInstance(), НЕ getStandardInstance()!
     * 
     * getStandardInstance() возвращает "default base" (fixedId=0) - НЕЛЬЗЯ использовать!
     * getDefaultInstance() возвращает "Пятидневка" (fixedId=1) - ПРАВИЛЬНО!
     */
    public WorkCalendar findStandard() {
        CalendarService calService = CalendarService.getInstance();
        
        // ПРИОРИТЕТ 1: Поиск по fixedId=1 (САМЫЙ НАДЁЖНЫЙ)
        WorkCalendar cal = calService.findByFixedId(FIXED_ID_STANDARD);
        if (cal != null && isValidStandard(cal)) {
            logFound("Standard", "findByFixedId(1)", cal);
            return cal;
        }
        
        // ПРИОРИТЕТ 2: getDefaultInstance() (НЕ getStandardInstance!)
        cal = calService.getDefaultInstance();
        if (cal != null && isValidStandard(cal)) {
            logFound("Standard", "getDefaultInstance()", cal);
            return cal;
        }
        
        // ПРИОРИТЕТ 3: Поиск по известным именам
        cal = findByKnownNames(new String[]{
            "Пятидневка", "Standard", "Стандартный офис"
        });
        if (cal != null && isValidStandard(cal)) {
            logFound("Standard", "known name", cal);
            return cal;
        }
        
        // ПРИОРИТЕТ 4: Messages
        cal = findByMessage("Calendar.Standard");
        if (cal != null && isValidStandard(cal)) {
            logFound("Standard", "Messages", cal);
            return cal;
        }
        
        log.error("[SystemCalResolver] ❌ Standard calendar (fixedId=1) NOT FOUND!");
        return null;
    }
    
    /**
     * Проверяет, что это действительно Standard (fixedId=1), а не "default base" (fixedId=0).
     */
    private boolean isValidStandard(WorkCalendar cal) {
        if (!(cal instanceof WorkingCalendar)) return false;
        WorkingCalendar wc = (WorkingCalendar) cal;
        return wc.getFixedId() == FIXED_ID_STANDARD;
    }
    
    /**
     * Поиск 24/7 календаря (fixedId=2).
     */
    public WorkCalendar find24Hours() {
        CalendarService calService = CalendarService.getInstance();
        
        // ПРИОРИТЕТ 1: По fixedId
        WorkCalendar cal = calService.findByFixedId(FIXED_ID_24_HOURS);
        if (cal != null) {
            logFound("24/7", "findByFixedId(2)", cal);
            return cal;
        }
        
        // ПРИОРИТЕТ 2: По известным именам
        cal = findByKnownNames(new String[]{
            "24 часа", "Круглосуточный (24/7)", "24/7", "24 Hours"
        });
        if (cal != null) {
            logFound("24/7", "known name", cal);
            return cal;
        }
        
        // ПРИОРИТЕТ 3: Messages
        cal = findByMessage("Calendar.24Hours");
        if (cal != null) {
            logFound("24/7", "Messages", cal);
            return cal;
        }
        
        log.warn("[SystemCalResolver] ⚠️ 24/7 not found, fallback to Standard");
        return findStandard();
    }
    
    /**
     * Поиск Night Shift календаря (fixedId=3).
     */
    public WorkCalendar findNightShift() {
        CalendarService calService = CalendarService.getInstance();
        
        // ПРИОРИТЕТ 1: По fixedId
        WorkCalendar cal = calService.findByFixedId(FIXED_ID_NIGHT_SHIFT);
        if (cal != null) {
            logFound("NightShift", "findByFixedId(3)", cal);
            return cal;
        }
        
        // ПРИОРИТЕТ 2: По известным именам
        cal = findByKnownNames(new String[]{
            "Ночная смена", "Night Shift"
        });
        if (cal != null) {
            logFound("NightShift", "known name", cal);
            return cal;
        }
        
        // ПРИОРИТЕТ 3: Messages
        cal = findByMessage("Calendar.NightShift");
        if (cal != null) {
            logFound("NightShift", "Messages", cal);
            return cal;
        }
        
        log.warn("[SystemCalResolver] ⚠️ NightShift not found, fallback to Standard");
        return findStandard();
    }
    
    /**
     * Поиск через Messages.
     */
    private WorkCalendar findByMessage(String messageKey) {
        try {
            String name = com.projectlibre1.strings.Messages.getString(messageKey);
            WorkCalendar cal = CalendarService.findBaseCalendar(name);
            if (cal != null) {
                log.debug("[SystemCalResolver] Found via Messages: '{}'", name);
                return cal;
            }
        } catch (Exception e) {
            log.debug("[SystemCalResolver] Messages lookup failed for {}", messageKey);
        }
        return null;
    }
    
    /**
     * Поиск по известным именам.
     */
    private WorkCalendar findByKnownNames(String[] names) {
        CalendarService calService = CalendarService.getInstance();
        for (String name : names) {
            WorkCalendar cal = CalendarService.findBaseCalendar(name);
            if (cal != null) {
                return cal;
            }
        }
        return null;
    }
    
    private void logFound(String calType, String source, WorkCalendar cal) {
        if (cal instanceof WorkingCalendar) {
            WorkingCalendar wc = (WorkingCalendar) cal;
            log.debug("[SystemCalResolver] Found {} via {}: name='{}', fixedId={}", 
                calType, source, wc.getName(), wc.getFixedId());
        }
    }
}
