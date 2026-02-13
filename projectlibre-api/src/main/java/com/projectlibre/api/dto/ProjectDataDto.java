package com.projectlibre.api.dto;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;

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
    private Long imposedFinishDate; // VB.1: Жёсткий дедлайн (миллисекунды), null = автоматический режим
    private Boolean isForward; // VB.12: Режим планирования (true = Schedule from Start, false = Schedule from End)
    
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
    
    /**
     * VB.1: Получить imposed finish date (жёсткий дедлайн, заданный пользователем).
     */
    public Long getImposedFinishDate() { return imposedFinishDate; }
    
    /**
     * VB.1: Установить imposed finish date.
     */
    public void setImposedFinishDate(Long imposedFinishDate) { 
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
    
    public int getTaskCount() { return tasks != null ? tasks.size() : 0; }
    public int getResourceCount() { return resources != null ? resources.size() : 0; }
    public int getCalendarCount() { return calendars != null ? calendars.size() : 0; }
    
    /**
     * DTO для задачи - соответствует frontend Task interface
     * 
     * V2.3.0 HYBRID-CPM: Добавлены earlyStart/earlyFinish/lateStart/lateFinish
     * для информирования пользователя о CPM-рассчитанных датах.
     */
    public static class TaskDataDto {
        private String id;
        private String name;
        private String startDate;      // ISO-8601 string
        private String endDate;        // ISO-8601 string
        /** CORE-AUTH.2.1: CPM-рассчитанная дата начала (ISO-8601). Core-authoritative. */
        private String calculatedStartDate;
        /** CORE-AUTH.2.2: CPM-рассчитанная дата окончания (ISO-8601). Core-authoritative. */
        private String calculatedEndDate;
        /** HYBRID-CPM: Раннее начало — когда задача МОЖЕТ начаться (ISO-8601). */
        private String earlyStart;
        /** HYBRID-CPM: Раннее окончание (ISO-8601). */
        private String earlyFinish;
        /** HYBRID-CPM: Позднее начало — крайний срок начала без сдвига проекта (ISO-8601). */
        private String lateStart;
        /** HYBRID-CPM: Позднее окончание (ISO-8601). */
        private String lateFinish;
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
        private Double totalSlack;
        /** CPM-MS.7: Для summary — содержит ли критические дочерние задачи (UI индикатор). */
        private Boolean containsCriticalChildren;
        /** CPM-MS.7: Для summary — минимальный slack среди детей (информационная метрика). */
        private Double minChildSlack;
        /**
         * UNITS-FIX: Полная информация о назначениях ресурсов с units.
         * Формат: [{"resourceId": "RES-1", "units": 2.0}, ...]
         * units: 1.0 = 100%, 2.0 = 200%, etc.
         */
        private List<Map<String, Object>> resourceAssignments;
        
        /**
         * PERSISTENT-CONFLICT: Осознанные конфликты дат.
         * Map: predecessorId -> true (пользователь осознанно поставил конфликтную дату).
         * Используется для предотвращения автокоррекции дат при CPM recalculation.
         */
        private Map<String, Boolean> acknowledgedConflicts;
        
        public TaskDataDto() {
            this.children = new ArrayList<>();
            this.predecessors = new ArrayList<>();
            this.resourceIds = new ArrayList<>();
            this.resourceAssignments = new ArrayList<>();
            this.acknowledgedConflicts = new java.util.HashMap<>();
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
        
        /** CORE-AUTH.2.1: Получить CPM-рассчитанную дату начала */
        public String getCalculatedStartDate() { return calculatedStartDate; }
        public void setCalculatedStartDate(String calculatedStartDate) { this.calculatedStartDate = calculatedStartDate; }
        
        /** CORE-AUTH.2.2: Получить CPM-рассчитанную дату окончания */
        public String getCalculatedEndDate() { return calculatedEndDate; }
        public void setCalculatedEndDate(String calculatedEndDate) { this.calculatedEndDate = calculatedEndDate; }
        
        /** HYBRID-CPM: Раннее начало — когда задача МОЖЕТ начаться */
        public String getEarlyStart() { return earlyStart; }
        public void setEarlyStart(String earlyStart) { this.earlyStart = earlyStart; }
        
        /** HYBRID-CPM: Раннее окончание */
        public String getEarlyFinish() { return earlyFinish; }
        public void setEarlyFinish(String earlyFinish) { this.earlyFinish = earlyFinish; }
        
        /** HYBRID-CPM: Позднее начало — крайний срок начала без сдвига проекта */
        public String getLateStart() { return lateStart; }
        public void setLateStart(String lateStart) { this.lateStart = lateStart; }
        
        /** HYBRID-CPM: Позднее окончание */
        public String getLateFinish() { return lateFinish; }
        public void setLateFinish(String lateFinish) { this.lateFinish = lateFinish; }
        
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
        
        /** UNITS-FIX: Получить полные данные о назначениях с units */
        public List<Map<String, Object>> getResourceAssignments() { return resourceAssignments; }
        /** UNITS-FIX: Установить полные данные о назначениях с units */
        public void setResourceAssignments(List<Map<String, Object>> resourceAssignments) { this.resourceAssignments = resourceAssignments; }
        
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
        
        // CPM-MS.7: containsCriticalChildren для UI подсветки summary задач
        public Boolean getContainsCriticalChildren() { return containsCriticalChildren; }
        public void setContainsCriticalChildren(Boolean containsCriticalChildren) { this.containsCriticalChildren = containsCriticalChildren; }
        
        // CPM-MS.7: minChildSlack — минимальный slack среди детей summary задачи
        public Double getMinChildSlack() { return minChildSlack; }
        public void setMinChildSlack(Double minChildSlack) { this.minChildSlack = minChildSlack; }
        
        /**
         * PERSISTENT-CONFLICT: Получить карту осознанных конфликтов.
         * @return Map<predecessorId, true> для конфликтов которые пользователь подтвердил
         */
        public Map<String, Boolean> getAcknowledgedConflicts() { 
            return acknowledgedConflicts != null ? acknowledgedConflicts : new java.util.HashMap<>(); 
        }
        
        /**
         * PERSISTENT-CONFLICT: Установить карту осознанных конфликтов.
         * @param acknowledgedConflicts Map<predecessorId, true>
         */
        public void setAcknowledgedConflicts(Map<String, Boolean> acknowledgedConflicts) { 
            this.acknowledgedConflicts = acknowledgedConflicts; 
        }
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
