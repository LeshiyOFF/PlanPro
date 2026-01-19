package com.projectlibre.api.adapter;

import com.projectlibre.api.model.Project;
import com.projectlibre.api.persistence.ProjectPersistenceAdapter;
import com.projectlibre.api.repository.ProjectRepository;
import com.projectlibre.api.scheduling.RecalculationResult;
import com.projectlibre.api.scheduling.SchedulingEngineAdapter;
import com.projectlibre.api.scheduling.SchedulingEnginePort;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Потокобезопасный адаптер для работы с проектами
 * Реализует ProjectRepository с использованием PersistencePort
 * Интегрирован с SchedulingEngine для пересчёта проекта
 * 
 * @author ProjectLibre Team
 * @version 3.0.0
 */
public class ThreadSafeProjectAdapter 
        extends AbstractThreadSafeAdapter<Project> 
        implements ProjectRepository {
    
    private static volatile ThreadSafeProjectAdapter instance;
    private static final Object LOCK = new Object();
    
    private final SchedulingEnginePort schedulingEngine;
    
    private ThreadSafeProjectAdapter() {
        super("project", new ProjectPersistenceAdapter());
        this.schedulingEngine = SchedulingEngineAdapter.getInstance();
    }
    
    public static ThreadSafeProjectAdapter getInstance() {
        ThreadSafeProjectAdapter result = instance;
        if (result == null) {
            synchronized (LOCK) {
                result = instance;
                if (result == null) {
                    instance = result = new ThreadSafeProjectAdapter();
                }
            }
        }
        return result;
    }
    
    @Override
    public Optional<Project> findById(Long id) {
        return persistence.findById(id);
    }
    
    @Override
    public List<Project> findAll() {
        return persistence.findAll();
    }
    
    @Override
    public Project save(Project entity) {
        return executeWrite(() -> {
            if (entity.getId() == null) {
                entity.setId(getNextId());
            }
            entity.setUpdatedAt(LocalDateTime.now());
            Project saved = persistence.save(entity);
            markProjectForRecalculation(saved.getId());
            return saved;
        });
    }
    
    @Override
    public boolean deleteById(Long id) {
        return persistence.deleteById(id);
    }
    
    @Override
    public List<Project> findByStatus(String status) {
        return persistence.findAll().stream()
            .filter(p -> status.equals(p.getStatus()))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<Project> findByOwner(String owner) {
        return persistence.findAll().stream()
            .filter(p -> owner.equals(p.getOwner()))
            .collect(Collectors.toList());
    }
    
    @Override
    public List<Project> findActiveProjects() {
        return persistence.findAll().stream()
            .filter(Project::isActive)
            .collect(Collectors.toList());
    }
    
    @Override
    public Project recalculate(Long id) {
        return executeWrite(() -> {
            Optional<Project> projectOpt = persistence.findById(id);
            if (projectOpt.isEmpty()) {
                return null;
            }
            Project project = projectOpt.get();
            performRecalculation(project);
            return persistence.save(project);
        });
    }
    
    private void performRecalculation(Project project) {
        RecalculationResult result = schedulingEngine.recalculate(project.getId());
        
        if (result.isSuccess()) {
            project.setUpdatedAt(result.getCalculatedAt());
            logSuccessfulRecalculation(project, result);
        } else {
            logFailedRecalculation(project, result);
        }
    }
    
    private void markProjectForRecalculation(Long projectId) {
        ((SchedulingEngineAdapter) schedulingEngine).markForRecalculation(projectId);
    }
    
    private void logSuccessfulRecalculation(Project project, RecalculationResult result) {
        System.out.println("[ThreadSafeProjectAdapter] Project '" + project.getName() + 
            "' recalculated. Earliest: " + result.getEarliestStart() + 
            ", Latest: " + result.getLatestFinish());
    }
    
    private void logFailedRecalculation(Project project, RecalculationResult result) {
        System.err.println("[ThreadSafeProjectAdapter] Failed to recalculate project '" + 
            project.getName() + "': " + result.getErrorMessage());
    }
}
