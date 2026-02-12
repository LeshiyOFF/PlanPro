package com.projectlibre.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/**
 * DTO для передачи данных проекта между API и клиентом
 * Изолирует внутреннюю модель проекта от внешнего представления
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ProjectDto extends BaseDto {
    
    @NotBlank(message = "Project name is required")
    private String name;
    
    private String description;
    private String status;
    private String priority;
    
    @Min(value = 0, message = "Progress must be between 0 and 100")
    @Max(value = 100, message = "Progress must be between 0 and 100")
    private Double progress;
    
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime imposedFinishDate; // VB.1: Жёсткий дедлайн (imposed), null = автоматический режим
    private Boolean isForward; // VB.12: Режим планирования (true = Schedule from Start, false = Schedule from End)
    private List<String> taskIds;
    private List<String> resourceIds;
    private String manager;
    private String department;
    
    /**
     * Конструктор по умолчанию
     */
    public ProjectDto() {
        super();
    }
    
    /**
     * Конструктор с основными полями
     */
    public ProjectDto(String name, String description, String status, String priority) {
        super();
        this.name = name;
        this.description = description;
        this.status = status;
        this.priority = priority;
    }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    
    public Double getProgress() { return progress; }
    public void setProgress(Double progress) { this.progress = progress; }
    
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    
    /**
     * VB.1: Получить imposed finish date (жёсткий дедлайн, заданный пользователем).
     */
    public LocalDateTime getImposedFinishDate() { return imposedFinishDate; }
    
    /**
     * VB.1: Установить imposed finish date.
     */
    public void setImposedFinishDate(LocalDateTime imposedFinishDate) { 
        this.imposedFinishDate = imposedFinishDate; 
    }
    
    /**
     * VB.12: Получить режим планирования проекта.
     * @return true если Schedule from Start (forward), false если Schedule from End (backward)
     */
    public Boolean getIsForward() { return isForward; }
    
    /**
     * VB.12: Установить режим планирования проекта.
     * @param isForward true для Schedule from Start, false для Schedule from End
     */
    public void setIsForward(Boolean isForward) { this.isForward = isForward; }
    
    public List<String> getTaskIds() { return taskIds; }
    public void setTaskIds(List<String> taskIds) { this.taskIds = taskIds; }
    
    public List<String> getResourceIds() { return resourceIds; }
    public void setResourceIds(List<String> resourceIds) { this.resourceIds = resourceIds; }
    
    public String getManager() { return manager; }
    public void setManager(String manager) { this.manager = manager; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        ProjectDto that = (ProjectDto) o;
        return Objects.equals(name, that.name) &&
                Objects.equals(description, that.description) &&
                Objects.equals(status, that.status);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), name, description, status);
    }
    
    @Override
    public String toString() {
        return "ProjectDto{id=" + getId() + ", name='" + name + '\'' + '}';
    }
}