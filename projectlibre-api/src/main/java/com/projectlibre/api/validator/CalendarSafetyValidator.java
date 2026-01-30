package com.projectlibre.api.validator;

import com.projectlibre1.pm.calendar.WorkCalendar;
import com.projectlibre1.pm.calendar.WorkingCalendar;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Field;
import java.util.HashSet;
import java.util.Set;

/**
 * Валидатор безопасности календарей V3.0.
 * 
 * КРИТИЧЕСКИЕ ИЗМЕНЕНИЯ V3.0:
 * - hasSelfReference() учитывает архитектуру движка: "default base" (fixedId=0)
 *   и системные календари (fixedId=1,2,3) как baseCalendar - это НОРМАЛЬНО
 * - isSuspiciousSystemCalendar() разрешает fixedId=0 для кастомных и "default base"
 * - Не блокирует валидные календари с корректной цепочкой зависимостей
 * 
 * SOLID: Single Responsibility - только валидация календарей.
 * Clean Architecture: Domain Service для проверки бизнес-правил.
 * 
 * @author ProjectLibre Team
 * @version 3.0.0
 */
public class CalendarSafetyValidator {
    
    private static final Logger log = LoggerFactory.getLogger(CalendarSafetyValidator.class);
    private static final int MAX_DEPENDENCY_DEPTH = 10;
    private static Field baseCalendarField;
    
    static {
        try {
            baseCalendarField = WorkingCalendar.class.getDeclaredField("baseCalendar");
            baseCalendarField.setAccessible(true);
        } catch (NoSuchFieldException e) {
            log.error("[CalSafety] Failed to access baseCalendar field via Reflection", e);
        }
    }
    
    /**
     * Полная валидация календаря.
     * V2.0: Расширенные проверки на дубликаты и некорректные состояния.
     */
    public ValidationResult validate(WorkCalendar calendar) {
        if (calendar == null || !(calendar instanceof WorkingCalendar)) {
            return ValidationResult.valid();
        }
        
        WorkingCalendar wc = (WorkingCalendar) calendar;
        
        // Проверка 1: Самоссылка
        if (hasSelfReference(wc)) {
            return ValidationResult.error("SELF_REFERENCE", "Calendar references itself");
        }
        
        // Проверка 2: Циклические зависимости
        if (hasCircularDependency(wc)) {
            return ValidationResult.error("CIRCULAR_DEPENDENCY", "Circular calendar chain");
        }
        
        // Проверка 3: Глубина зависимостей
        int depth = calculateDependencyDepth(wc);
        if (depth > MAX_DEPENDENCY_DEPTH) {
            return ValidationResult.error("DEPTH_EXCEEDED", 
                "Depth " + depth + " exceeds " + MAX_DEPENDENCY_DEPTH);
        }
        
        // Проверка 4 (V2.0): Валидность uniqueId для системных календарей
        int fixedId = wc.getFixedId();
        long uniqueId = wc.getUniqueId();
        
        if ((fixedId == 1 || fixedId == 2 || fixedId == 3) && uniqueId <= 0) {
            log.warn("[CalSafety] System calendar with invalid uniqueId: fixedId={}, uniqueId={}, name='{}'", 
                fixedId, uniqueId, wc.getName());
            // Не критично, но подозрительно
        }
        
        // Проверка 5 (V2.0): Подмена системного календаря
        if (isSuspiciousSystemCalendar(wc)) {
            return ValidationResult.error("SUSPICIOUS_SYSTEM", 
                "System calendar has suspicious name pattern");
        }
        
        return ValidationResult.valid();
    }
    
    /**
     * Проверка на подмену системного календаря V3.0.
     * 
     * ИЗМЕНЕНИЕ: fixedId=0 теперь разрешён для:
     * - "default base" (внутренний шаблон движка)
     * - Любых кастомных календарей
     */
    private boolean isSuspiciousSystemCalendar(WorkingCalendar calendar) {
        int fixedId = calendar.getFixedId();
        String name = calendar.getName();
        
        if (name == null) return false;
        
        switch (fixedId) {
            case 0:
                // fixedId=0 разрешён для "default base" и любых кастомных
                return false;
                
            case 1:
                // Standard: должен содержать одно из ключевых слов
                return !name.contains("Стандарт") && 
                       !name.contains("Standard") && 
                       !name.contains("default") && 
                       !name.contains("Пятидневка");
                       
            case 2:
                // 24/7: должен содержать "24" или "Hours" или "Круглосуточн"
                return !name.contains("24") && 
                       !name.contains("Круглосуточн") && 
                       !name.contains("Hours");
                       
            case 3:
                // Night Shift: должен содержать ключевые слова
                return !name.contains("Ночн") && 
                       !name.contains("Night") && 
                       !name.contains("Shift") && 
                       !name.contains("смен");
                       
            default:
                // fixedId > 3 - неизвестный системный тип, подозрительно
                return true;
        }
    }
    
    public ValidationResult validateReplacement(WorkCalendar existingCalendar, WorkCalendar newCalendar) {
        ValidationResult newValidation = validate(newCalendar);
        return !newValidation.isValid() ? newValidation : ValidationResult.valid();
    }
    
    private WorkCalendar getBaseCalendarSafe(WorkingCalendar calendar) {
        if (baseCalendarField == null) return null;
        try {
            return (WorkCalendar) baseCalendarField.get(calendar);
        } catch (Throwable t) {
            log.warn("[CalSafety] Reflection access failed: {}", t.getClass().getSimpleName());
            return null;
        }
    }
    
    /**
     * Проверка на самоссылку V3.0.
     * 
     * ВАЖНО: "default base" (fixedId=0) и системные календари (fixedId=1,2,3)
     * могут быть baseCalendar для других календарей - это НОРМАЛЬНО для движка.
     * Ошибка только если calendar.baseCalendar == calendar (прямая самоссылка).
     */
    private boolean hasSelfReference(WorkingCalendar calendar) {
        try {
            WorkCalendar base = getBaseCalendarSafe(calendar);
            if (base == null) return false;
            
            // Прямая самоссылка - это ошибка
            if (base == calendar) return true;
            
            // Если base - системный календарь или "default base", это НОРМАЛЬНО
            if (base instanceof WorkingCalendar) {
                WorkingCalendar baseWc = (WorkingCalendar) base;
                int baseFixedId = baseWc.getFixedId();
                
                // fixedId=0 ("default base") или fixedId=1,2,3 (системные)
                // как base - это архитектура движка, НЕ ошибка
                if (baseFixedId >= 0 && baseFixedId <= 3) {
                    return false;
                }
            }
            
            return false;
        } catch (Throwable t) {
            log.warn("[CalSafety] Self-reference check caught: {}", t.getClass().getSimpleName());
            return true;
        }
    }
    
    private boolean hasCircularDependency(WorkingCalendar calendar) {
        return hasCircularDependencyRecursive(calendar, new HashSet<>());
    }
    
    private boolean hasCircularDependencyRecursive(WorkingCalendar current, Set<WorkCalendar> visited) {
        if (visited.contains(current)) return true;
        visited.add(current);
        try {
            WorkCalendar base = getBaseCalendarSafe(current);
            if (base == null || !(base instanceof WorkingCalendar)) return false;
            return hasCircularDependencyRecursive((WorkingCalendar) base, visited);
        } catch (Throwable t) {
            log.warn("[CalSafety] Circular check caught: {}", t.getClass().getSimpleName());
            return true;
        }
    }
    
    private int calculateDependencyDepth(WorkingCalendar calendar) {
        int depth = 0;
        WorkCalendar current = calendar;
        Set<WorkCalendar> visited = new HashSet<>();
        while (current instanceof WorkingCalendar && depth < MAX_DEPENDENCY_DEPTH + 1) {
            if (visited.contains(current)) return MAX_DEPENDENCY_DEPTH + 1;
            visited.add(current);
            try {
                WorkCalendar base = getBaseCalendarSafe((WorkingCalendar) current);
                if (base == null) break;
                current = base;
                depth++;
            } catch (Throwable t) {
                log.warn("[CalSafety] Depth calc caught: {}", t.getClass().getSimpleName());
                return MAX_DEPENDENCY_DEPTH + 1;
            }
        }
        return depth;
    }
    
    public static class ValidationResult {
        private final boolean valid;
        private final String errorCode;
        private final String errorMessage;
        
        private ValidationResult(boolean valid, String errorCode, String errorMessage) {
            this.valid = valid;
            this.errorCode = errorCode;
            this.errorMessage = errorMessage;
        }
        
        public static ValidationResult valid() {
            return new ValidationResult(true, null, null);
        }
        
        public static ValidationResult error(String code, String message) {
            return new ValidationResult(false, code, message);
        }
        
        public boolean isValid() { return valid; }
        public String getErrorCode() { return errorCode; }
        public String getErrorMessage() { return errorMessage; }
    }
}
