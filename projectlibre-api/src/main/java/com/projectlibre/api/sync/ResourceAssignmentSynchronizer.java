package com.projectlibre.api.sync;

import com.projectlibre.api.dto.TaskSyncRequestDto.FrontendTaskDto;
import com.projectlibre1.pm.assignment.Assignment;
import com.projectlibre1.pm.resource.Resource;
import com.projectlibre1.pm.resource.ResourcePool;
import com.projectlibre1.pm.task.NormalTask;
import com.projectlibre1.pm.task.Project;

import java.util.List;
import java.util.Map;

/**
 * Синхронизатор назначений ресурсов из Frontend в Core Project.
 * Создает связи задача-ресурс на основе массива resourceIds.
 * 
 * Принцип SRP: отвечает только за синхронизацию назначений ресурсов.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ResourceAssignmentSynchronizer {
    
    private int createdCount = 0;
    private int skippedCount = 0;
    
    /**
     * Синхронизирует назначения ресурсов для списка задач.
     * 
     * @param project Core Project с ResourcePool
     * @param frontendTasks Задачи из Frontend с resourceIds
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
        
        for (FrontendTaskDto frontendTask : frontendTasks) {
            List<String> resourceIds = frontendTask.getResourceIds();
            if (resourceIds == null || resourceIds.isEmpty()) {
                continue;
            }
            
            NormalTask coreTask = taskMap.get(frontendTask.getId());
            if (coreTask == null) {
                skippedCount++;
                continue;
            }
            
            for (String resourceId : resourceIds) {
                createAssignment(coreTask, resourcePool, resourceId);
            }
        }
        
        System.out.println("[ResSync] ✅ Completed: created=" + createdCount + ", skipped=" + skippedCount);
    }
    
    /**
     * Создает назначение ресурса на задачу.
     */
    private void createAssignment(NormalTask task, ResourcePool resourcePool, String resourceId) {
        try {
            // Пытаемся найти ресурс по ID
            long resId = parseResourceId(resourceId);
            Resource resource = resourcePool.findById(resId);
            
            if (resource == null) {
                skippedCount++;
                return;
            }
            
            // Создаем назначение с 100% загрузкой
            Assignment assignment = Assignment.getInstance(task, resource, 1.0, 0);
            
            if (assignment != null) {
                // Добавляем назначение к задаче
                task.addAssignment(assignment);
                createdCount++;
                System.out.println("[ResSync] Assigned: " + resource.getName() + " -> " + task.getName());
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
}
