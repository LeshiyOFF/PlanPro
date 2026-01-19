package com.projectlibre.api.dto;

/**
 * DTO for file load responses.
 * Single Responsibility: Transfer file load results.
 */
public class FileLoadResponseDto {
    
    private boolean success;
    private String filePath;
    private String projectName;
    private Long projectId;
    private String error;
    private String format;
    
    public FileLoadResponseDto() {
    }
    
    public static FileLoadResponseDto success(String filePath, String projectName, Long projectId) {
        FileLoadResponseDto dto = new FileLoadResponseDto();
        dto.setSuccess(true);
        dto.setFilePath(filePath);
        dto.setProjectName(projectName);
        dto.setProjectId(projectId);
        dto.setFormat("pod");
        return dto;
    }
    
    public static FileLoadResponseDto failure(String error) {
        FileLoadResponseDto dto = new FileLoadResponseDto();
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
    
    public String getProjectName() {
        return projectName;
    }
    
    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }
    
    public Long getProjectId() {
        return projectId;
    }
    
    public void setProjectId(Long projectId) {
        this.projectId = projectId;
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
}
