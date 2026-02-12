package com.projectlibre.api.converter;

import com.projectlibre1.pm.calendar.WorkCalendar;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.pm.task.Task;
import com.projectlibre1.pm.resource.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

/**
 * Собирает множество календарей, используемых проектом (задачи, ресурсы, календарь проекта).
 * Single Responsibility: только сбор ссылок на календари проекта.
 * Clean Architecture: Domain/Application layer.
 */
public final class ProjectCalendarCollector {

    private static final Logger log = LoggerFactory.getLogger(ProjectCalendarCollector.class);

    private ProjectCalendarCollector() { }

    /**
     * Собирает все календари, на которые ссылается проект.
     */
    public static Set<WorkCalendar> collectUsedCalendars(Project project) {
        Set<WorkCalendar> used = new HashSet<>();
        if (project == null) return used;

        WorkCalendar projectCal = project.getWorkCalendar();
        if (projectCal != null) used.add(projectCal);

        Iterator<Task> taskIt = project.getTaskOutlineIterator();
        if (taskIt != null) {
            while (taskIt.hasNext()) {
                Task task = taskIt.next();
                if (task == null) continue;
                WorkCalendar cal = task.getEffectiveWorkCalendar();
                if (cal != null) used.add(cal);
            }
        }

        if (project.getResourcePool() != null) {
            try {
                java.util.ArrayList list = project.getResourcePool().getResourceList();
                if (list != null) {
                    @SuppressWarnings("unchecked")
                    Iterator<Resource> resIt = list.iterator();
                    while (resIt.hasNext()) {
                        Resource r = resIt.next();
                        if (r == null) continue;
                        WorkCalendar cal = r.getWorkCalendar();
                        if (cal != null) used.add(cal);
                    }
                }
            } catch (Exception e) {
                log.warn("[ProjectCalendarCollector] Error collecting resource calendars: {}", e.getMessage());
            }
        }

        log.debug("[ProjectCalendarCollector] Collected {} calendars for project", used.size());
        return used;
    }
}
