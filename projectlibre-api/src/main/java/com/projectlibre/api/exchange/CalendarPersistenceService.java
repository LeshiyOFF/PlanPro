package com.projectlibre.api.exchange;

import com.projectlibre1.pm.calendar.CalendarService;
import com.projectlibre1.pm.calendar.WorkCalendar;
import com.projectlibre1.pm.calendar.WorkingCalendar;
import com.projectlibre1.pm.resource.Resource;
import com.projectlibre1.pm.resource.ResourcePool;
import com.projectlibre1.pm.task.Project;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * Сервис сохранения и восстановления информации о календарях.
 * Сохраняет оригинальные имена календарей ДО того, как они будут испорчены
 * при десериализации (когда EnterpriseResource.setName затирает имя календаря).
 * 
 * Clean Architecture: Infrastructure Layer - persistence для календарей.
 * SOLID: Single Responsibility - только persistence календарей.
 */
public class CalendarPersistenceService {
    
    private static final Logger log = LoggerFactory.getLogger(CalendarPersistenceService.class);
    
    private final Map<Long, CalendarSnapshot> calendarSnapshots = new HashMap<>();
    
    /**
     * Сохраняет снапшот информации о календарях ресурсов ДО десериализации.
     */
    public void captureCalendarSnapshots(Project project) {
        if (project == null) return;
        
        calendarSnapshots.clear();
        ResourcePool pool = project.getResourcePool();
        if (pool == null) return;
        
        @SuppressWarnings("unchecked")
        Collection<Resource> resources = pool.getResourceList();
        if (resources == null) return;
        
        for (Resource resource : resources) {
            captureResourceCalendar(resource);
        }
        
        log.info("[CalPersist] Captured {} calendar snapshots", calendarSnapshots.size());
    }
    
    private void captureResourceCalendar(Resource resource) {
        WorkCalendar cal = resource.getWorkCalendar();
        if (!(cal instanceof WorkingCalendar)) return;
        
        WorkingCalendar wc = (WorkingCalendar) cal;
        long resourceId = resource.getUniqueId();
        
        CalendarSnapshot snapshot = new CalendarSnapshot(
            wc.getUniqueId(),
            wc.getFixedId(),
            wc.getName(),
            wc.getBaseCalendar() != null ? 
                ((WorkingCalendar) wc.getBaseCalendar()).getUniqueId() : -1
        );
        
        calendarSnapshots.put(resourceId, snapshot);
    }
    
    /**
     * Восстанавливает календари после загрузки проекта.
     */
    public void restoreCalendars(Project project) {
        if (project == null) return;
        
        ResourcePool pool = project.getResourcePool();
        if (pool == null) return;
        
        CalendarService calService = CalendarService.getInstance();
        calService.cleanDerivedDuplicates();
        
        @SuppressWarnings("unchecked")
        Collection<Resource> resources = pool.getResourceList();
        if (resources == null) return;
        
        int restored = 0;
        for (Resource resource : resources) {
            if (restoreResourceCalendar(resource, calService)) {
                restored++;
            }
        }
        
        log.info("[CalPersist] Restored {} calendars from snapshots", restored);
    }
    
    private boolean restoreResourceCalendar(Resource resource, CalendarService calService) {
        WorkCalendar currentCal = resource.getWorkCalendar();
        if (!(currentCal instanceof WorkingCalendar)) return false;
        
        WorkingCalendar wc = (WorkingCalendar) currentCal;
        int fixedId = wc.getFixedId();
        
        WorkCalendar correctCal = findCorrectCalendar(fixedId, wc.getName(), calService);
        if (correctCal != null && correctCal != currentCal) {
            calService.reassignCalendar(resource, currentCal, correctCal);
            resource.setWorkCalendar(correctCal);
            return true;
        }
        
        return false;
    }
    
    private WorkCalendar findCorrectCalendar(int fixedId, String name, CalendarService calService) {
        WorkCalendar result = calService.findByFixedId(fixedId);
        if (result != null) return result;
        
        if (fixedId == 0 && name != null) {
            result = calService.findDerivedCalendar(name);
            if (result != null) return result;
            result = CalendarService.findBaseCalendar(name);
        }
        
        return result;
    }
    
    /**
     * Структура для хранения снапшота календаря.
     */
    private static class CalendarSnapshot {
        final long uniqueId;
        final int fixedId;
        final String name;
        final long baseCalendarId;
        
        CalendarSnapshot(long uniqueId, int fixedId, String name, long baseCalendarId) {
            this.uniqueId = uniqueId;
            this.fixedId = fixedId;
            this.name = name;
            this.baseCalendarId = baseCalendarId;
        }
    }
}
