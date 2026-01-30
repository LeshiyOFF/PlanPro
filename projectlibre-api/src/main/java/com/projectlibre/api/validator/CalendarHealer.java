package com.projectlibre.api.validator;

import com.projectlibre1.pm.calendar.WorkCalendar;
import com.projectlibre1.pm.calendar.WorkingCalendar;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Field;

/**
 * Лечение циклических зависимостей календарей через Reflection.
 * Принудительно разрывает циклы для предотвращения StackOverflowError.
 * 
 * SOLID: Single Responsibility - только лечение календарей.
 * Clean Architecture: Infrastructure Service.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class CalendarHealer {
    
    private static final Logger log = LoggerFactory.getLogger(CalendarHealer.class);
    private static Field baseCalendarField;
    
    static {
        try {
            baseCalendarField = WorkingCalendar.class.getDeclaredField("baseCalendar");
            baseCalendarField.setAccessible(true);
        } catch (NoSuchFieldException e) {
            log.error("[CalHealer] Failed to access baseCalendar field", e);
        }
    }
    
    public boolean healIfNeeded(WorkingCalendar calendar) {
        if (calendar == null || baseCalendarField == null) return false;
        
        CalendarSafetyValidator validator = new CalendarSafetyValidator();
        CalendarSafetyValidator.ValidationResult result = validator.validate(calendar);
        
        if (result.isValid()) {
            return false;
        }
        
        log.warn("[CalHealer] Detected unsafe calendar, attempting to heal: {}", 
            result.getErrorCode());
        
        return forceBreakCycle(calendar);
    }
    
    private boolean forceBreakCycle(WorkingCalendar calendar) {
        try {
            WorkCalendar base = (WorkCalendar) baseCalendarField.get(calendar);
            
            if (base == calendar) {
                log.warn("[CalHealer] Self-reference detected, breaking cycle");
                baseCalendarField.set(calendar, null);
                return true;
            }
            
            if (base instanceof WorkingCalendar) {
                WorkingCalendar workingBase = (WorkingCalendar) base;
                WorkCalendar baseOfBase = (WorkCalendar) baseCalendarField.get(workingBase);
                
                if (baseOfBase == calendar) {
                    log.warn("[CalHealer] Direct circular ref, breaking cycle");
                    baseCalendarField.set(calendar, null);
                    return true;
                }
            }
            
            log.warn("[CalHealer] Complex cycle, resetting to null");
            baseCalendarField.set(calendar, null);
            return true;
            
        } catch (Throwable t) {
            log.error("[CalHealer] Healing failed: {}", t.getClass().getSimpleName());
            return false;
        }
    }
    
    public WorkCalendar getBaseCalendarSafe(WorkingCalendar calendar) {
        if (baseCalendarField == null) return null;
        try {
            return (WorkCalendar) baseCalendarField.get(calendar);
        } catch (Throwable t) {
            return null;
        }
    }
    
    public boolean setBaseCalendarSafe(WorkingCalendar calendar, WorkCalendar newBase) {
        if (baseCalendarField == null) return false;
        try {
            baseCalendarField.set(calendar, newBase);
            return true;
        } catch (Throwable t) {
            log.error("[CalHealer] Failed to set base: {}", t.getClass().getSimpleName());
            return false;
        }
    }
}
