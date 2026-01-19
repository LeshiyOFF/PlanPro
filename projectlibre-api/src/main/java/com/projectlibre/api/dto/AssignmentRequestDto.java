package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for assignment requests (create/update).
 * Synchronized with TypeScript AssignmentCreateRequest interface.
 * Does not extend BaseDto as it represents input data without server-generated id.
 * Follows SOLID: Single Responsibility Principle.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class AssignmentRequestDto {
    
    @NotNull(message = "Task ID is required")
    private String taskId;
    
    @NotNull(message = "Resource ID is required")
    private String resourceId;
    
    private Double units;
    private Double work;
    private Double cost;
    
    public AssignmentRequestDto() {
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
}
