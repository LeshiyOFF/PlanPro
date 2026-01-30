package com.projectlibre.api.exchange;

import com.projectlibre.api.audit.CalendarAuditLog;
import com.projectlibre.api.config.CalendarCleanupConfig;
import com.projectlibre.api.util.CalendarNameNormalizer;
import com.projectlibre1.pm.calendar.CalendarService;
import com.projectlibre1.pm.calendar.WorkCalendar;
import com.projectlibre1.pm.calendar.WorkingCalendar;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

/**
 * Очистка CalendarService от дубликатов и некорректных календарей V3.0.
 * 
 * ИЗМЕНЕНИЯ V3.0:
 * - Поддержка режимов (DRY_RUN, NORMAL, AGGRESSIVE)
 * - Интеграция с CalendarAuditLog
 * - Нормализация имён через CalendarNameNormalizer
 * - Раздельная обработка валидных (uniqueId > 0) и сломанных календарей
 * 
 * Clean Architecture: Infrastructure Service.
 * SOLID: Single Responsibility - только очистка CalendarService.
 * 
 * @author ProjectLibre Team
 * @version 3.0.0
 */
public class CalendarServiceCleaner {
    
    private static final Logger log = LoggerFactory.getLogger(CalendarServiceCleaner.class);
    
    private final CalendarAuditLog auditLog;
    private int removedFromBase = 0;
    private int removedFromDerived = 0;
    
    public CalendarServiceCleaner() {
        this.auditLog = new CalendarAuditLog();
    }
    
    public CalendarServiceCleaner(CalendarAuditLog auditLog) {
        this.auditLog = auditLog != null ? auditLog : new CalendarAuditLog();
    }
    
    /**
     * Выполняет очистку с учётом текущего режима.
     */
    public void cleanDuplicates() {
        removedFromBase = 0;
        removedFromDerived = 0;
        
        CalendarCleanupConfig.CleanupMode mode = CalendarCleanupConfig.getMode();
        String modePrefix = CalendarCleanupConfig.isDryRun() ? "[DRY-RUN] " : "";
        
        System.out.println("[CalendarCleaner] 🧹 " + modePrefix + "Starting cleanup (mode=" + mode + ")...");
        
        CalendarService calService = CalendarService.getInstance();
        
        cleanBaseCalendars(calService);
        cleanDerivedCalendars(calService);
        
        String resultMsg = CalendarCleanupConfig.isDryRun() ? "Would remove" : "Removed";
        System.out.println("[CalendarCleaner] ✅ " + modePrefix + resultMsg + 
            ": base=" + removedFromBase + ", derived=" + removedFromDerived);
        System.out.println("[CalendarCleaner] " + auditLog.getSummary());
    }
    
    private void cleanBaseCalendars(CalendarService calService) {
        ArrayList baseList = calService.getBaseCalendars();
        if (baseList == null || baseList.isEmpty()) return;
        
        Map<String, WorkingCalendar> uniqueByKey = new LinkedHashMap<>();
        List<WorkingCalendar> toKeep = new ArrayList<>();
        
        Set<String> protectedNames = new HashSet<>(Arrays.asList(
            "пятидневка", "ночная смена", "24 часа",
            "standard", "night shift", "24 hours", "default base"
        ));
        
        for (Object obj : baseList) {
            if (!(obj instanceof WorkingCalendar)) continue;
            
            WorkingCalendar wc = (WorkingCalendar) obj;
            String normalizedName = CalendarNameNormalizer.normalize(wc.getName());
            int fixedId = wc.getFixedId();
            String key = normalizedName + ":" + fixedId;
            
            boolean isProtected = protectedNames.contains(normalizedName) && 
                                  (fixedId >= 1 && fixedId <= 3);
            
            if (uniqueByKey.containsKey(key)) {
                logRemoval(wc, "Duplicate (key=" + key + ")");
                removedFromBase++;
            } else if (!isProtected && hasCyclicDependency(wc, new HashSet<>())) {
                logRemoval(wc, "Cyclic dependency");
                removedFromBase++;
            } else {
                uniqueByKey.put(key, wc);
                toKeep.add(wc);
            }
        }
        
        applyChanges(baseList, toKeep);
    }
    
    private void cleanDerivedCalendars(CalendarService calService) {
        ArrayList derivedList = calService.getDerivedCalendars();
        if (derivedList == null || derivedList.isEmpty()) return;
        
        Map<Long, WorkingCalendar> validById = new LinkedHashMap<>();
        Map<String, WorkingCalendar> invalidByName = new LinkedHashMap<>();
        List<WorkingCalendar> toKeep = new ArrayList<>();
        
        for (Object obj : derivedList) {
            if (!(obj instanceof WorkingCalendar)) continue;
            
            WorkingCalendar wc = (WorkingCalendar) obj;
            long uniqueId = wc.getUniqueId();
            String normalizedName = CalendarNameNormalizer.normalize(wc.getName());
            
            boolean isDuplicate = false;
            String reason = null;
            
            if (uniqueId > 0) {
                if (validById.containsKey(uniqueId)) {
                    isDuplicate = true;
                    reason = "Duplicate valid (uniqueId=" + uniqueId + ")";
                } else {
                    validById.put(uniqueId, wc);
                }
            } else {
                if (invalidByName.containsKey(normalizedName)) {
                    isDuplicate = true;
                    reason = "Duplicate invalid (name='" + normalizedName + "')";
                } else {
                    invalidByName.put(normalizedName, wc);
                }
            }
            
            if (isDuplicate) {
                logRemoval(wc, reason);
                removedFromDerived++;
            } else if (hasCyclicDependency(wc, new HashSet<>())) {
                logRemoval(wc, "Cyclic dependency");
                removedFromDerived++;
            } else {
                toKeep.add(wc);
            }
        }
        
        applyChanges(derivedList, toKeep);
    }
    
    private void applyChanges(ArrayList original, List<WorkingCalendar> filtered) {
        if (CalendarCleanupConfig.isDryRun()) return;
        
        original.clear();
        original.addAll(filtered);
    }
    
    private void logRemoval(WorkingCalendar wc, String reason) {
        String prefix = CalendarCleanupConfig.isDryRun() ? "[DRY-RUN] Would remove" : "🗑️ Removing";
        System.out.println("[CalendarCleaner] " + prefix + ": '" + wc.getName() + 
            "' (uniqueId=" + wc.getUniqueId() + ") - " + reason);
        
        auditLog.logRemoval(wc.getName(), wc.getUniqueId(), reason);
    }
    
    private boolean hasCyclicDependency(WorkingCalendar calendar, Set<Long> visited) {
        long id = calendar.getUniqueId();
        if (id > 0 && visited.contains(id)) return true;
        if (id > 0) visited.add(id);
        
        WorkCalendar base = calendar.getBaseCalendar();
        if (base instanceof WorkingCalendar) {
            return hasCyclicDependency((WorkingCalendar) base, visited);
        }
        return false;
    }
    
    public int getRemovedCount() {
        return removedFromBase + removedFromDerived;
    }
    
    public CalendarAuditLog getAuditLog() {
        return auditLog;
    }
}
