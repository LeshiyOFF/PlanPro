package com.projectlibre.api.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.ArrayList;

/**
 * DTO для запроса синхронизации задач из Frontend в Core Project.
 * Используется для переноса задач из Zustand store в Java Core перед сохранением.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class TaskSyncRequestDto {
    
    @NotNull(message = "Project ID is required")
    private Long projectId;
    
    private List<FrontendTaskDto> tasks;
    
    public TaskSyncRequestDto() {
        this.tasks = new ArrayList<>();
    }
    
    public Long getProjectId() {
        return projectId;
    }
    
    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }
    
    public List<FrontendTaskDto> getTasks() {
        return tasks;
    }
    
    public void setTasks(List<FrontendTaskDto> tasks) {
        this.tasks = tasks != null ? tasks : new ArrayList<>();
    }
    
    public int getTaskCount() {
        return tasks != null ? tasks.size() : 0;
    }
    
    /**
     * DTO задачи из Frontend (соответствует Zustand Task interface).
     */
    public static class FrontendTaskDto {
        private String id;
        private String name;
        private long startDate;   // timestamp в миллисекундах
        private long endDate;     // timestamp в миллисекундах
        private double progress;  // 0-100
        private int level;
        private boolean summary;
        private boolean milestone;
        private String type;
        private List<String> predecessors;
        private List<String> children;
        private List<String> resourceIds;
        private String notes;
        private String color;
        
        public FrontendTaskDto() {
            this.predecessors = new ArrayList<>();
            this.children = new ArrayList<>();
            this.resourceIds = new ArrayList<>();
        }
        
        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public long getStartDate() { return startDate; }
        public void setStartDate(long startDate) { this.startDate = startDate; }
        
        public long getEndDate() { return endDate; }
        public void setEndDate(long endDate) { this.endDate = endDate; }
        
        public double getProgress() { return progress; }
        public void setProgress(double progress) { this.progress = progress; }
        
        public int getLevel() { return level; }
        public void setLevel(int level) { this.level = level; }
        
        public boolean isSummary() { return summary; }
        public void setSummary(boolean summary) { this.summary = summary; }
        
        public boolean isMilestone() { return milestone; }
        public void setMilestone(boolean milestone) { this.milestone = milestone; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public List<String> getPredecessors() { return predecessors; }
        public void setPredecessors(List<String> predecessors) { 
            this.predecessors = predecessors != null ? predecessors : new ArrayList<>(); 
        }
        
        public List<String> getChildren() { return children; }
        public void setChildren(List<String> children) { 
            this.children = children != null ? children : new ArrayList<>(); 
        }
        
        public List<String> getResourceIds() { return resourceIds; }
        public void setResourceIds(List<String> resourceIds) { 
            this.resourceIds = resourceIds != null ? resourceIds : new ArrayList<>(); 
        }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
    }
}
