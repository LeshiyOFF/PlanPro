package com.projectlibre.api.exchange;

import com.projectlibre1.pm.task.Project;
import com.projectlibre1.pm.task.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import java.util.Iterator;

/**
 * Логирование дат задач после десериализации .pod для диагностики.
 * Единый источник логов: getStart(), getEnd(), getCustomDate(0)/(1), расписание.
 *
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public final class TaskDateDiagnosticsLogger {

    private static final Logger log = LoggerFactory.getLogger(TaskDateDiagnosticsLogger.class);
    private static final int MAX_TASKS_TO_LOG = 10;

    private TaskDateDiagnosticsLogger() {
    }

    /**
     * Логирует даты задач сразу после загрузки проекта (уровень DEBUG).
     *
     * @param project загруженный проект
     */
    public static void logTaskDatesAfterDeserialization(Project project) {
        if (project == null) {
            return;
        }
        log.debug("[HeadlessImporter] Task dates AFTER deserialization");
        try {
            Iterator<Task> taskIter = project.getTaskOutlineIterator();
            int taskCount = 0;
            while (taskIter.hasNext() && taskCount < MAX_TASKS_TO_LOG) {
                Task task = taskIter.next();
                if (!task.isExternal()) {
                    logOneTaskDates(task);
                    taskCount++;
                }
            }
        } catch (Exception e) {
            log.warn("[HeadlessImporter] Failed to log task dates: {}", e.getMessage());
        }
    }

    private static void logOneTaskDates(Task task) {
        long start = task.getStart();
        long end = task.getEnd();
        long customStart = readCustomDateSafe(task, 0);
        long customEnd = readCustomDateSafe(task, 1);
        Long scheduleStart = readScheduleStartSafe(task);
        Long scheduleFinish = readScheduleFinishSafe(task);

        StringBuilder msg = new StringBuilder();
        msg.append("Task '").append(task.getName()).append("': ");
        msg.append("getStart()=").append(new Date(start));
        msg.append(", getEnd()=").append(new Date(end));
        msg.append(", getCustomDate(0)=").append(customStart > 0 ? new Date(customStart) : "n/a");
        msg.append(", getCustomDate(1)=").append(customEnd > 0 ? new Date(customEnd) : "n/a");
        if (scheduleStart != null && scheduleFinish != null) {
            msg.append(", schedule.start=").append(new Date(scheduleStart));
            msg.append(", schedule.finish=").append(new Date(scheduleFinish));
        }
        msg.append(", constraint=").append(task.getConstraintType());
        log.debug("[HeadlessImporter]   {}", msg);
    }

    private static long readCustomDateSafe(Task task, int index) {
        try {
            return task.getCustomDate(index);
        } catch (Exception e) {
            return 0L;
        }
    }

    private static Long readScheduleStartSafe(Task task) {
        try {
            if (task.getCurrentSchedule() != null) {
                return task.getCurrentSchedule().getStart();
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private static Long readScheduleFinishSafe(Task task) {
        try {
            if (task.getCurrentSchedule() != null) {
                return task.getCurrentSchedule().getFinish();
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}
