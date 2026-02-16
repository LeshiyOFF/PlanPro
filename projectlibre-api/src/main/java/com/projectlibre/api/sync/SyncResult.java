package com.projectlibre.api.sync;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Результат синхронизации ресурсов.
 * 
 * V2.0: Добавлена поддержка ID mapping для синхронизации Frontend ID → Core ID.
 * 
 * SOLID: Single Responsibility - только хранение результата операции.
 * Immutable Value Object.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
public class SyncResult {
    
    private final boolean success;
    private final int syncedCount;
    private final int skippedCount;
    private final String errorMessage;
    private final String errorCode;
    
    /** Маппинг Frontend ID → Core ID для новых ресурсов. */
    private final Map<String, String> resourceIdMapping;
    
    private SyncResult(boolean success, int syncedCount, int skippedCount, 
                       String errorMessage, String errorCode, Map<String, String> idMapping) {
        this.success = success;
        this.syncedCount = syncedCount;
        this.skippedCount = skippedCount;
        this.errorMessage = errorMessage;
        this.errorCode = errorCode;
        this.resourceIdMapping = idMapping != null 
            ? Collections.unmodifiableMap(new HashMap<>(idMapping)) 
            : Collections.emptyMap();
    }
    
    public static SyncResult success(int syncedCount, int skippedCount) {
        return new SyncResult(true, syncedCount, skippedCount, null, null, null);
    }
    
    /**
     * Создаёт успешный результат с маппингом ID ресурсов.
     * 
     * @param syncedCount количество синхронизированных ресурсов
     * @param skippedCount количество пропущенных ресурсов
     * @param idMapping маппинг Frontend ID → Core ID
     */
    public static SyncResult successWithIdMapping(int syncedCount, int skippedCount, 
                                                   Map<String, String> idMapping) {
        return new SyncResult(true, syncedCount, skippedCount, null, null, idMapping);
    }
    
    public static SyncResult error(String errorMessage) {
        return new SyncResult(false, 0, 0, errorMessage, null, null);
    }

    public static SyncResult error(String errorMessage, String errorCode) {
        return new SyncResult(false, 0, 0, errorMessage, errorCode, null);
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
    
    /**
     * Возвращает маппинг Frontend ID → Core ID.
     * Пустой map если маппинг отсутствует.
     */
    public Map<String, String> getResourceIdMapping() {
        return resourceIdMapping;
    }
    
    /**
     * Проверяет, есть ли маппинг ID.
     */
    public boolean hasIdMapping() {
        return resourceIdMapping != null && !resourceIdMapping.isEmpty();
    }
}
