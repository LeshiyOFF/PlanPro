package com.projectlibre.api.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

public class Task extends BaseEntity {
    private String title;
    private String description;
    private String status;
    private String priority;
    private Long projectId;
    private Long assigneeId;
    private LocalDateTime dueDate;
    private LocalDateTime startDate;
    private Double estimatedHours;
    private Double actualHours;
    private Double progress;
    private List<String> tags;
    private List<String> dependencies;
    private String type;

    public Task() {
        super();
        this.tags = new ArrayList<>();
        this.dependencies = new ArrayList<>();
        this.status = "NEW";
        this.priority = "MEDIUM";
        this.type = "TASK";
        this.progress = 0.0;
    }

    public Task(String title, String description, Long projectId) {
        this();
        this.title = title;
        this.description = description;
        this.projectId = projectId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public Double getEstimatedHours() {
        return estimatedHours;
    }

    public void setEstimatedHours(Double estimatedHours) {
        this.estimatedHours = estimatedHours;
    }

    public Double getActualHours() {
        return actualHours;
    }

    public void setActualHours(Double actualHours) {
        this.actualHours = actualHours;
    }

    public Double getProgress() {
        return progress;
    }

    public void setProgress(Double progress) {
        this.progress = progress;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public List<String> getDependencies() {
        return dependencies;
    }

    public void setDependencies(List<String> dependencies) {
        this.dependencies = dependencies;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isCompleted() {
        return "COMPLETED".equals(status);
    }

    public boolean isInProgress() {
        return "IN_PROGRESS".equals(status);
    }

    public boolean isOverdue() {
        return dueDate != null && LocalDateTime.now().isAfter(dueDate) && !isCompleted();
    }

    public boolean hasAssignee() {
        return assigneeId != null;
    }

    public void addTag(String tag) {
        if (tags == null) {
            tags = new ArrayList<>();
        }
        if (!tags.contains(tag)) {
            tags.add(tag);
        }
    }

    public void removeTag(String tag) {
        if (tags != null) {
            tags.remove(tag);
        }
    }

    public void addDependency(String taskId) {
        if (dependencies == null) {
            dependencies = new ArrayList<>();
        }
        if (!dependencies.contains(taskId)) {
            dependencies.add(taskId);
        }
    }

    public void removeDependency(String taskId) {
        if (dependencies != null) {
            dependencies.remove(taskId);
        }
    }

    public void updateProgress(Double newProgress) {
        this.progress = Math.max(0.0, Math.min(100.0, newProgress));
        if (this.progress >= 100.0) {
            this.status = "COMPLETED";
        } else if (this.progress > 0.0) {
            this.status = "IN_PROGRESS";
        }
    }

    public Double getRemainingHours() {
        if (estimatedHours == null) return null;
        if (actualHours == null) return estimatedHours;
        return Math.max(0.0, estimatedHours - actualHours);
    }

    public String getTaskSummary() {
        return String.format("Task[id=%d, title='%s', status='%s', priority='%s', progress=%.1f%%]", 
            id, title, status, priority, progress);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        Task task = (Task) o;
        return id != null && id.equals(task.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public String toString() {
        return getTaskSummary();
    }
}