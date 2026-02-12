package com.projectlibre.api.model;

import com.projectlibre.api.dto.PreferencesDto;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Модель проекта для ProjectLibre API
 * Содержит основные поля и методы для управления проектами
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class Project extends BaseEntity {
    
    private String status;
    private String priority;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime imposedFinishDate; // VB.1: Жёсткий дедлайн, null = автоматический режим
    private Double progress;
    private List<String> resources;
    private String owner;
    private Integer estimatedHours;
    private Integer actualHours;
    private PreferencesDto preferences;

    /**
     * Конструктор по умолчанию
     */
    public Project() {
        super();
        this.status = "PLANNING";
        this.priority = "MEDIUM";
        this.progress = 0.0;
        this.resources = new ArrayList<>();
        this.estimatedHours = 0;
        this.actualHours = 0;
    }

    /**
     * Конструктор с параметрами
     */
    public Project(String name, String description, String owner) {
        super();
        this.name = name;
        this.description = description;
        this.owner = owner;
        this.status = "PLANNING";
        this.priority = "MEDIUM";
        this.progress = 0.0;
        this.resources = new ArrayList<>();
        this.estimatedHours = 0;
        this.actualHours = 0;
    }

    /**
     * Получить настройки проекта
     */
    public PreferencesDto getPreferences() {
        return preferences;
    }

    /**
     * Установить настройки проекта
     */
    public void setPreferences(PreferencesDto preferences) {
        this.preferences = preferences;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Получить статус проекта
     */
    public String getStatus() {
        return status;
    }

    /**
     * Установить статус проекта
     */
    public void setStatus(String status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Получить приоритет проекта
     */
    public String getPriority() {
        return priority;
    }

    /**
     * Установить приоритет проекта
     */
    public void setPriority(String priority) {
        this.priority = priority;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Получить дату начала проекта
     */
    public LocalDateTime getStartDate() {
        return startDate;
    }

    /**
     * Установить дату начала проекта
     */
    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Получить дату окончания проекта
     */
    public LocalDateTime getEndDate() {
        return endDate;
    }

    /**
     * Установить дату окончания проекта
     */
    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * VB.1: Получить imposed finish date (жёсткий дедлайн, заданный пользователем).
     */
    public LocalDateTime getImposedFinishDate() {
        return imposedFinishDate;
    }

    /**
     * VB.1: Установить imposed finish date.
     */
    public void setImposedFinishDate(LocalDateTime imposedFinishDate) {
        this.imposedFinishDate = imposedFinishDate;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Получить прогресс проекта (0-100%)
     */
    public Double getProgress() {
        return progress;
    }

    /**
     * Установить прогресс проекта
     */
    public void setProgress(Double progress) {
        this.progress = Math.max(0.0, Math.min(100.0, progress));
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Получить список ресурсов проекта
     */
    public List<String> getResources() {
        return new ArrayList<>(resources);
    }

    /**
     * Установить список ресурсов проекта
     */
    public void setResources(List<String> resources) {
        this.resources = new ArrayList<>(resources);
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Добавить ресурс в проект
     */
    public void addResource(String resource) {
        if (resource != null && !resource.trim().isEmpty()) {
            this.resources.add(resource);
            this.updatedAt = LocalDateTime.now();
        }
    }

    /**
     * Удалить ресурс из проекта
     */
    public void removeResource(String resource) {
        if (resources.remove(resource)) {
            this.updatedAt = LocalDateTime.now();
        }
    }

    /**
     * Получить владельца проекта
     */
    public String getOwner() {
        return owner;
    }

    /**
     * Установить владельца проекта
     */
    public void setOwner(String owner) {
        this.owner = owner;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Получить оценочное время проекта
     */
    public Integer getEstimatedHours() {
        return estimatedHours;
    }

    /**
     * Установить оценочное время проекта
     */
    public void setEstimatedHours(Integer estimatedHours) {
        this.estimatedHours = Math.max(0, estimatedHours);
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Получить фактическое время проекта
     */
    public Integer getActualHours() {
        return actualHours;
    }

    /**
     * Установить фактическое время проекта
     */
    public void setActualHours(Integer actualHours) {
        this.actualHours = Math.max(0, actualHours);
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Проверить активен ли проект
     */
    public boolean isActive() {
        return !"COMPLETED".equals(status) && !"CANCELLED".equals(status);
    }

    /**
     * Проверить просрочен ли проект
     */
    public boolean isOverdue() {
        return endDate != null && LocalDateTime.now().isAfter(endDate) && isActive();
    }

    /**
     * Получить общую информацию о проекте
     */
    public String getProjectSummary() {
        return String.format(
            "Project[%s]: %s (%s) - %s%% - %d resources",
            id, name, status, progress, resources.size()
        );
    }
}