package com.projectlibre.api.exchange;

import com.projectlibre1.pm.calendar.CalendarService;
import com.projectlibre1.pm.calendar.HasCalendar;
import com.projectlibre1.pm.calendar.WorkCalendar;
import com.projectlibre1.pm.calendar.WorkingCalendar;
import com.projectlibre1.pm.resource.Resource;
import com.projectlibre1.pm.resource.ResourcePool;
import com.projectlibre1.pm.task.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.Set;

/**
 * Сервис перепривязки и удаления производных календарей при sync.
 * Перепривязывает ссылки на standard и удаляет календарь из CalendarService.
 *
 * Clean Architecture: Application Service (Use Cases).
 * SOLID: Single Responsibility — только удаление/перепривязка календарей.
 *
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class CalendarRemovalService {

    private static final Logger log = LoggerFactory.getLogger(CalendarRemovalService.class);

    private final CalendarService calService = CalendarService.getInstance();

    /**
     * Перепривязывает все ссылки на toRemove на standard, затем удаляет toRemove из derivedCalendars.
     * Требует project, standard не null; при ошибке логирует и пробрасывает исключение.
     */
    public void removeDerivedCalendarIfUnused(com.projectlibre1.pm.task.Project project,
                                              WorkingCalendar toRemove, WorkCalendar standard) {
        if (project == null || standard == null) {
            log.warn("[CalendarRemoval] project or standard is null, skipping");
            return;
        }
        if (toRemove == null || toRemove == standard) return;

        if (toRemove.getBaseCalendar() == toRemove) {
            log.warn("[CalendarRemoval] Calendar '{}' has self-reference (base == this), proceeding with reassign and removal",
                toRemove.getName());
        }
        try {
            reassignProjectCalendar(project, toRemove, standard);
            reassignTasksCalendars(project, toRemove, standard);
            reassignResourcesCalendars(project, toRemove, standard);
            removeFromDerivedCalendars(toRemove);
        } catch (Exception e) {
            log.error("[CalendarRemoval] removeDerivedCalendarIfUnused failed: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Удаляет из CalendarService все производные календари, чей uniqueId не в allowedUniqueIds.
     * Требует project, standard не null; при ошибке логирует и пробрасывает исключение.
     */
    public void removeDerivedCalendarsNotInSet(com.projectlibre1.pm.task.Project project,
                                               Set<Long> allowedUniqueIds, WorkCalendar standard) {
        if (project == null || standard == null) {
            log.warn("[CalendarRemoval] project or standard is null, skipping");
            return;
        }
        ArrayList derived = calService.getDerivedCalendars();
        if (derived == null || derived.isEmpty()) return;

        WorkCalendar standardInstance = calService.getStandardInstance();
        ArrayList<WorkingCalendar> toRemoveList = new ArrayList<>();
        for (Object obj : derived) {
            if (!(obj instanceof WorkingCalendar)) continue;
            WorkingCalendar wc = (WorkingCalendar) obj;
            if (wc == standardInstance) continue;
            if (!allowedUniqueIds.contains(wc.getUniqueId())) {
                toRemoveList.add(wc);
            }
        }
        try {
            for (WorkingCalendar wc : toRemoveList) {
                removeDerivedCalendarIfUnused(project, wc, standard);
            }
        } catch (Exception e) {
            log.error("[CalendarRemoval] removeDerivedCalendarsNotInSet failed: {}", e.getMessage(), e);
            throw e;
        }
    }

    private void reassignProjectCalendar(com.projectlibre1.pm.task.Project project,
                                         WorkingCalendar toRemove, WorkCalendar standard) {
        if (project.getWorkCalendar() == toRemove) {
            project.setWorkCalendar(standard);
            log.debug("[CalendarRemoval] Project calendar reassigned to standard");
        }
    }

    private void reassignTasksCalendars(com.projectlibre1.pm.task.Project project,
                                        WorkingCalendar toRemove, WorkCalendar standard) {
        Iterator<Task> it = project.getTaskOutlineIterator();
        while (it.hasNext()) {
            Task task = it.next();
            if (task.getEffectiveWorkCalendar() != toRemove) continue;
            HasCalendar hasCal = task.getHasCalendar();
            calService.reassignCalendar(hasCal, toRemove, standard);
            hasCal.setWorkCalendar(standard);
        }
    }

    private void reassignResourcesCalendars(com.projectlibre1.pm.task.Project project,
                                            WorkingCalendar toRemove, WorkCalendar standard) {
        ResourcePool pool = project.getResourcePool();
        if (pool == null) return;
        ArrayList list = pool.getResourceList();
        if (list == null) return;
        for (Object obj : list) {
            if (!(obj instanceof Resource)) continue;
            Resource res = (Resource) obj;
            if (res.getWorkCalendar() != toRemove) continue;
            calService.reassignCalendar(res, toRemove, standard);
            res.setWorkCalendar(standard);
        }
    }

    private void removeFromDerivedCalendars(WorkingCalendar toRemove) {
        ArrayList derived = calService.getDerivedCalendars();
        if (derived == null) return;
        ArrayList<WorkingCalendar> filtered = new ArrayList<>();
        for (Object obj : derived) {
            if (obj instanceof WorkingCalendar && obj != toRemove) {
                filtered.add((WorkingCalendar) obj);
            }
        }
        derived.clear();
        derived.addAll(filtered);
        log.debug("[CalendarRemoval] Removed calendar from derivedCalendars: {}", toRemove.getName());
    }
}
