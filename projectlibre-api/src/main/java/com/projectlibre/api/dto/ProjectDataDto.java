package com.projectlibre.api.dto;

import java.util.List;
import java.util.ArrayList;

/**
 * DTO для передачи полных данных проекта (tasks + resources + calendars) на frontend.
 * Используется при загрузке .pod файлов для синхронизации Core модели с UI.
 * 
 * V2.0: Добавлено поле calendars для передачи кастомных календарей.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
public class ProjectDataDto {
    
    private Long projectId;
    private String projectName;
    private List<TaskDataDto> tasks;
    private List<ResourceDataDto> resources;
    private List<CalendarDataDto> calendars;
    private String loadedFrom;
    
    public ProjectDataDto() {
        this.tasks = new ArrayList<>();
        this.resources = new ArrayList<>();
        this.calendars = new ArrayList<>();
    }
    
    public static ProjectDataDto success(Long projectId, String projectName, 
            List<TaskDataDto> tasks, List<ResourceDataDto> resources, String loadedFrom) {
        ProjectDataDto dto = new ProjectDataDto();
        dto.setProjectId(projectId);
        dto.setProjectName(projectName);
        dto.setTasks(tasks != null ? tasks : new ArrayList<>());
        dto.setResources(resources != null ? resources : new ArrayList<>());
        dto.setCalendars(new ArrayList<>());
        dto.setLoadedFrom(loadedFrom);
        return dto;
    }
    
    /**
     * Фабричный метод с поддержкой календарей (V2.0).
     */
    public static ProjectDataDto successWithCalendars(Long projectId, String projectName, 
            List<TaskDataDto> tasks, List<ResourceDataDto> resources, 
            List<CalendarDataDto> calendars, String loadedFrom) {
        ProjectDataDto dto = success(projectId, projectName, tasks, resources, loadedFrom);
        dto.setCalendars(calendars != null ? calendars : new ArrayList<>());
        return dto;
    }
    
    // Getters and Setters
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    
    public List<TaskDataDto> getTasks() { return tasks; }
    public void setTasks(List<TaskDataDto> tasks) { this.tasks = tasks; }
    
    public List<ResourceDataDto> getResources() { return resources; }
    public void setResources(List<ResourceDataDto> resources) { this.resources = resources; }
    
    public String getLoadedFrom() { return loadedFrom; }
    public void setLoadedFrom(String loadedFrom) { this.loadedFrom = loadedFrom; }
    
    public List<CalendarDataDto> getCalendars() { return calendars; }
    public void setCalendars(List<CalendarDataDto> calendars) { 
        this.calendars = calendars != null ? calendars : new ArrayList<>(); 
    }
    
    public int getTaskCount() { return tasks != null ? tasks.size() : 0; }
    public int getResourceCount() { return resources != null ? resources.size() : 0; }
    public int getCalendarCount() { return calendars != null ? calendars.size() : 0; }
    
    /**
     * DTO для задачи - соответствует frontend Task interface
     */
    public static class TaskDataDto {
        private String id;
        private String name;
        private String startDate;      // ISO-8601 string
        private String endDate;        // ISO-8601 string
        private double progress;     // 0-100
        private String color;
        private int level;           // уровень вложенности (WBS)
        private boolean summary;     // является ли суммарной задачей
        private String type;         // TASK, MILESTONE
        private List<String> children;
        private List<String> predecessors;
        private List<String> resourceIds;
        private boolean critical;
        private boolean milestone;
        private boolean estimated;
        private String notes;
        private String wbs;
        private Double duration;
        private Double totalSlack;    // запас времени в днях (для CPM)     // длительность в днях (Stage 7.19 - Task Usage Crash Fix)
        
        public TaskDataDto() {
            this.children = new ArrayList<>();
            this.predecessors = new ArrayList<>();
            this.resourceIds = new ArrayList<>();
            this.color = "#4A90D9";
            this.type = "TASK";
        }
        
        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
        
        public double getProgress() { return progress; }
        public void setProgress(double progress) { this.progress = progress; }
        
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
        
        public int getLevel() { return level; }
        public void setLevel(int level) { this.level = level; }
        
        public boolean isSummary() { return summary; }
        public void setSummary(boolean summary) { this.summary = summary; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public List<String> getChildren() { return children; }
        public void setChildren(List<String> children) { this.children = children; }
        
        public List<String> getPredecessors() { return predecessors; }
        public void setPredecessors(List<String> predecessors) { this.predecessors = predecessors; }
        
        public List<String> getResourceIds() { return resourceIds; }
        public void setResourceIds(List<String> resourceIds) { this.resourceIds = resourceIds; }
        
        public boolean isCritical() { return critical; }
        public void setCritical(boolean critical) { this.critical = critical; }
        
        public boolean isMilestone() { return milestone; }
        public void setMilestone(boolean milestone) { this.milestone = milestone; }
        
        public boolean isEstimated() { return estimated; }
        public void setEstimated(boolean estimated) { this.estimated = estimated; }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        
        public String getWbs() { return wbs; }
        public void setWbs(String wbs) { this.wbs = wbs; }
        
        // Stage 7.19: Duration getter/setter для Task Usage View
        public Double getDuration() { return duration; }
        public void setDuration(Double duration) { this.duration = duration; }
        
        // Total Slack getter/setter для Critical Path Method
        public Double getTotalSlack() { return totalSlack; }
        public void setTotalSlack(Double totalSlack) { this.totalSlack = totalSlack; }
    }
    
    /**
     * DTO для ресурса - соответствует frontend Resource interface
     */
    public static class ResourceDataDto {
        private String id;
        private String name;
        private String type;          // Work, Material, Cost
        private double maxUnits;
        private double standardRate;
        private double overtimeRate;
        private double costPerUse;
        private String email;
        private String group;
        private String calendarId;
        private boolean available;
        
        public ResourceDataDto() {
            this.type = "Work";
            this.maxUnits = 1.0;
            this.available = true;
        }
        
        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public double getMaxUnits() { return maxUnits; }
        public void setMaxUnits(double maxUnits) { this.maxUnits = maxUnits; }
        
        public double getStandardRate() { return standardRate; }
        public void setStandardRate(double standardRate) { this.standardRate = standardRate; }
        
        public double getOvertimeRate() { return overtimeRate; }
        public void setOvertimeRate(double overtimeRate) { this.overtimeRate = overtimeRate; }
        
        public double getCostPerUse() { return costPerUse; }
        public void setCostPerUse(double costPerUse) { this.costPerUse = costPerUse; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getGroup() { return group; }
        public void setGroup(String group) { this.group = group; }
        
        public String getCalendarId() { return calendarId; }
        public void setCalendarId(String calendarId) { this.calendarId = calendarId; }
        
        public boolean isAvailable() { return available; }
        public void setAvailable(boolean available) { this.available = available; }
    }
}
