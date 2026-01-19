package com.projectlibre.api.cache;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Port for hybrid repository operations
 * Combines H2 query cache with .pod file storage
 * H2 = fast queries, .pod = authoritative persistence
 */
public interface HybridRepositoryPort {
    
    /**
     * Save project to file storage and sync to cache
     * @param projectId project id
     * @param projectData project data
     * @param filePath file path for storage
     * @return true if saved successfully
     */
    boolean saveProject(Long projectId, Map<String, Object> projectData, String filePath);
    
    /**
     * Load project from file storage and sync to cache
     * @param filePath file path
     * @return project data or empty
     */
    Optional<Map<String, Object>> loadProject(String filePath);
    
    /**
     * Find projects by criteria using cache
     * @param fieldName field name
     * @param value field value
     * @return matching projects
     */
    List<Map<String, Object>> findProjectsByField(String fieldName, Object value);
    
    /**
     * Search projects by text using cache
     * @param query search query
     * @return matching projects
     */
    List<Map<String, Object>> searchProjects(String query);
    
    /**
     * Find tasks by project id using cache
     * @param projectId project id
     * @return tasks in project
     */
    List<Map<String, Object>> findTasksByProject(Long projectId);
    
    /**
     * Find critical path tasks using cache
     * @param projectId project id
     * @return critical tasks
     */
    List<Map<String, Object>> findCriticalTasks(Long projectId);
    
    /**
     * Search tasks by text using cache
     * @param projectId project id
     * @param query search query
     * @return matching tasks
     */
    List<Map<String, Object>> searchTasks(Long projectId, String query);
    
    /**
     * Get task count by status using cache
     * @param projectId project id
     * @param status task status
     * @return count of tasks
     */
    long countTasksByStatus(Long projectId, String status);
    
    /**
     * Sync project data to cache (after load or save)
     * @param projectId project id
     * @param projectData full project data
     */
    void syncToCache(Long projectId, Map<String, Object> projectData);
    
    /**
     * Remove project from cache
     * @param projectId project id
     */
    void removeFromCache(Long projectId);
    
    /**
     * Clear all cache data
     */
    void clearCache();
    
    /**
     * Check if cache is available
     * @return true if cache is ready
     */
    boolean isCacheAvailable();
}
