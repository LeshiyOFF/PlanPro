package com.projectlibre.api.service;

import com.projectlibre.api.dto.ProjectDto;
import com.projectlibre.api.dto.TaskDto;
import com.projectlibre.api.streaming.*;
import java.io.OutputStream;
import java.util.*;
import java.util.function.Consumer;

/**
 * Service for streaming serialization and delta updates
 * Provides API layer access to streaming capabilities
 * Enables instant UI response for 1000+ tasks
 */
public class StreamingService {
    
    private static volatile StreamingService instance;
    private static final Object LOCK = new Object();
    
    private final StreamingSerializerPort serializer;
    private final DeltaUpdatePort deltaTracker;
    
    private StreamingService() {
        this.serializer = StreamingJsonSerializer.getInstance();
        this.deltaTracker = DeltaTracker.getInstance();
    }
    
    public static StreamingService getInstance() {
        StreamingService result = instance;
        if (result == null) {
            synchronized (LOCK) {
                result = instance;
                if (result == null) {
                    instance = result = new StreamingService();
                }
            }
        }
        return result;
    }
    
    /**
     * Stream tasks to output with progress callback
     */
    public void streamTasks(List<TaskDto> tasks, OutputStream output, Consumer<StreamingProgress> progress) {
        serializer.serializeStreamWithProgress(
                tasks.iterator(),
                output,
                TaskItemSerializer.getInstance(),
                progress
        );
    }
    
    /**
     * Stream tasks in batches
     */
    public void streamTasksBatched(List<TaskDto> tasks, Consumer<String> batchConsumer) {
        int batchSize = serializer.getOptimalBatchSize(tasks.size());
        serializer.serializeBatched(
                tasks.iterator(),
                batchSize,
                batchConsumer,
                TaskItemSerializer.getInstance()
        );
    }
    
    /**
     * Stream projects to output
     */
    public void streamProjects(List<ProjectDto> projects, OutputStream output) {
        serializer.serializeStream(
                projects.iterator(),
                output,
                ProjectItemSerializer.getInstance()
        );
    }
    
    /**
     * Track task field change
     */
    public void trackTaskChange(Long taskId, String field, Object oldValue, Object newValue) {
        deltaTracker.trackChange("task", taskId, field, oldValue, newValue);
    }
    
    /**
     * Track project field change
     */
    public void trackProjectChange(Long projectId, String field, Object oldValue, Object newValue) {
        deltaTracker.trackChange("project", projectId, field, oldValue, newValue);
    }
    
    /**
     * Track resource field change
     */
    public void trackResourceChange(Long resourceId, String field, Object oldValue, Object newValue) {
        deltaTracker.trackChange("resource", resourceId, field, oldValue, newValue);
    }
    
    /**
     * Get pending delta updates as JSON
     */
    public String getDeltaUpdatesJson() {
        Map<String, Map<Long, Map<String, Object>>> compact = deltaTracker.getCompactChanges();
        return serializeCompactChanges(compact);
    }
    
    /**
     * Check for pending changes
     */
    public boolean hasPendingChanges() {
        return deltaTracker.hasPendingChanges();
    }
    
    /**
     * Clear pending changes after sync
     */
    public void clearPendingChanges() {
        deltaTracker.clearPendingChanges();
    }
    
    /**
     * Get optimal batch size for task count
     */
    public int getOptimalBatchSize(int taskCount) {
        return serializer.getOptimalBatchSize(taskCount);
    }
    
    /**
     * Estimate response size
     */
    public long estimateResponseSize(int itemCount) {
        return serializer.estimateSize(itemCount, 500);
    }
    
    private String serializeCompactChanges(Map<String, Map<Long, Map<String, Object>>> changes) {
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        boolean first = true;
        
        for (Map.Entry<String, Map<Long, Map<String, Object>>> typeEntry : changes.entrySet()) {
            if (!first) sb.append(",");
            first = false;
            sb.append("\"").append(typeEntry.getKey()).append("\":{");
            
            boolean firstEntity = true;
            for (Map.Entry<Long, Map<String, Object>> entityEntry : typeEntry.getValue().entrySet()) {
                if (!firstEntity) sb.append(",");
                firstEntity = false;
                sb.append("\"").append(entityEntry.getKey()).append("\":");
                sb.append(serializeFieldMap(entityEntry.getValue()));
            }
            sb.append("}");
        }
        sb.append("}");
        return sb.toString();
    }
    
    private String serializeFieldMap(Map<String, Object> fields) {
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : fields.entrySet()) {
            if (!first) sb.append(",");
            first = false;
            sb.append("\"").append(entry.getKey()).append("\":");
            Object val = entry.getValue();
            if (val == null) sb.append("null");
            else if (val instanceof String) sb.append("\"").append(val).append("\"");
            else sb.append(val);
        }
        sb.append("}");
        return sb.toString();
    }
}
