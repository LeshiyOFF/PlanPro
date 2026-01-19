package com.projectlibre.api.sync;

import com.projectlibre.api.dto.TaskSyncRequestDto;
import com.projectlibre.api.dto.TaskSyncRequestDto.FrontendTaskDto;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.pm.task.NormalTask;
import com.projectlibre1.pm.task.Task;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * Синхронизатор задач из Frontend (Zustand) в Core Project.
 * Обеспечивает перенос свойств задач, WBS иерархии, зависимостей и назначений.
 * 
 * Принцип SRP: координирует работу специализированных синхронизаторов.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
public class ApiToCoreTaskSynchronizer {
    
    private int syncedCount;
    private int skippedCount;
    
    private final WbsHierarchySynchronizer wbsSynchronizer;
    private final DependencySynchronizer dependencySynchronizer;
    private final ResourceAssignmentSynchronizer resourceSynchronizer;
    
    public ApiToCoreTaskSynchronizer() {
        this.wbsSynchronizer = new WbsHierarchySynchronizer();
        this.dependencySynchronizer = new DependencySynchronizer();
        this.resourceSynchronizer = new ResourceAssignmentSynchronizer();
    }
    
    /**
     * Синхронизирует задачи из Frontend в Core Project.
     * 
     * @param project Core Project для синхронизации
     * @param request Запрос с задачами из Frontend
     * @return SyncResult с результатами синхронизации
     */
    public SyncResult synchronize(Project project, TaskSyncRequestDto request) {
        if (project == null) {
            return SyncResult.error("Project is null");
        }
        
        if (request == null || request.getTasks() == null) {
            return SyncResult.error("Request or tasks is null");
        }
        
        syncedCount = 0;
        skippedCount = 0;
        
        try {
            List<FrontendTaskDto> frontendTasks = request.getTasks();
            System.out.println("[ApiToCoreSync] Starting full sync: " + frontendTasks.size() + " tasks");
            
            // Шаг 1: Очищаем существующие задачи
            clearExistingTasks(project);
            
            // Шаг 2: Создаем базовые задачи и собираем карту ID -> Task
            Map<String, NormalTask> taskMap = new HashMap<>();
            for (FrontendTaskDto frontendTask : frontendTasks) {
                NormalTask coreTask = syncSingleTask(project, frontendTask);
                if (coreTask != null) {
                    taskMap.put(frontendTask.getId(), coreTask);
                    syncedCount++;
                } else {
                    skippedCount++;
                }
            }
            
            // Шаг 3: Синхронизируем WBS иерархию
            wbsSynchronizer.synchronize(project, frontendTasks, taskMap);
            
            // Шаг 4: Синхронизируем зависимости (Predecessors)
            dependencySynchronizer.synchronize(frontendTasks, taskMap);
            
            // Шаг 5: Синхронизируем назначения ресурсов
            resourceSynchronizer.synchronize(project, frontendTasks, taskMap);
            
            System.out.println("[ApiToCoreSync] ✅ Full sync completed: synced=" + syncedCount);
            return SyncResult.success(syncedCount, skippedCount);
            
        } catch (Exception e) {
            System.err.println("[ApiToCoreSync] ❌ Error: " + e.getMessage());
            e.printStackTrace();
            return SyncResult.error(e.getMessage());
        }
    }
    
    /**
     * Очищает все существующие задачи из проекта.
     */
    private void clearExistingTasks(Project project) {
        List<Task> tasksToRemove = new ArrayList<>();
        
        Iterator<Task> iterator = project.getTaskOutlineIterator();
        while (iterator.hasNext()) {
            Task task = iterator.next();
            if (!task.isExternal()) {
                tasksToRemove.add(task);
            }
        }
        
        System.out.println("[ApiToCoreSync] Clearing " + tasksToRemove.size() + " existing tasks");
        
        for (Task task : tasksToRemove) {
            try {
                project.remove(task, null, true, false, true);
            } catch (Exception e) {
                System.err.println("[ApiToCoreSync] Warning: failed to remove task: " + e.getMessage());
            }
        }
    }
    
    /**
     * Синхронизирует одну задачу из Frontend в Core.
     * @return созданная NormalTask или null при ошибке
     */
    private NormalTask syncSingleTask(Project project, FrontendTaskDto frontendTask) {
        if (frontendTask == null || frontendTask.getName() == null) {
            return null;
        }
        
        try {
            NormalTask coreTask = project.createScriptedTask();
            
            // Базовые свойства
            coreTask.setName(frontendTask.getName());
            
            // Даты
            if (frontendTask.getStartDate() > 0) {
                coreTask.setStart(frontendTask.getStartDate());
            }
            if (frontendTask.getEndDate() > 0) {
                coreTask.setEnd(frontendTask.getEndDate());
            }
            
            // Прогресс (0-100 -> 0-1)
            double progress = frontendTask.getProgress();
            if (progress > 0) {
                coreTask.setPercentComplete(progress / 100.0);
            }
            
            // Milestone
            if (frontendTask.isMilestone()) {
                coreTask.setMarkTaskAsMilestone(true);
            }
            
            // Notes
            if (frontendTask.getNotes() != null && !frontendTask.getNotes().isEmpty()) {
                coreTask.setNotes(frontendTask.getNotes());
            }
            
            return coreTask;
            
        } catch (Exception e) {
            System.err.println("[ApiToCoreSync] Failed to sync task '" + frontendTask.getName() + "': " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Результат синхронизации.
     */
    public static class SyncResult {
        private final boolean success;
        private final int syncedCount;
        private final int skippedCount;
        private final String error;
        
        private SyncResult(boolean success, int syncedCount, int skippedCount, String error) {
            this.success = success;
            this.syncedCount = syncedCount;
            this.skippedCount = skippedCount;
            this.error = error;
        }
        
        public static SyncResult success(int syncedCount, int skippedCount) {
            return new SyncResult(true, syncedCount, skippedCount, null);
        }
        
        public static SyncResult error(String message) {
            return new SyncResult(false, 0, 0, message);
        }
        
        public boolean isSuccess() { return success; }
        public int getSyncedCount() { return syncedCount; }
        public int getSkippedCount() { return skippedCount; }
        public String getError() { return error; }
    }
}
