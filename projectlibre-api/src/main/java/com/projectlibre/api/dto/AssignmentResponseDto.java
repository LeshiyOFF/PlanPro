package com.projectlibre.api.dto;

import java.time.LocalDateTime;

/**
 * DTO for assignment responses.
 * Synchronized with TypeScript AssignmentResponse interface.
 * Follows SOLID: Single Responsibility Principle.
 */
public class AssignmentResponseDto extends BaseDto {
    
    private String taskId;
    private String resourceId;
    private Double units;
    private Double work;
    private Double cost;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String taskName;
    private String resourceName;
    
    public AssignmentResponseDto() {
    }
    
    public String getTaskId() {
        return taskId;
    }
    
    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }
    
    public String getResourceId() {
        return resourceId;
    }
    
    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }
    
    public Double getUnits() {
        return units;
    }
    
    public void setUnits(Double units) {
        this.units = units;
    }
    
    public Double getWork() {
        return work;
    }
    
    public void setWork(Double work) {
        this.work = work;
    }
    
    public Double getCost() {
        return cost;
    }
    
    public void setCost(Double cost) {
        this.cost = cost;
    }
    
    public LocalDateTime getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }
    
    public LocalDateTime getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }
    
    public String getTaskName() {
        return taskName;
    }
    
    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }
    
    public String getResourceName() {
        return resourceName;
    }
    
    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }
}
