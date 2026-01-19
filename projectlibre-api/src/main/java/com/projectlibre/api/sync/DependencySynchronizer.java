package com.projectlibre.api.sync;

import com.projectlibre.api.dto.TaskSyncRequestDto.FrontendTaskDto;
import com.projectlibre1.pm.dependency.Dependency;
import com.projectlibre1.pm.dependency.DependencyService;
import com.projectlibre1.pm.dependency.DependencyType;
import com.projectlibre1.pm.task.NormalTask;

import java.util.List;
import java.util.Map;

/**
 * Синхронизатор зависимостей (Predecessors) из Frontend в Core Project.
 * Создает связи между задачами на основе массива predecessors.
 * 
 * Принцип SRP: отвечает только за синхронизацию зависимостей.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class DependencySynchronizer {
    
    private int createdCount = 0;
    private int skippedCount = 0;
    
    /**
     * Синхронизирует зависимости для списка задач.
     * 
     * @param frontendTasks Задачи из Frontend с predecessors
     * @param taskMap Карта соответствия Frontend ID -> Core Task
     */
    public void synchronize(List<FrontendTaskDto> frontendTasks, Map<String, NormalTask> taskMap) {
        if (frontendTasks == null || frontendTasks.isEmpty() || taskMap == null) {
            return;
        }
        
        System.out.println("[DepSync] Starting dependency sync for " + frontendTasks.size() + " tasks");
        createdCount = 0;
        skippedCount = 0;
        
        DependencyService depService = DependencyService.getInstance();
        
        for (FrontendTaskDto frontendTask : frontendTasks) {
            List<String> predecessors = frontendTask.getPredecessors();
            if (predecessors == null || predecessors.isEmpty()) {
                continue;
            }
            
            NormalTask successorTask = taskMap.get(frontendTask.getId());
            if (successorTask == null) {
                skippedCount++;
                continue;
            }
            
            for (String predecessorId : predecessors) {
                createDependency(depService, taskMap, predecessorId, successorTask);
            }
        }
        
        System.out.println("[DepSync] ✅ Completed: created=" + createdCount + ", skipped=" + skippedCount);
    }
    
    /**
     * Создает одну зависимость между задачами.
     */
    private void createDependency(DependencyService depService, Map<String, NormalTask> taskMap,
                                  String predecessorId, NormalTask successorTask) {
        NormalTask predecessorTask = taskMap.get(predecessorId);
        if (predecessorTask == null) {
            skippedCount++;
            return;
        }
        
        try {
            // Создаем зависимость типа Finish-to-Start (FS) с нулевым лагом
            Dependency dep = depService.newDependency(
                predecessorTask, 
                successorTask, 
                DependencyType.FS, 
                0,  // lag
                null // event source
            );
            
            if (dep != null) {
                createdCount++;
                System.out.println("[DepSync] Created: " + predecessorTask.getName() + 
                                 " -> " + successorTask.getName());
            }
        } catch (Exception e) {
            skippedCount++;
            System.err.println("[DepSync] Failed to create dependency: " + e.getMessage());
        }
    }
    
    public int getCreatedCount() { return createdCount; }
    public int getSkippedCount() { return skippedCount; }
}
