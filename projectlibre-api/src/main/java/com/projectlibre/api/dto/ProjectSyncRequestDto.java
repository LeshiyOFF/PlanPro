package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.projectlibre.api.dto.TaskSyncRequestDto.FrontendTaskDto;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

/**
 * Unified DTO для синхронизации всего проекта (задачи + ресурсы).
 * 
 * Clean Architecture: Data Transfer Object (Interface Adapters Layer).
 * SOLID: Single Responsibility - только перенос данных.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProjectSyncRequestDto {
    
    @NotNull(message = "Project ID is required")
    private Long projectId;
    
    private List<FrontendTaskDto> tasks;
    private List<FrontendResourceDto> resources;
    /** Полный актуальный список календарей проекта (в т.ч. без назначений); системные календари не входят. */
    private List<CalendarSyncDto> projectCalendars;

    public ProjectSyncRequestDto() {
        this.tasks = new ArrayList<>();
        this.resources = new ArrayList<>();
        this.projectCalendars = new ArrayList<>();
    }
    
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    
    public List<FrontendTaskDto> getTasks() { return tasks; }
    public void setTasks(List<FrontendTaskDto> tasks) { 
        this.tasks = tasks != null ? tasks : new ArrayList<>(); 
    }
    
    public List<FrontendResourceDto> getResources() { return resources; }
    public void setResources(List<FrontendResourceDto> resources) {
        this.resources = resources != null ? resources : new ArrayList<>();
    }

    public List<CalendarSyncDto> getProjectCalendars() { return projectCalendars; }
    public void setProjectCalendars(List<CalendarSyncDto> projectCalendars) {
        this.projectCalendars = projectCalendars != null ? projectCalendars : new ArrayList<>();
    }

    public int getTaskCount() { return tasks != null ? tasks.size() : 0; }
    public int getResourceCount() { return resources != null ? resources.size() : 0; }
}
