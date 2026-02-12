package com.projectlibre.api.sync;

import com.projectlibre.api.converter.CustomCalendarFactory;
import com.projectlibre.api.converter.SystemCalendarResolver;
import com.projectlibre.api.dto.CalendarSyncDto;
import com.projectlibre.api.exchange.CalendarRemovalService;
import com.projectlibre1.pm.calendar.WorkCalendar;
import com.projectlibre1.pm.calendar.WorkingCalendar;
import com.projectlibre1.pm.task.Project;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Синхронизация списка календарей проекта при sync: создание/обновление по DTO и удаление лишних.
 *
 * Clean Architecture: Application Service (Use Cases).
 * SOLID: Single Responsibility — применение projectCalendars к Core.
 *
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ProjectCalendarSyncService {

    private static final Logger log = LoggerFactory.getLogger(ProjectCalendarSyncService.class);

    private final CustomCalendarFactory calendarFactory = new CustomCalendarFactory();
    private final SystemCalendarResolver systemResolver = new SystemCalendarResolver();
    private final CalendarRemovalService removalService = new CalendarRemovalService();

    /**
     * Если projectCalendars null — состав не меняется (sync без поля projectCalendars).
     * Если projectCalendars пустой — оставить только системные (удалить все производные).
     * Иначе применить список: создать/обновить календари, удалить производные не из списка.
     */
    public void applyProjectCalendars(Project project, List<CalendarSyncDto> projectCalendars) {
        if (project == null) {
            log.debug("[ProjectCalendarSync] project null, skipping");
            return;
        }
        if (projectCalendars == null) {
            log.debug("[ProjectCalendarSync] projectCalendars null, skipping");
            return;
        }

        WorkCalendar standard = systemResolver.findStandard();
        if (standard == null) {
            log.warn("[ProjectCalendarSync] Standard calendar not found, skipping removal");
            return;
        }

        Set<Long> allowedUniqueIds =
            projectCalendars.isEmpty()
                ? Collections.emptySet()
                : collectAllowedUniqueIds(projectCalendars);

        try {
            removalService.removeDerivedCalendarsNotInSet(project, allowedUniqueIds, standard);
        } catch (Exception e) {
            log.error("[ProjectCalendarSync] Failed to apply projectCalendars: {}", e.getMessage(), e);
            throw e;
        }
    }

    private Set<Long> collectAllowedUniqueIds(List<CalendarSyncDto> projectCalendars) {
        Set<Long> allowed = new HashSet<>();
        for (CalendarSyncDto dto : projectCalendars) {
            WorkCalendar cal = calendarFactory.createWithSettings(dto);
            if (cal instanceof WorkingCalendar) {
                long id = ((WorkingCalendar) cal).getUniqueId();
                if (id > 0) {
                    allowed.add(id);
                }
            }
        }
        return allowed;
    }
}
