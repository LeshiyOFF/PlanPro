package com.projectlibre.api.sync;

/**
 * Результат синхронизации ресурсов.
 * 
 * SOLID: Single Responsibility - только хранение результата операции.
 * Immutable Value Object.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class SyncResult {
    
    private final boolean success;
    private final int syncedCount;
    private final int skippedCount;
    private final String errorMessage;
    private final String errorCode;
    
    private SyncResult(boolean success, int syncedCount, int skippedCount, String errorMessage, String errorCode) {
        this.success = success;
        this.syncedCount = syncedCount;
        this.skippedCount = skippedCount;
        this.errorMessage = errorMessage;
        this.errorCode = errorCode;
    }
    
    public static SyncResult success(int syncedCount, int skippedCount) {
        return new SyncResult(true, syncedCount, skippedCount, null, null);
    }
    
    public static SyncResult error(String errorMessage) {
        return new SyncResult(false, 0, 0, errorMessage, null);
    }

    public static SyncResult error(String errorMessage, String errorCode) {
        return new SyncResult(false, 0, 0, errorMessage, errorCode);
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public int getSyncedCount() {
        return syncedCount;
    }
    
    public int getSkippedCount() {
        return skippedCount;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }

    public String getErrorCode() {
        return errorCode;
    }
    
    /**
     * Алиас для getErrorMessage() для обратной совместимости.
     */
    public String getError() {
        return errorMessage;
    }
}
