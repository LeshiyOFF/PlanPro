package com.projectlibre.api.dto;

import java.util.Collections;
import java.util.Map;

/**
 * DTO для ответа на запрос синхронизации задач.
 * Содержит результат синхронизации и маппинг временных ID ресурсов → Core ID.
 *
 * @author ProjectLibre Team
 * @version 1.1.0
 */
public class TaskSyncResponseDto {

    private boolean success;
    private int syncedCount;
    private int skippedCount;
    private String message;
    private Map<String, String> resourceIdMapping;

    private TaskSyncResponseDto() {}

    public static TaskSyncResponseDto success(int syncedCount, int skippedCount) {
        return success(syncedCount, skippedCount, null);
    }

    /**
     * Успешный ответ с маппингом ID ресурсов (временный → постоянный Core ID).
     */
    public static TaskSyncResponseDto success(int syncedCount, int skippedCount,
                                             Map<String, String> resourceIdMapping) {
        TaskSyncResponseDto dto = new TaskSyncResponseDto();
        dto.success = true;
        dto.syncedCount = syncedCount;
        dto.skippedCount = skippedCount;
        dto.message = String.format("Synced %d tasks, skipped %d", syncedCount, skippedCount);
        dto.resourceIdMapping = resourceIdMapping != null
            ? Collections.unmodifiableMap(resourceIdMapping)
            : Collections.emptyMap();
        return dto;
    }

    public static TaskSyncResponseDto error(String message) {
        TaskSyncResponseDto dto = new TaskSyncResponseDto();
        dto.success = false;
        dto.syncedCount = 0;
        dto.skippedCount = 0;
        dto.message = message;
        dto.resourceIdMapping = Collections.emptyMap();
        return dto;
    }

    public boolean isSuccess() { return success; }
    public int getSyncedCount() { return syncedCount; }
    public int getSkippedCount() { return skippedCount; }
    public String getMessage() { return message; }
    public Map<String, String> getResourceIdMapping() { return resourceIdMapping; }
}
