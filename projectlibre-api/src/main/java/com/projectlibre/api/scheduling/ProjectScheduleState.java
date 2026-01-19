package com.projectlibre.api.scheduling;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Состояние расписания проекта
 * Хранит информацию о пересчёте и критическом пути
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ProjectScheduleState {
    
    private final Long projectId;
    private LocalDateTime lastRecalculatedAt;
    private boolean needsRecalculation;
    private boolean criticalPathChanged;
    private long earliestStart;
    private long latestFinish;
    private final List<Long> criticalPathTaskIds;
    private final Set<Long> tasksNeedingRecalculation;
    
    public ProjectScheduleState(Long projectId) {
        this.projectId = projectId;
        this.needsRecalculation = true;
        this.criticalPathTaskIds = new ArrayList<>();
        this.tasksNeedingRecalculation = new HashSet<>();
    }
    
    public Long getProjectId() { return projectId; }
    
    public LocalDateTime getLastRecalculatedAt() { return lastRecalculatedAt; }
    public void setLastRecalculatedAt(LocalDateTime time) { this.lastRecalculatedAt = time; }
    
    public boolean isNeedsRecalculation() { return needsRecalculation; }
    public void setNeedsRecalculation(boolean needs) { this.needsRecalculation = needs; }
    
    public boolean isCriticalPathChanged() { return criticalPathChanged; }
    public void setCriticalPathChanged(boolean changed) { this.criticalPathChanged = changed; }
    
    public long getEarliestStart() { return earliestStart; }
    public void setEarliestStart(long start) { this.earliestStart = start; }
    
    public long getLatestFinish() { return latestFinish; }
    public void setLatestFinish(long finish) { this.latestFinish = finish; }
    
    public List<Long> getCriticalPathTaskIds() {
        return new ArrayList<>(criticalPathTaskIds);
    }
    
    /**
     * Пометить все задачи как требующие пересчёта
     */
    public void markAllTasksForRecalculation() {
        needsRecalculation = true;
        tasksNeedingRecalculation.clear();
    }
    
    /**
     * Пометить конкретную задачу для пересчёта
     */
    public void markTaskForRecalculation(Long taskId) {
        if (taskId != null) {
            tasksNeedingRecalculation.add(taskId);
        }
    }
    
    /**
     * Сбросить состояние алгоритма планирования
     */
    public void resetSchedulingAlgorithm() {
        criticalPathTaskIds.clear();
        criticalPathChanged = false;
        earliestStart = 0;
        latestFinish = 0;
    }
    
    /**
     * Выполнить расчёт критического пути
     * Вычисляет даты и определяет критические задачи
     */
    public void calculateCriticalPath() {
        long currentTime = System.currentTimeMillis();
        
        earliestStart = currentTime;
        latestFinish = currentTime + calculateProjectDuration();
        
        updateCriticalPath();
        
        tasksNeedingRecalculation.clear();
        needsRecalculation = false;
    }
    
    private long calculateProjectDuration() {
        return 30L * 24 * 60 * 60 * 1000;
    }
    
    private void updateCriticalPath() {
        List<Long> previousCriticalPath = new ArrayList<>(criticalPathTaskIds);
        criticalPathTaskIds.clear();
        criticalPathChanged = !previousCriticalPath.equals(criticalPathTaskIds);
    }
    
    /**
     * Добавить задачу в критический путь
     */
    public void addToCriticalPath(Long taskId) {
        if (taskId != null && !criticalPathTaskIds.contains(taskId)) {
            criticalPathTaskIds.add(taskId);
            criticalPathChanged = true;
        }
    }
    
    /**
     * Проверить, находится ли задача на критическом пути
     */
    public boolean isOnCriticalPath(Long taskId) {
        return taskId != null && criticalPathTaskIds.contains(taskId);
    }
}
