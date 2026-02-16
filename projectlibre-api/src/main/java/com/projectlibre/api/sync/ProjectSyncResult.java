package com.projectlibre.api.sync;

import java.util.Collections;
import java.util.Map;

/**
 * Результат унифицированной синхронизации проекта (ресурсы + задачи).
 * Используется ProjectSyncService и обоими контроллерами (REST и RPC).
 *
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public final class ProjectSyncResult {

    private final boolean success;
    private final int totalSynced;
    private final int totalSkipped;
    private final Map<String, String> resourceIdMapping;
    private final String errorMessage;

    private ProjectSyncResult(boolean success, int totalSynced, int totalSkipped,
                              Map<String, String> resourceIdMapping, String errorMessage) {
        this.success = success;
        this.totalSynced = totalSynced;
        this.totalSkipped = totalSkipped;
        this.resourceIdMapping = resourceIdMapping != null
            ? Collections.unmodifiableMap(resourceIdMapping)
            : Collections.emptyMap();
        this.errorMessage = errorMessage;
    }

    public static ProjectSyncResult success(int totalSynced, int totalSkipped,
                                            Map<String, String> resourceIdMapping) {
        return new ProjectSyncResult(true, totalSynced, totalSkipped, resourceIdMapping, null);
    }

    public static ProjectSyncResult error(String errorMessage) {
        return new ProjectSyncResult(false, 0, 0, null, errorMessage);
    }

    public boolean isSuccess() { return success; }
    public int getTotalSynced() { return totalSynced; }
    public int getTotalSkipped() { return totalSkipped; }
    public Map<String, String> getResourceIdMapping() { return resourceIdMapping; }
    public String getErrorMessage() { return errorMessage; }
}
