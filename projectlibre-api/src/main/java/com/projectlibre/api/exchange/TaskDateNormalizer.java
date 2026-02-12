package com.projectlibre.api.exchange;

import com.projectlibre1.pm.task.Project;
import com.projectlibre1.pm.task.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Iterator;

/**
 * Выравнивание getStart()/getEnd() с каноническими датами (CustomDate 0/1) после загрузки .pod.
 * Устраняет расхождение между отображаемыми датами (API использует CustomDate) и внутренним состоянием Core.
 *
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public final class TaskDateNormalizer {

    private static final Logger log = LoggerFactory.getLogger(TaskDateNormalizer.class);

    private TaskDateNormalizer() {
    }

    /**
     * Для каждой задачи: если заданы CustomDate(0) и (1) и они отличаются от getStart()/getEnd(),
     * выставляет start/end и расписание в соответствие с CustomDate.
     *
     * @param project загруженный проект
     * @return количество задач, для которых были скорректированы даты
     */
    public static int normalizeTaskDatesAfterLoad(Project project) {
        if (project == null) {
            return 0;
        }
        int normalizedCount = 0;
        try {
            Iterator<Task> taskIter = project.getTaskOutlineIterator();
            while (taskIter.hasNext()) {
                Task task = taskIter.next();
                if (!task.isExternal() && normalizeOneTask(task)) {
                    normalizedCount++;
                }
            }
            if (normalizedCount > 0) {
                log.info("[HeadlessImporter] Normalized task dates for {} task(s) after load", normalizedCount);
            }
        } catch (Exception e) {
            log.warn("[HeadlessImporter] Task date normalization failed: {}", e.getMessage());
        }
        return normalizedCount;
    }

    /**
     * Нормализует даты одной задачи. Возвращает true, если были изменения.
     */
    private static boolean normalizeOneTask(Task task) {
        long customStart = readCustomDateSafe(task, 0);
        long customEnd = readCustomDateSafe(task, 1);
        if (customStart <= 0 || customEnd <= 0) {
            return false;
        }
        long currentStart = task.getStart();
        long currentEnd = task.getEnd();
        if (currentStart == customStart && currentEnd == customEnd) {
            return false;
        }
        log.warn("[HeadlessImporter] Date mismatch for task '{}': getStart/getEnd vs CustomDate(0)/(1), aligning",
                task.getName());
        try {
            task.setStart(customStart);
            task.setEnd(customEnd);
            syncScheduleToDates(task, customStart, customEnd);
        } catch (Exception e) {
            log.warn("[HeadlessImporter] Failed to normalize task '{}': {}", task.getName(), e.getMessage());
            return false;
        }
        return true;
    }

    private static void syncScheduleToDates(Task task, long start, long end) {
        try {
            if (task.getCurrentSchedule() != null) {
                task.getCurrentSchedule().setStart(start);
                task.getCurrentSchedule().setFinish(end);
            }
        } catch (Exception e) {
            log.debug("[HeadlessImporter] Schedule sync skip for task: {}", e.getMessage());
        }
    }

    private static long readCustomDateSafe(Task task, int index) {
        try {
            return task.getCustomDate(index);
        } catch (Exception e) {
            return 0L;
        }
    }
}
