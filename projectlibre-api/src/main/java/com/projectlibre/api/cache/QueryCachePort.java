package com.projectlibre.api.cache;

import java.util.List;
import java.util.Map;

/**
 * Port for query cache operations (H2 database)
 * Provides fast filtering and search capabilities
 * Follows Hexagonal Architecture (Ports & Adapters)
 */
public interface QueryCachePort {
    
    /**
     * Sync entity to cache
     * @param tableName target table
     * @param id entity id
     * @param data entity data as map
     */
    void syncEntity(String tableName, Long id, Map<String, Object> data);
    
    /**
     * Sync multiple entities to cache
     * @param tableName target table
     * @param entities list of entities as maps
     */
    void syncEntities(String tableName, List<Map<String, Object>> entities);
    
    /**
     * Find entities by field value
     * @param tableName target table
     * @param fieldName field name
     * @param value field value
     * @return list of matching entities
     */
    List<Map<String, Object>> findByField(String tableName, String fieldName, Object value);
    
    /**
     * Search entities by text query
     * @param tableName target table
     * @param searchFields fields to search in
     * @param query search query
     * @return list of matching entities
     */
    List<Map<String, Object>> search(String tableName, List<String> searchFields, String query);
    
    /**
     * Execute custom query
     * @param sql SQL query
     * @param params query parameters
     * @return list of results
     */
    List<Map<String, Object>> executeQuery(String sql, Object... params);
    
    /**
     * Count entities matching criteria
     * @param tableName target table
     * @param fieldName field name
     * @param value field value
     * @return count of matching entities
     */
    long countByField(String tableName, String fieldName, Object value);
    
    /**
     * Remove entity from cache
     * @param tableName target table
     * @param id entity id
     */
    void removeEntity(String tableName, Long id);
    
    /**
     * Clear cache for table
     * @param tableName target table
     */
    void clearTable(String tableName);
    
    /**
     * Clear entire cache
     */
    void clearAll();
    
    /**
     * Check if cache is initialized
     * @return true if initialized
     */
    boolean isInitialized();
}
