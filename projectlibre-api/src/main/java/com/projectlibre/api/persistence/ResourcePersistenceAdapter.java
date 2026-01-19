package com.projectlibre.api.persistence;

import com.projectlibre.api.model.Resource;

/**
 * Адаптер персистентности для ресурсов
 * Реализует хранение ресурсов с правильной извлечкой ID
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ResourcePersistenceAdapter extends InMemoryPersistenceAdapter<Resource> {
    
    public ResourcePersistenceAdapter() {
        super("resource_persistence");
    }
    
    @Override
    protected Long extractId(Resource entity) {
        if (entity == null) {
            throw new PersistenceException("Resource entity cannot be null");
        }
        Long id = entity.getId();
        if (id == null) {
            throw new PersistenceException("Resource ID cannot be null");
        }
        return id;
    }
}
