package com.projectlibre.api.dto;

/**
 * DTO для ответа на запрос синхронизации задач.
 * Содержит информацию о результате синхронизации.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class TaskSyncResponseDto {
    
    private boolean success;
    private int syncedCount;
    private int skippedCount;
    private String message;
    
    private TaskSyncResponseDto() {}
    
    public static TaskSyncResponseDto success(int syncedCount, int skippedCount) {
        TaskSyncResponseDto dto = new TaskSyncResponseDto();
        dto.success = true;
        dto.syncedCount = syncedCount;
        dto.skippedCount = skippedCount;
        dto.message = String.format("Synced %d tasks, skipped %d", syncedCount, skippedCount);
        return dto;
    }
    
    public static TaskSyncResponseDto error(String message) {
        TaskSyncResponseDto dto = new TaskSyncResponseDto();
        dto.success = false;
        dto.syncedCount = 0;
        dto.skippedCount = 0;
        dto.message = message;
        return dto;
    }
    
    // Getters
    public boolean isSuccess() { return success; }
    public int getSyncedCount() { return syncedCount; }
    public int getSkippedCount() { return skippedCount; }
    public String getMessage() { return message; }
}
