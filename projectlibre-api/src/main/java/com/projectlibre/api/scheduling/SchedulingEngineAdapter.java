package com.projectlibre.api.scheduling;

import com.projectlibre1.concurrent.ThreadSafeManager;
import com.projectlibre1.concurrent.ThreadSafeManagerInterface;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Адаптер для движка планирования
 * Реализует SchedulingEnginePort с потокобезопасной логикой пересчёта
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class SchedulingEngineAdapter implements SchedulingEnginePort {
    
    private static volatile SchedulingEngineAdapter instance;
    private static final Object LOCK = new Object();
    
    private final ThreadSafeManagerInterface syncManager;
    private final Map<Long, ProjectScheduleState> projectStates;
    
    private SchedulingEngineAdapter() {
        this.syncManager = ThreadSafeManager.getInstance();
        this.projectStates = new ConcurrentHashMap<>();
    }
    
    public static SchedulingEngineAdapter getInstance() {
        SchedulingEngineAdapter result = instance;
        if (result == null) {
            synchronized (LOCK) {
                result = instance;
                if (result == null) {
                    instance = result = new SchedulingEngineAdapter();
                }
            }
        }
        return result;
    }
    
    @Override
    public RecalculationResult recalculate(Long projectId) {
        return syncManager.executeWithWriteLock("scheduling_" + projectId, () -> {
            return performFullRecalculation(projectId);
        });
    }
    
    @Override
    public RecalculationResult recalculateTask(Long projectId, Long taskId) {
        return syncManager.executeWithWriteLock("scheduling_" + projectId, () -> {
            return performTaskRecalculation(projectId, taskId);
        });
    }
    
    @Override
    public boolean needsRecalculation(Long projectId) {
        return syncManager.executeWithReadLock("scheduling_" + projectId, () -> {
            ProjectScheduleState state = projectStates.get(projectId);
            return state == null || state.isNeedsRecalculation();
        });
    }
    
    @Override
    public boolean isCriticalPathChanged(Long projectId) {
        return syncManager.executeWithReadLock("scheduling_" + projectId, () -> {
            ProjectScheduleState state = projectStates.get(projectId);
            return state != null && state.isCriticalPathChanged();
        });
    }
    
    private RecalculationResult performFullRecalculation(Long projectId) {
        try {
            ProjectScheduleState state = getOrCreateState(projectId);
            
            long startTime = System.currentTimeMillis();
            executeSchedulingAlgorithm(state);
            long endTime = System.currentTimeMillis();
            
            state.setLastRecalculatedAt(LocalDateTime.now());
            state.setNeedsRecalculation(false);
            
            logRecalculation(projectId, endTime - startTime);
            
            return buildSuccessResult(projectId, state);
        } catch (Exception e) {
            return RecalculationResult.failure(projectId, e.getMessage());
        }
    }
    
    private RecalculationResult performTaskRecalculation(Long projectId, Long taskId) {
        try {
            ProjectScheduleState state = getOrCreateState(projectId);
            executeIncrementalScheduling(state, taskId);
            
            state.setLastRecalculatedAt(LocalDateTime.now());
            return buildSuccessResult(projectId, state);
        } catch (Exception e) {
            return RecalculationResult.failure(projectId, e.getMessage());
        }
    }
    
    private ProjectScheduleState getOrCreateState(Long projectId) {
        return projectStates.computeIfAbsent(projectId, ProjectScheduleState::new);
    }
    
    private void executeSchedulingAlgorithm(ProjectScheduleState state) {
        state.markAllTasksForRecalculation();
        state.resetSchedulingAlgorithm();
        state.calculateCriticalPath();
    }
    
    private void executeIncrementalScheduling(ProjectScheduleState state, Long taskId) {
        state.markTaskForRecalculation(taskId);
        state.calculateCriticalPath();
    }
    
    private RecalculationResult buildSuccessResult(Long projectId, ProjectScheduleState state) {
        return RecalculationResult.builder()
            .projectId(projectId)
            .calculatedAt(state.getLastRecalculatedAt())
            .earliestStart(state.getEarliestStart())
            .latestFinish(state.getLatestFinish())
            .criticalPathTaskIds(state.getCriticalPathTaskIds())
            .success(true)
            .build();
    }
    
    private void logRecalculation(Long projectId, long durationMs) {
        System.out.println("[SchedulingEngine] Project " + projectId + 
            " recalculated in " + durationMs + "ms");
    }
    
    /**
     * Пометить проект как требующий пересчёта
     */
    public void markForRecalculation(Long projectId) {
        syncManager.executeSynchronized("scheduling_" + projectId, () -> {
            ProjectScheduleState state = getOrCreateState(projectId);
            state.setNeedsRecalculation(true);
        });
    }
}
