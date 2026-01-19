package com.projectlibre.api.service;

/**
 * Result class for save operations.
 */
public final class SaveResult {
    
    private final boolean success;
    private final String filePath;
    private final String backupPath;
    private final String error;
    
    private SaveResult(boolean success, String filePath, String backupPath, String error) {
        this.success = success;
        this.filePath = filePath;
        this.backupPath = backupPath;
        this.error = error;
    }
    
    public static SaveResult success(String filePath) {
        return new SaveResult(true, filePath, null, null);
    }
    
    public static SaveResult success(String filePath, String backupPath) {
        return new SaveResult(true, filePath, backupPath, null);
    }
    
    public static SaveResult error(String error) {
        return new SaveResult(false, null, null, error);
    }
    
    public boolean isSuccess() { return success; }
    public String getFilePath() { return filePath; }
    public String getBackupPath() { return backupPath; }
    public String getError() { return error; }
}
