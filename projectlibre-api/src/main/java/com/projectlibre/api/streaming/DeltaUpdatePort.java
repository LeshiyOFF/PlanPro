package com.projectlibre.api.streaming;

import java.util.List;
import java.util.Map;

/**
 * Port for delta update operations
 * Enables sending only changes instead of full data
 * Critical for UI responsiveness on large projects
 */
public interface DeltaUpdatePort {
    
    /**
     * Track changes to an entity
     * @param entityType type of entity (task, resource, project)
     * @param entityId entity identifier
     * @param field field name
     * @param oldValue old value
     * @param newValue new value
     */
    void trackChange(String entityType, Long entityId, String field, Object oldValue, Object newValue);
    
    /**
     * Get pending changes since last sync
     * @return list of delta updates
     */
    List<DeltaUpdate> getPendingChanges();
    
    /**
     * Get changes for specific entity
     * @param entityType entity type
     * @param entityId entity id
     * @return changes for entity
     */
    List<DeltaUpdate> getChangesForEntity(String entityType, Long entityId);
    
    /**
     * Clear pending changes after successful sync
     */
    void clearPendingChanges();
    
    /**
     * Clear changes for specific entity
     * @param entityType entity type
     * @param entityId entity id
     */
    void clearChangesForEntity(String entityType, Long entityId);
    
    /**
     * Get changes as compact batch update
     * @return map of entity type to entity changes
     */
    Map<String, Map<Long, Map<String, Object>>> getCompactChanges();
    
    /**
     * Check if there are pending changes
     * @return true if changes exist
     */
    boolean hasPendingChanges();
    
    /**
     * Get count of pending changes
     * @return number of changes
     */
    int getPendingChangeCount();
    
    /**
     * Apply delta update from external source
     * @param update delta update to apply
     */
    void applyUpdate(DeltaUpdate update);
    
    /**
     * Begin a transaction (group changes)
     * @param transactionId transaction identifier
     */
    void beginTransaction(String transactionId);
    
    /**
     * Commit transaction
     * @param transactionId transaction identifier
     */
    void commitTransaction(String transactionId);
    
    /**
     * Rollback transaction
     * @param transactionId transaction identifier
     */
    void rollbackTransaction(String transactionId);
}
