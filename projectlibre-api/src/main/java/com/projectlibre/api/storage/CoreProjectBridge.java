package com.projectlibre.api.storage;

import com.projectlibre1.pm.task.Project;
import java.util.Collection;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Bridge between API layer and ProjectLibre Core Project model.
 * Provides access to loaded Core projects for file operations.
 * Singleton pattern for global state management.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
public class CoreProjectBridge {
    
    private static volatile CoreProjectBridge instance;
    private static final Object LOCK = new Object();
    
    private final ConcurrentMap<Long, Project> loadedProjects;
    
    private CoreProjectBridge() {
        this.loadedProjects = new ConcurrentHashMap<>();
        System.out.println("[CoreProjectBridge] Bridge created");
    }
    
    public static CoreProjectBridge getInstance() {
        CoreProjectBridge result = instance;
        if (result == null) {
            synchronized (LOCK) {
                result = instance;
                if (result == null) {
                    instance = result = new CoreProjectBridge();
                }
            }
        }
        return result;
    }
    
    public void registerProject(Project project) {
        if (project != null) {
            loadedProjects.put(project.getUniqueId(), project);
            System.out.println("[CoreProjectBridge] Registered: ID=" + project.getUniqueId());
        }
    }
    
    public void unregisterProject(Long projectId) {
        if (projectId != null) {
            loadedProjects.remove(projectId);
        }
    }
    
    public Optional<Project> findById(Long projectId) {
        if (projectId == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(loadedProjects.get(projectId));
    }
    
    public Collection<Project> getAllProjects() {
        return loadedProjects.values();
    }
    
    public boolean isLoaded(Long projectId) {
        return projectId != null && loadedProjects.containsKey(projectId);
    }
    
    public int getLoadedCount() {
        return loadedProjects.size();
    }
    
    public Collection<Long> getAllProjectIds() {
        return loadedProjects.keySet();
    }
    
    public void clearAll() {
        loadedProjects.clear();
    }
}
