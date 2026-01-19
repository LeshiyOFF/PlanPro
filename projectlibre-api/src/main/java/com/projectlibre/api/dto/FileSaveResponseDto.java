package com.projectlibre.api.dto;

/**
 * DTO for file save responses.
 * Single Responsibility: Transfer file save results.
 */
public class FileSaveResponseDto {
    
    private boolean success;
    private String filePath;
    private String backupPath;
    private String error;
    private String format;
    private Long projectId;
    
    public FileSaveResponseDto() {
    }
    
    public static FileSaveResponseDto success(Long projectId, String filePath, String backupPath) {
        FileSaveResponseDto dto = new FileSaveResponseDto();
        dto.setSuccess(true);
        dto.setProjectId(projectId);
        dto.setFilePath(filePath);
        dto.setBackupPath(backupPath);
        dto.setFormat("pod");
        return dto;
    }
    
    public static FileSaveResponseDto failure(String error) {
        FileSaveResponseDto dto = new FileSaveResponseDto();
        dto.setSuccess(false);
        dto.setError(error);
        return dto;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public String getBackupPath() {
        return backupPath;
    }
    
    public void setBackupPath(String backupPath) {
        this.backupPath = backupPath;
    }
    
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
    
    public String getFormat() {
        return format;
    }
    
    public void setFormat(String format) {
        this.format = format;
    }
    
    public Long getProjectId() {
        return projectId;
    }
    
    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }
}
