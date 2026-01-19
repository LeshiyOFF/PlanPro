package com.projectlibre.api.scheduling;

/**
 * Информация о расписании задачи
 * Используется для передачи результатов пересчёта
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class TaskScheduleInfo {
    
    private final Long taskId;
    private final long startDate;
    private final long endDate;
    private final long duration;
    private final boolean critical;
    private final double totalSlack;
    private final double freeSlack;
    
    private TaskScheduleInfo(Builder builder) {
        this.taskId = builder.taskId;
        this.startDate = builder.startDate;
        this.endDate = builder.endDate;
        this.duration = builder.duration;
        this.critical = builder.critical;
        this.totalSlack = builder.totalSlack;
        this.freeSlack = builder.freeSlack;
    }
    
    public Long getTaskId() { return taskId; }
    public long getStartDate() { return startDate; }
    public long getEndDate() { return endDate; }
    public long getDuration() { return duration; }
    public boolean isCritical() { return critical; }
    public double getTotalSlack() { return totalSlack; }
    public double getFreeSlack() { return freeSlack; }
    
    public static Builder builder() {
        return new Builder();
    }
    
    /**
     * Builder для TaskScheduleInfo
     */
    public static class Builder {
        private Long taskId;
        private long startDate;
        private long endDate;
        private long duration;
        private boolean critical;
        private double totalSlack;
        private double freeSlack;
        
        public Builder taskId(Long taskId) {
            this.taskId = taskId;
            return this;
        }
        
        public Builder startDate(long startDate) {
            this.startDate = startDate;
            return this;
        }
        
        public Builder endDate(long endDate) {
            this.endDate = endDate;
            return this;
        }
        
        public Builder duration(long duration) {
            this.duration = duration;
            return this;
        }
        
        public Builder critical(boolean critical) {
            this.critical = critical;
            return this;
        }
        
        public Builder totalSlack(double totalSlack) {
            this.totalSlack = totalSlack;
            return this;
        }
        
        public Builder freeSlack(double freeSlack) {
            this.freeSlack = freeSlack;
            return this;
        }
        
        public TaskScheduleInfo build() {
            return new TaskScheduleInfo(this);
        }
    }
}
