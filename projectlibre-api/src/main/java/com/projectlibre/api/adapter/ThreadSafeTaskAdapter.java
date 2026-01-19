package com.projectlibre.api.adapter;

import com.projectlibre.api.model.Task;
import com.projectlibre.api.persistence.TaskPersistenceAdapter;
import com.projectlibre.api.repository.TaskRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Потокобезопасный адаптер для работы с задачами
 * Реализует TaskRepository с использованием PersistencePort
 * 
 * @author ProjectLibre Team
 * @version 3.0.0
 */
public class ThreadSafeTaskAdapter 
        extends AbstractThreadSafeAdapter<Task> 
        implements TaskRepository {
    
    private static volatile ThreadSafeTaskAdapter instance;
    private static final Object LOCK = new Object();
    
    private ThreadSafeTaskAdapter() {
        super("task", new TaskPersistenceAdapter());
    }
    
    public static ThreadSafeTaskAdapter getInstance() {
        ThreadSafeTaskAdapter result = instance;
        if (result == null) {
            synchronized (LOCK) {
                result = instance;
                if (result == null) {
                    instance = result = new ThreadSafeTaskAdapter();
                }
            }
        }
        return result;
    }
    
    @Override
    public Optional<Task> findById(Long id) {
        return persistence.findById(id);
    }
    
    @Override
    public List<Task> findAll() {
        return persistence.findAll();
    }
    
    @Override
    public Task save(Task entity) {
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
    public List<Task> findByProjectId(Long projectId) {
        return persistence.findAll().stream()
            .filter(t -> projectId.equals(t.getProjectId()))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<Task> findByStatus(String status) {
        return persistence.findAll().stream()
            .filter(t -> status.equals(t.getStatus()))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<Task> findByAssigneeId(Long assigneeId) {
        return persistence.findAll().stream()
            .filter(t -> assigneeId.equals(t.getAssigneeId()))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<Task> findOverdueTasks() {
        return persistence.findAll().stream()
            .filter(Task::isOverdue)
            .collect(Collectors.toList());
    }
}
