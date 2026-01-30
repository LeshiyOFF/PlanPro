package com.projectlibre.api.initializer;

import com.projectlibre1.pm.calendar.WorkingCalendar;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.lang.reflect.Method;

/**
 * Инициализатор системных календарей ProjectLibre через Reflection.
 * Гарантирует, что Standard, Night Shift, 24/7 созданы при старте.
 * 
 * SOLID: Single Responsibility - только инициализация календарей.
 * Clean Architecture: Infrastructure Component.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
@Component
public class CalendarInitializer {
    
    private static final Logger log = LoggerFactory.getLogger(CalendarInitializer.class);
    
    @PostConstruct
    public void initializeSystemCalendars() {
        log.info("[CalInit] Initializing system calendars via Reflection...");
        
        try {
            WorkingCalendar standard = invokeCalendarMethod("getStandardInstance");
            if (standard != null) {
                log.info("[CalInit] ✅ Standard calendar: fixedId={}, uniqueId={}", 
                    standard.getFixedId(), standard.getUniqueId());
            }
            
            WorkingCalendar nightShift = invokeCalendarMethod("getNightShiftInstance");
            if (nightShift != null) {
                log.info("[CalInit] ✅ Night Shift calendar: fixedId={}, uniqueId={}", 
                    nightShift.getFixedId(), nightShift.getUniqueId());
            }
            
            WorkingCalendar twentyFourSeven = invokeCalendarMethod("get24HoursInstance");
            if (twentyFourSeven != null) {
                log.info("[CalInit] ✅ 24/7 calendar: fixedId={}, uniqueId={}", 
                    twentyFourSeven.getFixedId(), twentyFourSeven.getUniqueId());
            }
            
            log.info("[CalInit] System calendars initialization complete");
            
        } catch (Throwable t) {
            log.error("[CalInit] ❌ Failed to initialize system calendars: {}", 
                t.getClass().getSimpleName(), t);
        }
    }
    
    private WorkingCalendar invokeCalendarMethod(String methodName) {
        try {
            Method method = WorkingCalendar.class.getDeclaredMethod(methodName);
            method.setAccessible(true);
            return (WorkingCalendar) method.invoke(null);
        } catch (Throwable t) {
            log.warn("[CalInit] Failed to invoke {}: {}", methodName, t.getClass().getSimpleName());
            return null;
        }
    }
}
