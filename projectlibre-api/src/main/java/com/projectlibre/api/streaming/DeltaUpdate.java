package com.projectlibre.api.streaming;

import java.time.Instant;
import java.util.Objects;

/**
 * Represents a single delta update for an entity field
 * Minimizes data transfer by sending only changes
 */
public class DeltaUpdate {
    
    private final String entityType;
    private final Long entityId;
    private final String field;
    private final Object oldValue;
    private final Object newValue;
    private final Instant timestamp;
    private final String transactionId;
    private final ChangeOperation operation;
    
    public DeltaUpdate(String entityType, Long entityId, String field, Object oldValue, Object newValue) {
        this(entityType, entityId, field, oldValue, newValue, ChangeOperation.UPDATE, null);
    }
    
    public DeltaUpdate(String entityType, Long entityId, String field, Object oldValue, 
                       Object newValue, ChangeOperation operation, String transactionId) {
        this.entityType = entityType;
        this.entityId = entityId;
        this.field = field;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.timestamp = Instant.now();
        this.operation = operation;
        this.transactionId = transactionId;
    }
    
    public static DeltaUpdate createInsert(String entityType, Long entityId) {
        return new DeltaUpdate(entityType, entityId, null, null, null, ChangeOperation.INSERT, null);
    }
    
    public static DeltaUpdate createDelete(String entityType, Long entityId) {
        return new DeltaUpdate(entityType, entityId, null, null, null, ChangeOperation.DELETE, null);
    }
    
    public String getEntityType() { return entityType; }
    public Long getEntityId() { return entityId; }
    public String getField() { return field; }
    public Object getOldValue() { return oldValue; }
    public Object getNewValue() { return newValue; }
    public Instant getTimestamp() { return timestamp; }
    public String getTransactionId() { return transactionId; }
    public ChangeOperation getOperation() { return operation; }
    
    public boolean isFieldUpdate() { 
        return operation == ChangeOperation.UPDATE && field != null; 
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DeltaUpdate that = (DeltaUpdate) o;
        return Objects.equals(entityType, that.entityType) &&
               Objects.equals(entityId, that.entityId) &&
               Objects.equals(field, that.field) &&
               Objects.equals(timestamp, that.timestamp);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(entityType, entityId, field, timestamp);
    }
    
    @Override
    public String toString() {
        return String.format("DeltaUpdate{%s.%s[%d].%s: %s -> %s}",
                entityType, operation, entityId, field, oldValue, newValue);
    }
    
    public enum ChangeOperation {
        INSERT, UPDATE, DELETE
    }
}
