package com.projectlibre.api.persistence;

import com.projectlibre.api.model.Task;

/**
 * Адаптер персистентности для задач
 * Реализует хранение задач с правильной извлечкой ID
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class TaskPersistenceAdapter extends InMemoryPersistenceAdapter<Task> {
    
    public TaskPersistenceAdapter() {
        super("task_persistence");
    }
    
    @Override
    protected Long extractId(Task entity) {
        if (entity == null) {
            throw new PersistenceException("Task entity cannot be null");
        }
        Long id = entity.getId();
        if (id == null) {
            throw new PersistenceException("Task ID cannot be null");
        }
        return id;
    }
}
