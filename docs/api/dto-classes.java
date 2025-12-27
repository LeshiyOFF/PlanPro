// Java DTO классы для ProjectLibre REST API
// Сгенерировано на основе OpenAPI 3.0 спецификации

package com.projectlibre.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import javax.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// Project DTOs
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Project {
    private String id;
    private String name;
    private String description;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime endDate;
    
    private ProjectStatus status;
    private Integer progress;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime updatedAt;
    
    private List<Task> tasks;
    private List<Resource> resources;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    
    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus status) { this.status = status; }
    
    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }
    
    public List<Resource> getResources() { return resources; }
    public void setResources(List<Resource> resources) { this.resources = resources; }
}

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CreateProjectRequest {
    @NotBlank(message = "Название проекта обязательно")
    @Size(max = 255, message = "Название проекта не должно превышать 255 символов")
    private String name;
    
    @Size(max = 1000, message = "Описание проекта не должно превышать 1000 символов")
    private String description;
    
    @NotNull(message = "Дата начала проекта обязательна")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime endDate;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
}

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateProjectRequest {
    @Size(max = 255, message = "Название проекта не должно превышать 255 символов")
    private String name;
    
    @Size(max = 1000, message = "Описание проекта не должно превышать 1000 символов")
    private String description;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime endDate;
    
    private ProjectStatus status;
    
    @Min(value = 0, message = "Прогресс должен быть от 0 до 100")
    @Max(value = 100, message = "Прогресс должен быть от 0 до 100")
    private Integer progress;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    
    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus status) { this.status = status; }
    
    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }
}

// Task DTOs
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Task {
    private String id;
    private String projectId;
    
    @NotBlank(message = "Название задачи обязательно")
    @Size(max = 255, message = "Название задачи не должно превышать 255 символов")
    private String name;
    
    @Size(max = 1000, message = "Описание задачи не должно превышать 1000 символов")
    private String description;
    
    @NotNull(message = "Продолжительность задачи обязательна")
    @Min(value = 1, message = "Продолжительность должна быть положительным числом")
    private Integer duration;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime endDate;
    
    private Integer progress;
    private TaskPriority priority;
    private TaskStatus status;
    private List<String> dependencies;
    private String assigneeId;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime updatedAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    
    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }
    
    public TaskPriority getPriority() { return priority; }
    public void setPriority(TaskPriority priority) { this.priority = priority; }
    
    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }
    
    public List<String> getDependencies() { return dependencies; }
    public void setDependencies(List<String> dependencies) { this.dependencies = dependencies; }
    
    public String getAssigneeId() { return assigneeId; }
    public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CreateTaskRequest {
    @NotBlank(message = "Название задачи обязательно")
    @Size(max = 255, message = "Название задачи не должно превышать 255 символов")
    private String name;
    
    @Size(max = 1000, message = "Описание задачи не должно превышать 1000 символов")
    private String description;
    
    @NotNull(message = "Продолжительность задачи обязательна")
    @Min(value = 1, message = "Продолжительность должна быть положительным числом")
    private Integer duration;
    
    @NotNull(message = "Дата начала задачи обязательна")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime startDate;
    
    private TaskPriority priority;
    private String assigneeId;
    private List<String> dependencies;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    
    public TaskPriority getPriority() { return priority; }
    public void setPriority(TaskPriority priority) { this.priority = priority; }
    
    public String getAssigneeId() { return assigneeId; }
    public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }
    
    public List<String> getDependencies() { return dependencies; }
    public void setDependencies(List<String> dependencies) { this.dependencies = dependencies; }
}

// Resource DTOs
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Resource {
    private String id;
    private String projectId;
    
    @NotBlank(message = "Название ресурса обязательно")
    @Size(max = 255, message = "Название ресурса не должно превышать 255 символов")
    private String name;
    
    @NotNull(message = "Тип ресурса обязателен")
    private ResourceType type;
    
    @Email(message = "Email должен быть валидным")
    private String email;
    
    @Min(value = 0.1, message = "Емкость должна быть положительным числом")
    private Double capacity;
    
    @Min(value = 0, message = "Стоимость должна быть неотрицательным числом")
    private Double cost;
    
    private ResourceAvailability availability;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private LocalDateTime updatedAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public ResourceType getType() { return type; }
    public void setType(ResourceType type) { this.type = type; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public Double getCapacity() { return capacity; }
    public void setCapacity(Double capacity) { this.capacity = capacity; }
    
    public Double getCost() { return cost; }
    public void setCost(Double cost) { this.cost = cost; }
    
    public ResourceAvailability getAvailability() { return availability; }
    public void setAvailability(ResourceAvailability availability) { this.availability = availability; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CreateResourceRequest {
    @NotBlank(message = "Название ресурса обязательно")
    @Size(max = 255, message = "Название ресурса не должно превышать 255 символов")
    private String name;
    
    @NotNull(message = "Тип ресурса обязателен")
    private ResourceType type;
    
    @Email(message = "Email должен быть валидным")
    private String email;
    
    @Min(value = 0.1, message = "Емкость должна быть положительным числом")
    private Double capacity;
    
    @Min(value = 0, message = "Стоимость должна быть неотрицательным числом")
    private Double cost;
    
    private ResourceAvailability availability;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public ResourceType getType() { return type; }
    public void setType(ResourceType type) { this.type = type; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public Double getCapacity() { return capacity; }
    public void setCapacity(Double capacity) { this.capacity = capacity; }
    
    public Double getCost() { return cost; }
    public void setCost(Double cost) { this.cost = cost; }
    
    public ResourceAvailability getAvailability() { return availability; }
    public void setAvailability(ResourceAvailability availability) { this.availability = availability; }
}

// Import/Export DTOs
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ImportResult {
    private Boolean success;
    private String projectId;
    private List<String> warnings;
    private List<String> errors;
    private Integer importedTasksCount;
    private Integer importedResourcesCount;

    // Getters and Setters
    public Boolean getSuccess() { return success; }
    public void setSuccess(Boolean success) { this.success = success; }
    
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    
    public List<String> getWarnings() { return warnings; }
    public void setWarnings(List<String> warnings) { this.warnings = warnings; }
    
    public List<String> getErrors() { return errors; }
    public void setErrors(List<String> errors) { this.errors = errors; }
    
    public Integer getImportedTasksCount() { return importedTasksCount; }
    public void setImportedTasksCount(Integer importedTasksCount) { this.importedTasksCount = importedTasksCount; }
    
    public Integer getImportedResourcesCount() { return importedResourcesCount; }
    public void setImportedResourcesCount(Integer importedResourcesCount) { this.importedResourcesCount = importedResourcesCount; }
}

// Error DTO
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Error {
    @NotBlank(message = "Код ошибки обязателен")
    private String code;
    
    @NotBlank(message = "Сообщение об ошибке обязательно")
    private String message;
    
    private Map<String, Object> details;

    // Getters and Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public Map<String, Object> getDetails() { return details; }
    public void setDetails(Map<String, Object> details) { this.details = details; }
}

// Enums
public enum ProjectStatus {
    PLANNING("PLANNING", "Планирование"),
    ACTIVE("ACTIVE", "Активный"),
    COMPLETED("COMPLETED", "Завершен"),
    ON_HOLD("ON_HOLD", "Приостановлен"),
    CANCELLED("CANCELLED", "Отменен");

    private final String value;
    private final String description;

    ProjectStatus(String value, String description) {
        this.value = value;
        this.description = description;
    }

    public String getValue() { return value; }
    public String getDescription() { return description; }
}

public enum TaskStatus {
    NOT_STARTED("NOT_STARTED", "Не начата"),
    IN_PROGRESS("IN_PROGRESS", "В работе"),
    COMPLETED("COMPLETED", "Завершена"),
    ON_HOLD("ON_HOLD", "Приостановлена"),
    CANCELLED("CANCELLED", "Отменена");

    private final String value;
    private final String description;

    TaskStatus(String value, String description) {
        this.value = value;
        this.description = description;
    }

    public String getValue() { return value; }
    public String getDescription() { return description; }
}

public enum TaskPriority {
    LOW("LOW", "Низкий"),
    MEDIUM("MEDIUM", "Средний"),
    HIGH("HIGH", "Высокий"),
    CRITICAL("CRITICAL", "Критический");

    private final String value;
    private final String description;

    TaskPriority(String value, String description) {
        this.value = value;
        this.description = description;
    }

    public String getValue() { return value; }
    public String getDescription() { return description; }
}

public enum ResourceType {
    HUMAN("HUMAN", "Человек"),
    MATERIAL("MATERIAL", "Материал"),
    EQUIPMENT("EQUIPMENT", "Оборудование"),
    FACILITY("FACILITY", "Помещение");

    private final String value;
    private final String description;

    ResourceType(String value, String description) {
        this.value = value;
        this.description = description;
    }

    public String getValue() { return value; }
    public String getDescription() { return description; }
}

// Resource Availability
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResourceAvailability {
    private boolean monday;
    private boolean tuesday;
    private boolean wednesday;
    private boolean thursday;
    private boolean friday;
    private boolean saturday;
    private boolean sunday;

    // Getters and Setters
    public boolean isMonday() { return monday; }
    public void setMonday(boolean monday) { this.monday = monday; }
    
    public boolean isTuesday() { return tuesday; }
    public void setTuesday(boolean tuesday) { this.tuesday = tuesday; }
    
    public boolean isWednesday() { return wednesday; }
    public void setWednesday(boolean wednesday) { this.wednesday = wednesday; }
    
    public boolean isThursday() { return thursday; }
    public void setThursday(boolean thursday) { this.thursday = thursday; }
    
    public boolean isFriday() { return friday; }
    public void setFriday(boolean friday) { this.friday = friday; }
    
    public boolean isSaturday() { return saturday; }
    public void setSaturday(boolean saturday) { this.saturday = saturday; }
    
    public boolean isSunday() { return sunday; }
    public void setSunday(boolean sunday) { this.sunday = sunday; }
}