package com.projectlibre.api.service;

import com.projectlibre.api.model.Task;
import java.time.LocalDateTime;
import java.util.ArrayList;

/**
 * Сервис для обновления полей задач
 * Выделен из TaskService для соблюдения SRP и лимита размера файла
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class TaskUpdateService {
    
    /**
     * Обновить все поля задачи из источника
     * 
     * @param target целевая задача
     * @param source источник данных
     */
    public void updateAllFields(Task target, Task source) {
        updateBasicFields(target, source);
        updateTimeFields(target, source);
        updateCollectionFields(target, source);
        target.setUpdatedAt(LocalDateTime.now());
    }
    
    /**
     * Обновить базовые поля задачи
     */
    public void updateBasicFields(Task target, Task source) {
        if (source.getTitle() != null && !source.getTitle().trim().isEmpty()) {
            target.setTitle(source.getTitle());
        }
        if (source.getDescription() != null) {
            target.setDescription(source.getDescription());
        }
        if (source.getStatus() != null) {
            target.setStatus(source.getStatus());
        }
        if (source.getPriority() != null) {
            target.setPriority(source.getPriority());
        }
        if (source.getType() != null) {
            target.setType(source.getType());
        }
        if (source.getProjectId() != null) {
            target.setProjectId(source.getProjectId());
        }
        if (source.getAssigneeId() != null) {
            target.setAssigneeId(source.getAssigneeId());
        }
    }
    
    /**
     * Обновить временные поля задачи
     */
    public void updateTimeFields(Task target, Task source) {
        if (source.getDueDate() != null) {
            target.setDueDate(source.getDueDate());
        }
        if (source.getStartDate() != null) {
            target.setStartDate(source.getStartDate());
        }
        if (source.getEstimatedHours() != null) {
            target.setEstimatedHours(source.getEstimatedHours());
        }
        if (source.getActualHours() != null) {
            target.setActualHours(source.getActualHours());
        }
        if (source.getProgress() != null) {
            target.setProgress(source.getProgress());
        }
    }
    
    /**
     * Обновить коллекции в задаче
     */
    public void updateCollectionFields(Task target, Task source) {
        if (source.getTags() != null) {
            target.setTags(new ArrayList<>(source.getTags()));
        }
        if (source.getDependencies() != null) {
            target.setDependencies(new ArrayList<>(source.getDependencies()));
        }
    }
    
    /**
     * Подготовить новую задачу с значениями по умолчанию
     * 
     * @param task задача для подготовки
     */
    public void prepareNewTask(Task task) {
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        
        if (task.getStatus() == null) {
            task.setStatus("NEW");
        }
        if (task.getPriority() == null) {
            task.setPriority("MEDIUM");
        }
        if (task.getType() == null) {
            task.setType("TASK");
        }
        if (task.getProgress() == null) {
            task.setProgress(0.0);
        }
    }
}
