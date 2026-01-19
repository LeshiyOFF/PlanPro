package com.projectlibre.api.service;

import com.projectlibre.api.cache.HybridRepositoryAdapter;
import com.projectlibre.api.cache.HybridRepositoryPort;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service for hybrid cache operations
 * Provides API layer access to H2 cache + .pod file storage
 */
public class HybridCacheService {
    
    private static volatile HybridCacheService instance;
    private static final Object LOCK = new Object();
    
    private final HybridRepositoryPort repository;
    
    private HybridCacheService() {
        this.repository = HybridRepositoryAdapter.getInstance();
    }
    
    public static HybridCacheService getInstance() {
        HybridCacheService result = instance;
        if (result == null) {
            synchronized (LOCK) {
                result = instance;
                if (result == null) {
                    instance = result = new HybridCacheService();
                }
            }
        }
        return result;
    }
    
    /**
     * Save project with automatic caching
     */
    public boolean saveProject(Long projectId, Map<String, Object> projectData, String filePath) {
        return repository.saveProject(projectId, projectData, filePath);
    }
    
    /**
     * Load project with automatic caching
     */
    public Optional<Map<String, Object>> loadProject(String filePath) {
        return repository.loadProject(filePath);
    }
    
    /**
     * Fast search in projects using H2 cache
     */
    public List<Map<String, Object>> searchProjects(String query) {
        return repository.searchProjects(query);
    }
    
    /**
     * Find projects by field using H2 cache
     */
    public List<Map<String, Object>> findProjectsByStatus(String status) {
        return repository.findProjectsByField("status", status);
    }
    
    /**
     * Get tasks for project using H2 cache
     */
    public List<Map<String, Object>> getProjectTasks(Long projectId) {
        return repository.findTasksByProject(projectId);
    }
    
    /**
     * Get critical path tasks using H2 cache
     */
    public List<Map<String, Object>> getCriticalTasks(Long projectId) {
        return repository.findCriticalTasks(projectId);
    }
    
    /**
     * Search tasks in project using H2 cache
     */
    public List<Map<String, Object>> searchTasks(Long projectId, String query) {
        return repository.searchTasks(projectId, query);
    }
    
    /**
     * Count tasks by status using H2 cache
     */
    public long countTasks(Long projectId) {
        return repository.countTasksByStatus(projectId, null);
    }
    
    /**
     * Manually sync project to cache
     */
    public void syncProjectToCache(Long projectId, Map<String, Object> projectData) {
        repository.syncToCache(projectId, projectData);
    }
    
    /**
     * Remove project from cache
     */
    public void removeProjectFromCache(Long projectId) {
        repository.removeFromCache(projectId);
    }
    
    /**
     * Clear all cache
     */
    public void clearCache() {
        repository.clearCache();
    }
    
    /**
     * Check if cache is available
     */
    public boolean isCacheAvailable() {
        return repository.isCacheAvailable();
    }
}
