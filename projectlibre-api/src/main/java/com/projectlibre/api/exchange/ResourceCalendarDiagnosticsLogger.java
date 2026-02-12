package com.projectlibre.api.exchange;

import com.projectlibre.api.validator.CalendarSafetyValidator;
import com.projectlibre1.pm.calendar.WorkCalendar;
import com.projectlibre1.pm.calendar.WorkingCalendar;
import com.projectlibre1.pm.resource.Resource;
import com.projectlibre1.pm.task.Project;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collection;

/**
 * Логирование календарей ресурсов после десериализации и после восстановления.
 *
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public final class ResourceCalendarDiagnosticsLogger {

    private static final Logger log = LoggerFactory.getLogger(ResourceCalendarDiagnosticsLogger.class);
    private static final int MAX_RESOURCES_TO_LOG = 10;

    private ResourceCalendarDiagnosticsLogger() {
    }

    /**
     * Логирует календари ресурсов сразу после десериализации (уровень DEBUG).
     */
    public static void logAfterDeserialization(Project project) {
        log.debug("[HeadlessImporter] Resource calendars AFTER deserialization");
        logResourceCalendars(project, true);
    }

    /**
     * Логирует календари ресурсов после восстановления календарей (уровень DEBUG).
     */
    public static void logAfterRestoration(Project project) {
        log.debug("[HeadlessImporter] Resource calendars AFTER restoration");
        logResourceCalendars(project, false);
    }

    private static void logResourceCalendars(Project project, boolean withValidation) {
        try {
            if (project.getResourcePool() == null) {
                log.debug("[HeadlessImporter] ResourcePool is NULL");
                return;
            }
            Collection<?> list = project.getResourcePool().getResourceList();
            if (list == null) {
                log.debug("[HeadlessImporter] ResourceList is NULL");
                return;
            }
            int count = 0;
            for (Object obj : list) {
                if (obj instanceof Resource) {
                    Resource r = (Resource) obj;
                    WorkCalendar cal = r.getWorkCalendar();
                    if (cal instanceof WorkingCalendar) {
                        WorkingCalendar wc = (WorkingCalendar) cal;
                        String prefix = withValidation && !new CalendarSafetyValidator().validate(wc).isValid()
                                ? "UNSAFE " : "";
                        log.debug("[HeadlessImporter]   - '{}' → {} '{}' (fixedId={}, uniqueId={})",
                                r.getName(), prefix, wc.getName(), wc.getFixedId(), wc.getUniqueId());
                    } else {
                        log.debug("[HeadlessImporter]   - '{}' → NO CALENDAR", r.getName());
                    }
                    if (++count >= MAX_RESOURCES_TO_LOG) break;
                }
            }
        } catch (Exception e) {
            log.warn("[HeadlessImporter] Resource calendar log failed: {}", e.getMessage());
        }
    }
}
