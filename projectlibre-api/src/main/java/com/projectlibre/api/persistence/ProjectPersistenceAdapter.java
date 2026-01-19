package com.projectlibre.api.persistence;

import com.projectlibre.api.model.Project;

/**
 * Адаптер персистентности для проектов
 * Реализует хранение проектов с правильной извлечкой ID
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ProjectPersistenceAdapter extends InMemoryPersistenceAdapter<Project> {
    
    public ProjectPersistenceAdapter() {
        super("project_persistence");
    }
    
    @Override
    protected Long extractId(Project entity) {
        if (entity == null) {
            throw new PersistenceException("Project entity cannot be null");
        }
        Long id = entity.getId();
        if (id == null) {
            throw new PersistenceException("Project ID cannot be null");
        }
        return id;
    }
}
