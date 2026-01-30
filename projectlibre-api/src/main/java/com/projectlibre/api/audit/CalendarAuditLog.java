package com.projectlibre.api.audit;

import com.projectlibre.api.config.CalendarCleanupConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Аудит-лог изменений календарей для отслеживания и возможного отката.
 * 
 * Сохраняет:
 * - Удалённые календари (с причиной)
 * - Восстановленные связи ресурс → календарь
 * - Исправленные baseCalendar
 * 
 * Clean Architecture: Infrastructure Service (Audit).
 * SOLID: Single Responsibility - только аудит.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class CalendarAuditLog {
    
    private static final Logger log = LoggerFactory.getLogger(CalendarAuditLog.class);
    
    private final List<AuditEntry> entries = Collections.synchronizedList(new ArrayList<>());
    
    /**
     * Типы действий для аудита.
     */
    public enum ActionType {
        CALENDAR_REMOVED,
        CALENDAR_RESTORED,
        BASE_CALENDAR_REPAIRED,
        RESOURCE_CALENDAR_CHANGED,
        DUPLICATE_DETECTED
    }
    
    /**
     * Записывает действие в аудит-лог.
     */
    public void log(ActionType action, String entityName, String details, 
                    String oldValue, String newValue) {
        if (!CalendarCleanupConfig.isAuditEnabled()) return;
        
        AuditEntry entry = new AuditEntry(
            System.currentTimeMillis(),
            action,
            entityName,
            details,
            oldValue,
            newValue
        );
        
        entries.add(entry);
        
        if (CalendarCleanupConfig.isVerboseLogging()) {
            log.info("[CalAudit] {} | {} | {} → {} | {}", 
                action, entityName, oldValue, newValue, details);
        }
    }
    
    /**
     * Логирует удаление календаря.
     */
    public void logRemoval(String calendarName, long uniqueId, String reason) {
        log(ActionType.CALENDAR_REMOVED, calendarName, 
            reason, "uniqueId=" + uniqueId, "REMOVED");
    }
    
    /**
     * Логирует обнаружение дубликата.
     */
    public void logDuplicate(String calendarName, long uniqueId, String reason) {
        log(ActionType.DUPLICATE_DETECTED, calendarName,
            reason, "uniqueId=" + uniqueId, "DUPLICATE");
    }
    
    /**
     * Логирует изменение календаря ресурса.
     */
    public void logResourceCalendarChange(String resourceName, 
                                          String oldCalendar, String newCalendar) {
        log(ActionType.RESOURCE_CALENDAR_CHANGED, resourceName,
            "Calendar reassigned", oldCalendar, newCalendar);
    }
    
    /**
     * Логирует восстановление baseCalendar.
     */
    public void logBaseCalendarRepair(String calendarName, 
                                      String oldBase, String newBase) {
        log(ActionType.BASE_CALENDAR_REPAIRED, calendarName,
            "BaseCalendar repaired", oldBase, newBase);
    }
    
    /**
     * Получить все записи аудита.
     */
    public List<AuditEntry> getEntries() {
        return new ArrayList<>(entries);
    }
    
    /**
     * Получить количество записей.
     */
    public int getEntryCount() {
        return entries.size();
    }
    
    /**
     * Очистить лог.
     */
    public void clear() {
        entries.clear();
    }
    
    /**
     * Получить сводку изменений.
     */
    public String getSummary() {
        long removed = countByAction(ActionType.CALENDAR_REMOVED);
        long restored = countByAction(ActionType.CALENDAR_RESTORED);
        long repaired = countByAction(ActionType.BASE_CALENDAR_REPAIRED);
        long changed = countByAction(ActionType.RESOURCE_CALENDAR_CHANGED);
        long duplicates = countByAction(ActionType.DUPLICATE_DETECTED);
        
        return String.format(
            "Audit: removed=%d, restored=%d, repaired=%d, changed=%d, duplicates=%d",
            removed, restored, repaired, changed, duplicates);
    }
    
    private long countByAction(ActionType action) {
        return entries.stream()
            .filter(e -> e.action == action)
            .count();
    }
    
    /**
     * Структура записи аудита.
     */
    public static class AuditEntry {
        public final long timestamp;
        public final ActionType action;
        public final String entityName;
        public final String details;
        public final String oldValue;
        public final String newValue;
        
        public AuditEntry(long timestamp, ActionType action, String entityName,
                          String details, String oldValue, String newValue) {
            this.timestamp = timestamp;
            this.action = action;
            this.entityName = entityName;
            this.details = details;
            this.oldValue = oldValue;
            this.newValue = newValue;
        }
        
        @Override
        public String toString() {
            return String.format("[%s] %s: %s → %s (%s)", 
                action, entityName, oldValue, newValue, details);
        }
    }
}
