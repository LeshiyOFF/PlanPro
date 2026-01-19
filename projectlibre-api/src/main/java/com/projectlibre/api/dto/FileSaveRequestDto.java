package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for file save requests.
 * Synchronized with TypeScript ProjectSaveRequest interface.
 * Single Responsibility: Transfer file save parameters.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class FileSaveRequestDto {
    
    @NotNull(message = "Project ID is required")
    private Long projectId;
    
    private String filePath;
    private String format;
    private boolean createBackup;
    
    public FileSaveRequestDto() {
        this.createBackup = true;
    }
    
    public Long getProjectId() {
        return projectId;
    }
    
    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public String getFormat() {
        return format;
    }
    
    public void setFormat(String format) {
        this.format = format;
    }
    
    public boolean isCreateBackup() {
        return createBackup;
    }
    
    public void setCreateBackup(boolean createBackup) {
        this.createBackup = createBackup;
    }
}
