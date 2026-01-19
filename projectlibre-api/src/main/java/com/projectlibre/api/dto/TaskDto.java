package com.projectlibre.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * DTO для передачи данных задачи между API и клиентом
 * Изолирует внутреннюю модель задачи от внешнего представления
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class TaskDto extends BaseDto {
    
    @NotBlank(message = "Task name is required")
    private String name;
    
    private String description;
    private String status;
    private String priority;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime dueDate;
    private String projectId;
    private String resourceId;
    private String assignee;
    private String assigneeId;
    
    @Min(value = 0, message = "Estimated hours must be positive")
    private Integer estimatedHours;
    
    @Min(value = 0, message = "Actual hours must be positive")
    private Integer actualHours;
    
    private String tags;
    private String notes;
    private String type;
    
    @Min(value = 0, message = "Progress must be between 0 and 100")
    @Max(value = 100, message = "Progress must be between 0 and 100")
    private Double progress;
    
    private LocalDateTime lastAssignedDate;
    private String reportingTo;
    
    /**
     * Конструктор по умолчанию
     */
    public TaskDto() {
        super();
    }
    
    /**
     * Конструктор с основными полями
     */
    public TaskDto(String name, String description, String status) {
        super();
        this.name = name;
        this.description = description;
        this.status = status;
    }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    
    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }
    
    public String getAssignee() { return assignee; }
    public void setAssignee(String assignee) { this.assignee = assignee; }
    
    public String getAssigneeId() { return assigneeId; }
    public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }
    
    public Integer getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(Integer estimatedHours) { this.estimatedHours = estimatedHours; }
    
    public Integer getActualHours() { return actualHours; }
    public void setActualHours(Integer actualHours) { this.actualHours = actualHours; }
    
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public Double getProgress() { return progress; }
    public void setProgress(Double progress) { this.progress = progress; }
    
    public LocalDateTime getLastAssignedDate() { return lastAssignedDate; }
    public void setLastAssignedDate(LocalDateTime lastAssignedDate) { this.lastAssignedDate = lastAssignedDate; }
    
    public String getReportingTo() { return reportingTo; }
    public void setReportingTo(String reportingTo) { this.reportingTo = reportingTo; }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        TaskDto taskDto = (TaskDto) o;
        return Objects.equals(name, taskDto.name) &&
                Objects.equals(description, taskDto.description) &&
                Objects.equals(status, taskDto.status);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), name, description, status);
    }
    
    @Override
    public String toString() {
        return "TaskDto{id=" + getId() + ", name='" + name + '\'' + '}';
    }
}