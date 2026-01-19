package com.projectlibre.api.adapter;

import com.projectlibre.api.model.Resource;
import com.projectlibre.api.persistence.ResourcePersistenceAdapter;
import com.projectlibre.api.repository.ResourceRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Потокобезопасный адаптер для работы с ресурсами
 * Реализует ResourceRepository с использованием PersistencePort
 * 
 * @author ProjectLibre Team
 * @version 3.0.0
 */
public class ThreadSafeResourceAdapter 
        extends AbstractThreadSafeAdapter<Resource> 
        implements ResourceRepository {
    
    private static volatile ThreadSafeResourceAdapter instance;
    private static final Object LOCK = new Object();
    
    private ThreadSafeResourceAdapter() {
        super("resource", new ResourcePersistenceAdapter());
    }
    
    public static ThreadSafeResourceAdapter getInstance() {
        ThreadSafeResourceAdapter result = instance;
        if (result == null) {
            synchronized (LOCK) {
                result = instance;
                if (result == null) {
                    instance = result = new ThreadSafeResourceAdapter();
                }
            }
        }
        return result;
    }
    
    @Override
    public Optional<Resource> findById(Long id) {
        return persistence.findById(id);
    }
    
    @Override
    public List<Resource> findAll() {
        return persistence.findAll();
    }
    
    @Override
    public Resource save(Resource entity) {
        return executeWrite(() -> {
            if (entity.getId() == null) {
                entity.setId(getNextId());
            }
            entity.setUpdatedAt(LocalDateTime.now());
            return persistence.save(entity);
        });
    }
    
    @Override
    public boolean deleteById(Long id) {
        return persistence.deleteById(id);
    }
    
    @Override
    public List<Resource> findByType(String type) {
        return persistence.findAll().stream()
            .filter(r -> type.equals(r.getType()))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<Resource> findByStatus(String status) {
        return persistence.findAll().stream()
            .filter(r -> status.equals(r.getStatus()))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<Resource> findByProjectId(Long projectId) {
        return persistence.findAll().stream()
            .filter(r -> r.getProjectIds().contains(projectId))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<Resource> findAvailableResources() {
        return persistence.findAll().stream()
            .filter(Resource::isAvailable)
            .collect(Collectors.toList());
    }
}
