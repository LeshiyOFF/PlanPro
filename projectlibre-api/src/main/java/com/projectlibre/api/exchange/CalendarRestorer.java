package com.projectlibre.api.exchange;

import com.projectlibre.api.audit.CalendarAuditLog;
import com.projectlibre.api.util.CalendarNameNormalizer;
import com.projectlibre1.pm.calendar.CalendarService;
import com.projectlibre1.pm.calendar.WorkCalendar;
import com.projectlibre1.pm.calendar.WorkingCalendar;
import com.projectlibre1.pm.resource.Resource;
import com.projectlibre1.pm.resource.ResourcePool;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.strings.Messages;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Method;
import java.util.Collection;

/**
 * Восстанавливает правильные календари у ресурсов после десериализации V4.0.
 * 
 * ИЗМЕНЕНИЯ V4.0:
 * - Интеграция с CalendarAuditLog для отслеживания изменений
 * - repairBaseCalendarIfNeeded() для исправления сломанных baseCalendar
 * - Приоритизация валидных календарей (uniqueId > 0)
 * 
 * КРИТИЧЕСКИЕ ИЗМЕНЕНИЯ V3.0:
 * - findStandardCalendar() использует findByFixedId(1), НЕ getStandardInstance()
 * - getStandardInstance() возвращает "default base" (fixedId=0) - НЕЛЬЗЯ!
 * - findByFixedId(1) возвращает "Пятидневка" (fixedId=1) - ПРАВИЛЬНО!
 * 
 * Clean Architecture: Infrastructure Layer - восстановление после IO.
 * SOLID: Single Responsibility - только восстановление календарей.
 * 
 * @author ProjectLibre Team
 * @version 4.0.0
 */
public class CalendarRestorer {
    
    private static final Logger log = LoggerFactory.getLogger(CalendarRestorer.class);
    
    private final CalendarAuditLog auditLog;
    private int restoredCount = 0;
    private int failedCount = 0;
    
    public CalendarRestorer() {
        this.auditLog = new CalendarAuditLog();
    }
    
    public CalendarRestorer(CalendarAuditLog auditLog) {
        this.auditLog = auditLog != null ? auditLog : new CalendarAuditLog();
    }
    
    /**
     * Восстанавливает календари у всех ресурсов проекта.
     */
    public void restoreCalendars(Project project) {
        if (project == null) {
            System.out.println("[CalRestore] ❌ Project is null");
            return;
        }
        
        ResourcePool pool = project.getResourcePool();
        if (pool == null) {
            System.out.println("[CalRestore] ❌ ResourcePool is null");
            return;
        }
        
        @SuppressWarnings("unchecked")
        Collection<Resource> resources = pool.getResourceList();
        if (resources == null || resources.isEmpty()) {
            System.out.println("[CalRestore] ℹ No resources to restore");
            return;
        }
        
        System.out.println("[CalRestore] 🔧 Starting calendar restoration for " + 
            resources.size() + " resources");
        
        dumpCalendarServiceState();
        
        restoredCount = 0;
        failedCount = 0;
        
        for (Resource resource : resources) {
            try {
                restoreResourceCalendar(resource);
            } catch (Throwable t) {
                failedCount++;
                System.out.println("[CalRestore] ❌ Failed to restore calendar for '" + 
                    resource.getName() + "': " + t.getMessage());
                t.printStackTrace();
            }
        }
        
        System.out.println("[CalRestore] ✅ Restoration complete: restored=" + 
            restoredCount + ", failed=" + failedCount);
    }
    
    /**
     * Восстанавливает календарь для ресурса.
     * V3.0: ПРИОРИТЕТ fixedId для системных календарей.
     * 
     * Логика: если fixedId = 1,2,3, то ВСЕГДА восстанавливаем системный календарь,
     * независимо от текущего имени (которое могло быть испорчено).
     */
    private void restoreResourceCalendar(Resource resource) {
        WorkCalendar currentCalendar = resource.getWorkCalendar();
        if (currentCalendar == null || !(currentCalendar instanceof WorkingCalendar)) {
            return;
        }
        
        WorkingCalendar wc = (WorkingCalendar) currentCalendar;
        int fixedId = wc.getFixedId();
        long uniqueId = wc.getUniqueId();
        String currentName = wc.getName();
        String resourceName = resource.getName();
        
        System.out.println("[CalRestore] 🔄 Analyzing '" + resourceName + 
            "': fixedId=" + fixedId + ", uniqueId=" + uniqueId + ", calName='" + currentName + "'");
        
        CalendarService calService = CalendarService.getInstance();
        WorkCalendar correctCalendar = null;
        
        // ПРИОРИТЕТ 1: Системные календари по fixedId (1,2,3)
        if (fixedId == 1 || fixedId == 2 || fixedId == 3) {
            correctCalendar = findSystemCalendarByFixedId(fixedId, calService);
            if (correctCalendar != null) {
                System.out.println("[CalRestore] ✅ System calendar found by fixedId=" + fixedId);
            }
        }
        
        // ПРИОРИТЕТ 2: Кастомные календари по uniqueId
        if (correctCalendar == null && uniqueId > 0) {
            correctCalendar = calService.findDerivedCalendar(uniqueId);
            if (correctCalendar == null) {
                correctCalendar = calService.findBaseCalendar(uniqueId);
            }
        }
        
        // ПРИОРИТЕТ 3: Поиск по имени (только если имя НЕ совпадает с именем ресурса)
        if (correctCalendar == null && currentName != null && !currentName.equals(resourceName)) {
            correctCalendar = calService.findDerivedCalendar(currentName);
            if (correctCalendar == null) {
                correctCalendar = CalendarService.findBaseCalendar(currentName);
            }
        }
        
        // ПРИОРИТЕТ 4: Fallback на Standard
        if (correctCalendar == null) {
            correctCalendar = findStandardCalendar(calService);
            System.out.println("[CalRestore] ⚠️ Using Standard fallback for '" + resourceName + "'");
        }
        
        // Применяем восстановленный календарь
        if (correctCalendar != null && correctCalendar != currentCalendar) {
            String oldName = currentName != null ? currentName : "unknown";
            String newName = (correctCalendar instanceof WorkingCalendar) 
                ? ((WorkingCalendar) correctCalendar).getName() : "unknown";
            
            calService.reassignCalendar(resource, currentCalendar, correctCalendar);
            resource.setWorkCalendar(correctCalendar);
            
            // V4.0: Аудит-логирование
            auditLog.logResourceCalendarChange(resourceName, oldName, newName);
            
            System.out.println("[CalRestore] ✅ Restored '" + resourceName + "' → '" + newName + "'");
            restoredCount++;
            
            // V4.0: Проверяем и исправляем baseCalendar если это кастомный календарь
            if (correctCalendar instanceof WorkingCalendar) {
                repairBaseCalendarIfNeeded((WorkingCalendar) correctCalendar);
            }
        } else if (correctCalendar == currentCalendar) {
            System.out.println("[CalRestore] ✅ Calendar already correct for '" + resourceName + "'");
            
            // V4.0: Даже если календарь правильный, проверяем baseCalendar
            if (currentCalendar instanceof WorkingCalendar) {
                repairBaseCalendarIfNeeded((WorkingCalendar) currentCalendar);
            }
        } else {
            failedCount++;
        }
    }
    
    /**
     * V4.0: Исправляет baseCalendar если он сломан (uniqueId <= 0 или fixedId=0).
     * Критично для кастомных календарей, которые должны ссылаться на Standard (fixedId=1).
     */
    private void repairBaseCalendarIfNeeded(WorkingCalendar calendar) {
        if (calendar == null) return;
        
        // Системные календари (fixedId 1,2,3) не нуждаются в исправлении
        int fixedId = calendar.getFixedId();
        if (fixedId >= 1 && fixedId <= 3) return;
        
        WorkCalendar baseCalendar = calendar.getBaseCalendar();
        if (baseCalendar == null) return;
        
        if (!(baseCalendar instanceof WorkingCalendar)) return;
        
        WorkingCalendar baseWc = (WorkingCalendar) baseCalendar;
        int baseFixedId = baseWc.getFixedId();
        
        // Проблема: baseCalendar указывает на "default base" (fixedId=0)
        if (baseFixedId == 0) {
            WorkCalendar correctBase = findStandardCalendar(CalendarService.getInstance());
            if (correctBase != null && correctBase instanceof WorkingCalendar) {
                if (correctBase == calendar) {
                    System.out.println("[CalRestore] ⚠️ Skipping setBaseCalendar: correctBase equals calendar (self-reference)");
                    return;
                }
                String oldBaseName = baseWc.getName();
                String newBaseName = ((WorkingCalendar) correctBase).getName();
                
                try {
                    calendar.setBaseCalendar(correctBase);
                } catch (com.projectlibre1.configuration.CircularDependencyException e) {
                    System.out.println("[CalRestore] ❌ Circular dependency while repairing base for '" + 
                        calendar.getName() + "': " + e.getMessage());
                }
                
                auditLog.logBaseCalendarRepair(calendar.getName(), oldBaseName, newBaseName);
                System.out.println("[CalRestore] 🔧 Repaired baseCalendar for '" + 
                    calendar.getName() + "': '" + oldBaseName + "' → '" + newBaseName + "'");
            }
        }
    }
    
    /**
     * Поиск системного календаря по fixedId.
     */
    private WorkCalendar findSystemCalendarByFixedId(int fixedId, CalendarService calService) {
        switch (fixedId) {
            case 1: return findStandardCalendar(calService);
            case 2: return find24HoursCalendar(calService);
            case 3: return findNightShiftCalendar(calService);
            default: return null;
        }
    }
    
    private WorkCalendar findCorrectCalendarV2(int fixedId, long uniqueId, 
                                                String calendarName, String resourceName) {
        CalendarService calService = CalendarService.getInstance();
        
        System.out.println("[CalRestore] 🔍 Search strategy: uniqueId=" + uniqueId + 
            ", fixedId=" + fixedId + ", calName='" + calendarName + "'");
        
        if (uniqueId > 0) {
            WorkCalendar byId = calService.findBaseCalendar(uniqueId);
            if (byId != null) {
                System.out.println("[CalRestore] ✅ Found by uniqueId=" + uniqueId);
                return byId;
            }
            
            byId = findInDerivedCalendarsByUniqueId(calService, uniqueId);
            if (byId != null) {
                System.out.println("[CalRestore] ✅ Found in derived by uniqueId=" + uniqueId);
                return byId;
            }
        }
        
        WorkCalendar byFixedId = findByFixedIdWithVerification(fixedId, calendarName, resourceName, calService);
        if (byFixedId != null) {
            return byFixedId;
        }
        
        if (calendarName != null && !calendarName.equals(resourceName)) {
            WorkCalendar byName = findByCalendarName(calService, calendarName);
            if (byName != null) {
                System.out.println("[CalRestore] ✅ Found by calendar name: '" + calendarName + "'");
                return byName;
            }
        }
        
        System.out.println("[CalRestore] ⚠️ All strategies failed, using Standard fallback");
        return findStandardCalendar(calService);
    }
    
    private WorkCalendar findInDerivedCalendarsByUniqueId(CalendarService calService, long uniqueId) {
        java.util.ArrayList derivedList = calService.getDerivedCalendars();
        if (derivedList == null || derivedList.isEmpty()) {
            return null;
        }
        
        for (Object obj : derivedList) {
            if (obj instanceof WorkingCalendar) {
                WorkingCalendar wc = (WorkingCalendar) obj;
                if (wc.getUniqueId() == uniqueId) {
                    return wc;
                }
            }
        }
        return null;
    }
    
    private WorkCalendar findByFixedIdWithVerification(int fixedId, String calendarName, 
                                                        String resourceName, CalendarService calService) {
        WorkCalendar candidate = null;
        
        switch (fixedId) {
            case 1:
                candidate = findStandardCalendar(calService);
                break;
            case 2:
                candidate = find24HoursCalendar(calService);
                break;
            case 3:
                candidate = findNightShiftCalendar(calService);
                break;
            case 0:
                return findCustomCalendar(calService, calendarName);
            default:
                System.out.println("[CalRestore] ⚠️ Unknown fixedId: " + fixedId);
                return findStandardCalendar(calService);
        }
        
        if (candidate instanceof WorkingCalendar) {
            WorkingCalendar wc = (WorkingCalendar) candidate;
            String candidateName = wc.getName();
            
            System.out.println("[CalRestore] 🔍 Verifying candidate: name='" + candidateName + 
                "', uniqueId=" + wc.getUniqueId() + ", fixedId=" + wc.getFixedId());
            
            if (isSystemCalendarName(candidateName, fixedId)) {
                System.out.println("[CalRestore] ✅ Verified as system calendar");
                return candidate;
            } else {
                System.out.println("[CalRestore] ⚠️ Candidate name suspicious: '" + candidateName + 
                    "' does not match expected system name for fixedId=" + fixedId);
            }
        }
        
        return candidate;
    }
    
    /**
     * Поиск Standard календаря V3.0.
     * КРИТИЧЕСКОЕ: Использует findByFixedId(1), НЕ getStandardInstance()!
     * 
     * getStandardInstance() возвращает "default base" (fixedId=0) - НЕЛЬЗЯ!
     * findByFixedId(1) возвращает "Пятидневка" (fixedId=1) - ПРАВИЛЬНО!
     */
    private WorkCalendar findStandardCalendar(CalendarService calService) {
        System.out.println("[CalRestore] 🔍 Searching for Standard calendar (V3.0)...");
        
        // ПРИОРИТЕТ 1: findByFixedId(1) - САМЫЙ НАДЁЖНЫЙ!
        WorkCalendar cal = calService.findByFixedId(1);
        if (cal != null && isValidStandardCalendar(cal)) {
            System.out.println("[CalRestore] ✅ Found Standard via findByFixedId(1)");
            return cal;
        }
        
        // ПРИОРИТЕТ 2: getDefaultInstance() (НЕ getStandardInstance!)
        cal = calService.getDefaultInstance();
        if (cal != null && isValidStandardCalendar(cal)) {
            System.out.println("[CalRestore] ✅ Found Standard via getDefaultInstance()");
            return cal;
        }
        
        // ПРИОРИТЕТ 3: По известным именам (исключаем "default base"!)
        String[] knownNames = {"Пятидневка", "Стандартный", "Standard"};
        for (String knownName : knownNames) {
            cal = CalendarService.findBaseCalendar(knownName);
            if (cal != null && isValidStandardCalendar(cal)) {
                System.out.println("[CalRestore] ✅ Found Standard by name: '" + knownName + "'");
                return cal;
            }
        }
        
        // ПРИОРИТЕТ 4: Messages
        try {
            String standardName = Messages.getString("Calendar.Standard");
            cal = CalendarService.findBaseCalendar(standardName);
            if (cal != null && isValidStandardCalendar(cal)) {
                System.out.println("[CalRestore] ✅ Found Standard by Messages name");
                return cal;
            }
        } catch (Exception e) {
            log.warn("[CalRestore] Messages lookup failed", e);
        }
        
        System.out.println("[CalRestore] ❌ Standard calendar NOT FOUND!");
        return null;
    }
    
    /**
     * Проверяет что календарь - валидный Standard (fixedId=1), а не "default base" (fixedId=0).
     */
    private boolean isValidStandardCalendar(WorkCalendar cal) {
        if (!(cal instanceof WorkingCalendar)) return false;
        WorkingCalendar wc = (WorkingCalendar) cal;
        return wc.getFixedId() == 1;
    }
    
    private WorkCalendar find24HoursCalendar(CalendarService calService) {
        System.out.println("[CalRestore] 🔍 Searching for 24Hours calendar...");
        
        WorkCalendar cal = invoke24HoursMethod();
        if (cal != null && verifySystemCalendar(cal, 2, "24Hours")) {
            System.out.println("[CalRestore] ✅ Found 24Hours via Reflection");
            return cal;
        }

        try {
            String name24Hours = Messages.getString("Calendar.24Hours");
            System.out.println("[CalRestore] Trying by Messages name: '" + name24Hours + "'");
            cal = CalendarService.findBaseCalendar(name24Hours);
            
            if (cal != null && verifySystemCalendar(cal, 2, "24Hours")) {
                System.out.println("[CalRestore] ✅ Found 24Hours by Messages name");
                return cal;
            }
        } catch (Exception e) {
            log.warn("[CalRestore] Messages lookup failed", e);
        }
        
        String[] knownNames = {"24 часа", "Круглосуточный (24/7)", "24/7"};
        for (String knownName : knownNames) {
            System.out.println("[CalRestore] Trying known name: '" + knownName + "'");
            cal = CalendarService.findBaseCalendar(knownName);
            
            if (cal != null && verifySystemCalendar(cal, 2, "24Hours")) {
                System.out.println("[CalRestore] ✅ Found 24Hours by known name: '" + knownName + "'");
                return cal;
            }
        }
        
        System.out.println("[CalRestore] ⚠️ 24Hours not found, fallback to Standard");
        return findStandardCalendar(calService);
    }
    
    private WorkCalendar findNightShiftCalendar(CalendarService calService) {
        System.out.println("[CalRestore] 🔍 Searching for NightShift calendar...");
        
        WorkCalendar cal = invokeNightShiftMethod();
        if (cal != null && verifySystemCalendar(cal, 3, "NightShift")) {
            System.out.println("[CalRestore] ✅ Found NightShift via Reflection");
            return cal;
        }

        try {
            String nameNightShift = Messages.getString("Calendar.NightShift");
            System.out.println("[CalRestore] Trying by Messages name: '" + nameNightShift + "'");
            cal = CalendarService.findBaseCalendar(nameNightShift);
            
            if (cal != null && verifySystemCalendar(cal, 3, "NightShift")) {
                System.out.println("[CalRestore] ✅ Found NightShift by Messages name");
                return cal;
            }
        } catch (Exception e) {
            log.warn("[CalRestore] Messages lookup failed", e);
        }
        
        String[] knownNames = {"Ночная смена", "Night Shift"};
        for (String knownName : knownNames) {
            System.out.println("[CalRestore] Trying known name: '" + knownName + "'");
            cal = CalendarService.findBaseCalendar(knownName);
            
            if (cal != null && verifySystemCalendar(cal, 3, "NightShift")) {
                System.out.println("[CalRestore] ✅ Found NightShift by known name: '" + knownName + "'");
                return cal;
            }
        }
        
        System.out.println("[CalRestore] ⚠️ NightShift not found, fallback to Standard");
        return findStandardCalendar(calService);
    }
    
    private boolean verifySystemCalendar(WorkCalendar calendar, int expectedFixedId, String expectedType) {
        if (!(calendar instanceof WorkingCalendar)) {
            return false;
        }
        
        WorkingCalendar wc = (WorkingCalendar) calendar;
        int actualFixedId = wc.getFixedId();
        String actualName = wc.getName();
        long actualUniqueId = wc.getUniqueId();
        
        if (actualFixedId != expectedFixedId) {
            System.out.println("[CalRestore] ⚠️ Verification failed: fixedId mismatch " +
                "(expected=" + expectedFixedId + ", actual=" + actualFixedId + ")");
            return false;
        }
        
        if (actualUniqueId <= 0) {
            System.out.println("[CalRestore] ⚠️ Verification warning: invalid uniqueId=" + actualUniqueId);
        }
        
        boolean nameValid = isSystemCalendarName(actualName, expectedFixedId);
        if (!nameValid) {
            System.out.println("[CalRestore] ⚠️ Verification failed: name '" + actualName + 
                "' does not match expected type '" + expectedType + "'");
            return false;
        }
        
        System.out.println("[CalRestore] ✅ Verification passed for '" + actualName + 
            "' (fixedId=" + actualFixedId + ", uniqueId=" + actualUniqueId + ")");
        return true;
    }
    
    private boolean isSystemCalendarName(String name, int fixedId) {
        if (name == null) return false;
        
        switch (fixedId) {
            case 1:
                return name.contains("Стандарт") || name.contains("Standard") || 
                       name.equals("default base") || name.equals("Пятидневка");
            case 2:
                return name.contains("24") || name.contains("Круглосуточн") || 
                       name.contains("24/7") || name.contains("Hours");
            case 3:
                return name.contains("Ночн") || name.contains("Night") || 
                       name.contains("Shift") || name.contains("смен");
            default:
                return false;
        }
    }
    
    private WorkCalendar findByCalendarName(CalendarService calService, String name) {
        WorkCalendar cal = calService.findBaseCalendar(name);
        if (cal != null) {
            return cal;
        }
        
        return findInDerivedCalendars(calService, name);
    }
    
    private WorkCalendar findCustomCalendar(CalendarService calService, String name) {
        if (name == null || name.trim().isEmpty()) {
            System.out.println("[CalRestore] ⚠️ Custom calendar has no name, fallback to Standard");
            return findStandardCalendar(calService);
        }
        
        System.out.println("[CalRestore] 🔍 Searching for custom calendar: '" + name + "'");
        
        WorkCalendar cal = CalendarService.findBaseCalendar(name);
        if (cal != null) {
            System.out.println("[CalRestore] ✅ Found custom in baseCalendars: '" + name + "'");
            return cal;
        }
        
        cal = findInDerivedCalendars(calService, name);
        if (cal != null) {
            System.out.println("[CalRestore] ✅ Found custom in derivedCalendars: '" + name + "'");
            return cal;
        }
        
        System.out.println("[CalRestore] ⚠️ Custom calendar '" + name + 
            "' not found in any list, fallback to Standard");
        return findStandardCalendar(calService);
    }
    
    private WorkCalendar findInDerivedCalendars(CalendarService calService, String name) {
        java.util.ArrayList derivedList = calService.getDerivedCalendars();
        if (derivedList == null || derivedList.isEmpty()) {
            return null;
        }
        
        for (Object obj : derivedList) {
            if (obj instanceof WorkingCalendar) {
                WorkingCalendar wc = (WorkingCalendar) obj;
                if (wc.getName() != null && wc.getName().equals(name)) {
                    return wc;
                }
            }
        }
        return null;
    }
    
    private WorkCalendar invoke24HoursMethod() {
        try {
            Method method = WorkingCalendar.class.getDeclaredMethod("get24HoursInstance");
            method.setAccessible(true);
            WorkCalendar cal = (WorkCalendar) method.invoke(null);
            if (cal != null && cal instanceof WorkingCalendar) {
                WorkingCalendar wc = (WorkingCalendar) cal;
                System.out.println("[CalRestore] Reflection result for 24h: name='" + 
                    wc.getName() + "', uniqueId=" + wc.getUniqueId());
            }
            return cal;
        } catch (Exception e) {
            System.out.println("[CalRestore] ⚠️ Reflection for get24HoursInstance failed: " + 
                e.getMessage());
            return null;
        }
    }
    
    private WorkCalendar invokeNightShiftMethod() {
        try {
            Method method = WorkingCalendar.class.getDeclaredMethod("getNightShiftInstance");
            method.setAccessible(true);
            WorkCalendar cal = (WorkCalendar) method.invoke(null);
            if (cal != null && cal instanceof WorkingCalendar) {
                WorkingCalendar wc = (WorkingCalendar) cal;
                System.out.println("[CalRestore] Reflection result for NightShift: name='" + 
                    wc.getName() + "', uniqueId=" + wc.getUniqueId());
            }
            return cal;
        } catch (Exception e) {
            System.out.println("[CalRestore] ⚠️ Reflection for getNightShiftInstance failed: " + 
                e.getMessage());
            return null;
        }
    }
    
    private void dumpCalendarServiceState() {
        CalendarService calService = CalendarService.getInstance();
        
        System.out.println("[CalRestore] 📊 CalendarService state:");
        
        java.util.ArrayList baseList = calService.getBaseCalendars();
        System.out.println("[CalRestore]   Base calendars: " + 
            (baseList != null ? baseList.size() : 0));
        if (baseList != null) {
            for (Object obj : baseList) {
                if (obj instanceof WorkingCalendar) {
                    WorkingCalendar wc = (WorkingCalendar) obj;
                    System.out.println("[CalRestore]     - '" + wc.getName() + 
                        "' (fixedId=" + wc.getFixedId() + ", uniqueId=" + wc.getUniqueId() + ")");
                }
            }
        }
        
        java.util.ArrayList derivedList = calService.getDerivedCalendars();
        System.out.println("[CalRestore]   Derived calendars: " + 
            (derivedList != null ? derivedList.size() : 0));
        if (derivedList != null) {
            int count = 0;
            for (Object obj : derivedList) {
                if (obj instanceof WorkingCalendar) {
                    WorkingCalendar wc = (WorkingCalendar) obj;
                    System.out.println("[CalRestore]     - '" + wc.getName() + 
                        "' (fixedId=" + wc.getFixedId() + ", uniqueId=" + wc.getUniqueId() + ")");
                    if (++count >= 10) {
                        System.out.println("[CalRestore]     ... (truncated)");
                        break;
                    }
                }
            }
        }
    }
    
    public int getRestoredCount() {
        return restoredCount;
    }
    
    public int getFailedCount() {
        return failedCount;
    }
    
    /**
     * V4.0: Возвращает аудит-лог для анализа выполненных изменений.
     */
    public CalendarAuditLog getAuditLog() {
        return auditLog;
    }
}
