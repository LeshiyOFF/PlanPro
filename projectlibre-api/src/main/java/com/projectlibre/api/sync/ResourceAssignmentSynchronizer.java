package com.projectlibre.api.sync;

import com.projectlibre.api.dto.TaskSyncRequestDto.FrontendTaskDto;
import com.projectlibre.api.dto.ResourceAssignmentItemDto;
import com.projectlibre1.pm.assignment.Assignment;
import com.projectlibre1.pm.assignment.AssignmentService;
import com.projectlibre1.pm.resource.Resource;
import com.projectlibre1.pm.resource.ResourcePool;
import com.projectlibre1.pm.task.NormalTask;
import com.projectlibre1.pm.task.Project;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * Синхронизатор назначений ресурсов из Frontend в Core Project.
 * Приводит текущий snapshot задачи в соответствие со списком с фронта (replace, не add).
 * Предотвращает деградацию units 100% → 50% → 25% при циклах save/load.
 *
 * @author ProjectLibre Team
 * @version 1.1.0
 */
public class ResourceAssignmentSynchronizer {

    private int createdCount = 0;
    private int skippedCount = 0;
    private int removedCount = 0;

    /**
     * Синхронизирует назначения ресурсов для списка задач.
     * Сначала удаляет все не-default назначения текущего snapshot, затем добавляет из фронта.
     *
     * @param project Core Project с ResourcePool
     * @param frontendTasks Задачи из Frontend с resourceAssignments/resourceIds
     * @param taskMap Карта соответствия Frontend ID -> Core Task
     */
    public void synchronize(Project project, List<FrontendTaskDto> frontendTasks,
                           Map<String, NormalTask> taskMap) {
        if (project == null || frontendTasks == null || taskMap == null) {
            return;
        }

        ResourcePool resourcePool = project.getResourcePool();
        if (resourcePool == null) {
            System.err.println("[ResSync] ResourcePool is null");
            return;
        }

        System.out.println("[ResSync] Starting resource assignment sync");
        createdCount = 0;
        skippedCount = 0;
        removedCount = 0;

        for (FrontendTaskDto frontendTask : frontendTasks) {
            NormalTask coreTask = taskMap.get(frontendTask.getId());
            if (coreTask == null) {
                skippedCount++;
                continue;
            }
            clearNonDefaultAssignments(coreTask);
            // Приоритет: resourceAssignments (с units), иначе resourceIds с units=1.0
            List<ResourceAssignmentItemDto> assignments = frontendTask.getResourceAssignments();
            if (assignments != null && !assignments.isEmpty()) {
                for (ResourceAssignmentItemDto a : assignments) {
                    if (a == null || a.getResourceId() == null || a.getResourceId().isEmpty()) continue;
                    double units = (a.getUnits() != null && a.getUnits() > 0) ? a.getUnits() : 1.0;
                    createAssignment(coreTask, resourcePool, a.getResourceId(), units);
                }
            } else {
                List<String> resourceIds = frontendTask.getResourceIds();
                if (resourceIds != null && !resourceIds.isEmpty()) {
                    for (String resourceId : resourceIds) {
                        createAssignment(coreTask, resourcePool, resourceId, 1.0);
                    }
                }
            }
        }

        System.out.println("[ResSync] ✅ Completed: created=" + createdCount + ", removed=" + removedCount + ", skipped=" + skippedCount);
    }

    /**
     * Удаляет все не-default назначения задачи в текущем snapshot.
     * Копия списка перед итерацией избегает CME при удалении через AssignmentService.
     */
    private void clearNonDefaultAssignments(NormalTask coreTask) {
        List<Assignment> toRemove = new ArrayList<>();
        for (Iterator<?> it = coreTask.getAssignments().iterator(); it.hasNext(); ) {
            Assignment a = (Assignment) it.next();
            if (!a.isDefault()) {
                toRemove.add(a);
            }
        }
        if (toRemove.isEmpty()) {
            return;
        }
        AssignmentService.getInstance().remove(toRemove, null, false);
        removedCount += toRemove.size();
    }
    
    /**
     * Создает назначение ресурса на задачу с указанным процентом загрузки (units: 1.0 = 100%).
     */
    private void createAssignment(NormalTask task, ResourcePool resourcePool, String resourceId, double units) {
        try {
            long resId = parseResourceId(resourceId);
            Resource resource = resourcePool.findById(resId);
            if (resource == null) {
                skippedCount++;
                return;
            }
            double safeUnits = (units > 0 && units <= 10.0) ? units : 1.0;
            Assignment assignment = Assignment.getInstance(task, resource, safeUnits, 0);
            if (assignment != null) {
                task.addAssignment(assignment);
                createdCount++;
                System.out.println("[ResSync] Assigned: " + resource.getName() + " -> " + task.getName() + " units=" + safeUnits);
            }
        } catch (Exception e) {
            skippedCount++;
            System.err.println("[ResSync] Failed to assign resource: " + e.getMessage());
        }
    }
    
    /**
     * Парсит ID ресурса из строки в long.
     */
    private long parseResourceId(String resourceId) {
        try {
            return Long.parseLong(resourceId);
        } catch (NumberFormatException e) {
            // Если не число, возвращаем -1
            return -1;
        }
    }
    
    public int getCreatedCount() { return createdCount; }
    public int getSkippedCount() { return skippedCount; }
    public int getRemovedCount() { return removedCount; }
}
