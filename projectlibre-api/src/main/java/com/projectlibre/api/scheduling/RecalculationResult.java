package com.projectlibre.api.scheduling;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Результат пересчёта проекта
 * Содержит обновлённые даты задач и информацию о критическом пути
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class RecalculationResult {
    
    private final Long projectId;
    private final LocalDateTime calculatedAt;
    private final List<TaskScheduleInfo> updatedTasks;
    private final List<Long> criticalPathTaskIds;
    private final long earliestStart;
    private final long latestFinish;
    private final boolean success;
    private final String errorMessage;
    
    private RecalculationResult(Builder builder) {
        this.projectId = builder.projectId;
        this.calculatedAt = builder.calculatedAt;
        this.updatedTasks = new ArrayList<>(builder.updatedTasks);
        this.criticalPathTaskIds = new ArrayList<>(builder.criticalPathTaskIds);
        this.earliestStart = builder.earliestStart;
        this.latestFinish = builder.latestFinish;
        this.success = builder.success;
        this.errorMessage = builder.errorMessage;
    }
    
    public Long getProjectId() { return projectId; }
    public LocalDateTime getCalculatedAt() { return calculatedAt; }
    public List<TaskScheduleInfo> getUpdatedTasks() { return new ArrayList<>(updatedTasks); }
    public List<Long> getCriticalPathTaskIds() { return new ArrayList<>(criticalPathTaskIds); }
    public long getEarliestStart() { return earliestStart; }
    public long getLatestFinish() { return latestFinish; }
    public boolean isSuccess() { return success; }
    public String getErrorMessage() { return errorMessage; }
    
    public static Builder builder() {
        return new Builder();
    }
    
    public static RecalculationResult success(Long projectId) {
        return new Builder()
            .projectId(projectId)
            .calculatedAt(LocalDateTime.now())
            .success(true)
            .build();
    }
    
    public static RecalculationResult failure(Long projectId, String error) {
        return new Builder()
            .projectId(projectId)
            .calculatedAt(LocalDateTime.now())
            .success(false)
            .errorMessage(error)
            .build();
    }
    
    /**
     * Builder для RecalculationResult
     */
    public static class Builder {
        private Long projectId;
        private LocalDateTime calculatedAt = LocalDateTime.now();
        private List<TaskScheduleInfo> updatedTasks = new ArrayList<>();
        private List<Long> criticalPathTaskIds = new ArrayList<>();
        private long earliestStart;
        private long latestFinish;
        private boolean success = true;
        private String errorMessage;
        
        public Builder projectId(Long projectId) {
            this.projectId = projectId;
            return this;
        }
        
        public Builder calculatedAt(LocalDateTime calculatedAt) {
            this.calculatedAt = calculatedAt;
            return this;
        }
        
        public Builder updatedTasks(List<TaskScheduleInfo> tasks) {
            this.updatedTasks = new ArrayList<>(tasks);
            return this;
        }
        
        public Builder addTask(TaskScheduleInfo task) {
            this.updatedTasks.add(task);
            return this;
        }
        
        public Builder criticalPathTaskIds(List<Long> ids) {
            this.criticalPathTaskIds = new ArrayList<>(ids);
            return this;
        }
        
        public Builder earliestStart(long earliestStart) {
            this.earliestStart = earliestStart;
            return this;
        }
        
        public Builder latestFinish(long latestFinish) {
            this.latestFinish = latestFinish;
            return this;
        }
        
        public Builder success(boolean success) {
            this.success = success;
            return this;
        }
        
        public Builder errorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
            return this;
        }
        
        public RecalculationResult build() {
            return new RecalculationResult(this);
        }
    }
}
