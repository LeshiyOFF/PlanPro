package com.projectlibre.api.sync;

import com.projectlibre.api.dto.TaskSyncRequestDto;
import com.projectlibre.api.dto.TaskSyncRequestDto.FrontendTaskDto;
import com.projectlibre.api.converter.DateTimeMapper;
import com.projectlibre.api.validator.MilestoneProgressValidator;
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
    private final DateTimeMapper dateMapper = new DateTimeMapper();
    
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
            System.out.println("[ApiToCoreSync] Starting two-phase intelligent sync: " + frontendTasks.size() + " tasks");
            
            // ФАЗА 1: Структурная синхронизация (Discovery, WBS, Links)
            
            // 1.1 Собираем карту существующих задач в Core
            Map<String, NormalTask> existingTasks = new HashMap<>();
            Iterator<Task> iterator = project.getTaskOutlineIterator();
            while (iterator.hasNext()) {
                Task t = iterator.next();
                if (t instanceof NormalTask && !t.isExternal()) {
                    existingTasks.put(t.getName(), (NormalTask) t);
                }
            }
            
            // 1.2 Находим или создаем все задачи
            Map<String, NormalTask> taskMap = new HashMap<>();
            for (FrontendTaskDto frontendTask : frontendTasks) {
                NormalTask coreTask = existingTasks.get(frontendTask.getName());
                if (coreTask == null) {
                    coreTask = project.createScriptedTask();
                    coreTask.setName(frontendTask.getName());
                }
                taskMap.put(frontendTask.getId(), coreTask);
            }
            
            // 1.3 Удаляем лишние задачи
            removeObsoleteTasks(project, frontendTasks);
            
            // 1.4 Восстанавливаем иерархию (WBS)
            // Это ДОЛЖНО быть до обновления свойств, чтобы Core знал структуру
            wbsSynchronizer.synchronize(project, frontendTasks, taskMap);
            
            // 1.5 Восстанавливаем зависимости (Links)
            dependencySynchronizer.synchronize(frontendTasks, taskMap);
            
            // ФАЗА 2: Информационная синхронизация (Dates, Progress, Notes)
            // Теперь ядро знает кто чей родитель, и NPE при вызове свойств не будет
            for (FrontendTaskDto frontendTask : frontendTasks) {
                NormalTask coreTask = taskMap.get(frontendTask.getId());
                if (coreTask != null) {
                    updateTaskProperties(coreTask, frontendTask);
                    syncedCount++;
                }
            }
            
            System.out.println("[ApiToCoreSync] ✅ Intelligent sync completed: synced=" + syncedCount);
            return SyncResult.success(syncedCount, skippedCount);
            
        } catch (Exception e) {
            System.err.println("[ApiToCoreSync] ❌ FATAL SYNC ERROR");
            System.err.println("[ApiToCoreSync] Error: " + e.getClass().getName() + ": " + e.getMessage());
            System.err.println("[ApiToCoreSync] Stack trace:");
            e.printStackTrace();
            
            if (e.getCause() != null) {
                System.err.println("[ApiToCoreSync] Caused by: " + e.getCause().getMessage());
                e.getCause().printStackTrace();
            }
            
            return SyncResult.error(e.getClass().getSimpleName() + ": " + e.getMessage());
        }
    }
    
    private void updateTaskProperties(NormalTask coreTask, FrontendTaskDto frontendTask) {
        coreTask.setName(frontendTask.getName());
        coreTask.setCustomText(0, frontendTask.getId());
        
        long start = dateMapper.toMillis(frontendTask.getStartDate());
        long end = dateMapper.toMillis(frontendTask.getEndDate());
        
        if (start > 0 && end > 0) {
            try {
                coreTask.setCustomDate(0, start);
                coreTask.setCustomDate(1, end);
            } catch (Exception e) {}
            
            coreTask.getCurrentSchedule().setStart(start);
            coreTask.getCurrentSchedule().setFinish(end);
            
            if (!coreTask.isSummary()) {
                try {
                    coreTask.setConstraintType(0); // ASAP
                } catch (Exception e) {}
            }
            
            updateTaskProgress(coreTask, frontendTask);
        }
        
        coreTask.setMarkTaskAsMilestone(frontendTask.isMilestone());
        if (frontendTask.getNotes() != null) {
            coreTask.setNotes(frontendTask.getNotes());
        }
    }
    
    /**
     * Обновляет прогресс задачи с учётом типа (веха vs обычная задача).
     * 
     * <p><b>Бизнес-правила:</b></p>
     * <ul>
     *   <li>Вехи: прогресс нормализуется до 0.0 или 1.0</li>
     *   <li>Обычные задачи: прогресс округляется до 2 знаков</li>
     *   <li>Summary tasks: прогресс игнорируется (вычисляется Core автоматически)</li>
     * </ul>
     * 
     * @param coreTask задача в ProjectLibre Core
     * @param frontendTask задача из Frontend
     */
    private void updateTaskProgress(NormalTask coreTask, FrontendTaskDto frontendTask) {
        if (coreTask.isSummary()) {
            return;
        }
        
        double rawProgress = frontendTask.getProgress();
        boolean isMilestone = frontendTask.isMilestone();
        
        double normalizedProgress = MilestoneProgressValidator.normalizeProgress(
            rawProgress, 
            isMilestone
        );
        
        coreTask.setPercentComplete(normalizedProgress);
    }

    /**
     * Удаляет задачи, которых нет в списке фронтенда.
     */
    private void removeObsoleteTasks(Project project, List<FrontendTaskDto> frontendTasks) {
        List<String> frontendNames = new ArrayList<>();
        for (FrontendTaskDto dto : frontendTasks) {
            frontendNames.add(dto.getName());
        }

        List<Task> toRemove = new ArrayList<>();
        Iterator<Task> iterator = project.getTaskOutlineIterator();
        while (iterator.hasNext()) {
            Task t = iterator.next();
            if (!t.isExternal() && !frontendNames.contains(t.getName())) {
                toRemove.add(t);
            }
        }

        for (Task t : toRemove) {
            try {
                project.remove(t, null, true, false, true);
            } catch (Exception e) {
                System.err.println("[ApiToCoreSync] Failed to remove task: " + t.getName());
            }
        }
    }

}
