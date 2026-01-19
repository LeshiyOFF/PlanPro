package com.projectlibre.api.streaming;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.stream.Collectors;

/**
 * Thread-safe delta tracker for change management
 * Tracks entity changes for efficient UI updates
 */
public class DeltaTracker implements DeltaUpdatePort {
    
    private static volatile DeltaTracker instance;
    private static final Object LOCK = new Object();
    
    private final Queue<DeltaUpdate> pendingChanges = new ConcurrentLinkedQueue<>();
    private final Map<String, List<DeltaUpdate>> transactionChanges = new ConcurrentHashMap<>();
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    
    private DeltaTracker() {}
    
    public static DeltaTracker getInstance() {
        DeltaTracker result = instance;
        if (result == null) {
            synchronized (LOCK) {
                result = instance;
                if (result == null) {
                    instance = result = new DeltaTracker();
                }
            }
        }
        return result;
    }
    
    @Override
    public void trackChange(String entityType, Long entityId, String field, Object oldValue, Object newValue) {
        if (Objects.equals(oldValue, newValue)) return;
        
        DeltaUpdate update = new DeltaUpdate(entityType, entityId, field, oldValue, newValue);
        pendingChanges.add(update);
    }
    
    @Override
    public List<DeltaUpdate> getPendingChanges() {
        rwLock.readLock().lock();
        try {
            return new ArrayList<>(pendingChanges);
        } finally {
            rwLock.readLock().unlock();
        }
    }
    
    @Override
    public List<DeltaUpdate> getChangesForEntity(String entityType, Long entityId) {
        return pendingChanges.stream()
                .filter(u -> entityType.equals(u.getEntityType()) && entityId.equals(u.getEntityId()))
                .collect(Collectors.toList());
    }
    
    @Override
    public void clearPendingChanges() {
        rwLock.writeLock().lock();
        try {
            pendingChanges.clear();
        } finally {
            rwLock.writeLock().unlock();
        }
    }
    
    @Override
    public void clearChangesForEntity(String entityType, Long entityId) {
        rwLock.writeLock().lock();
        try {
            pendingChanges.removeIf(u -> 
                entityType.equals(u.getEntityType()) && entityId.equals(u.getEntityId()));
        } finally {
            rwLock.writeLock().unlock();
        }
    }
    
    @Override
    public Map<String, Map<Long, Map<String, Object>>> getCompactChanges() {
        Map<String, Map<Long, Map<String, Object>>> result = new HashMap<>();
        
        for (DeltaUpdate update : pendingChanges) {
            if (!update.isFieldUpdate()) continue;
            
            result.computeIfAbsent(update.getEntityType(), k -> new HashMap<>())
                  .computeIfAbsent(update.getEntityId(), k -> new HashMap<>())
                  .put(update.getField(), update.getNewValue());
        }
        return result;
    }
    
    @Override
    public boolean hasPendingChanges() { return !pendingChanges.isEmpty(); }
    
    @Override
    public int getPendingChangeCount() { return pendingChanges.size(); }
    
    @Override
    public void applyUpdate(DeltaUpdate update) {
        pendingChanges.add(update);
    }
    
    @Override
    public void beginTransaction(String transactionId) {
        transactionChanges.put(transactionId, new ArrayList<>());
    }
    
    @Override
    public void commitTransaction(String transactionId) {
        List<DeltaUpdate> changes = transactionChanges.remove(transactionId);
        if (changes != null) {
            pendingChanges.addAll(changes);
        }
    }
    
    @Override
    public void rollbackTransaction(String transactionId) {
        transactionChanges.remove(transactionId);
    }
    
    public void trackInsert(String entityType, Long entityId) {
        pendingChanges.add(DeltaUpdate.createInsert(entityType, entityId));
    }
    
    public void trackDelete(String entityType, Long entityId) {
        pendingChanges.add(DeltaUpdate.createDelete(entityType, entityId));
    }
}
