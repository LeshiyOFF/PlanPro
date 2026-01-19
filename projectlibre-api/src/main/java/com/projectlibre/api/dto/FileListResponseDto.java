package com.projectlibre.api.dto;

import java.util.List;

/**
 * DTO for file list responses.
 * Single Responsibility: Transfer list of project files.
 */
public class FileListResponseDto {
    
    private boolean success;
    private List<String> files;
    private String basePath;
    private int count;
    private String error;
    
    public FileListResponseDto() {
    }
    
    public static FileListResponseDto success(List<String> files, String basePath) {
        FileListResponseDto dto = new FileListResponseDto();
        dto.setSuccess(true);
        dto.setFiles(files);
        dto.setBasePath(basePath);
        dto.setCount(files != null ? files.size() : 0);
        return dto;
    }
    
    public static FileListResponseDto failure(String error) {
        FileListResponseDto dto = new FileListResponseDto();
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
    
    public List<String> getFiles() {
        return files;
    }
    
    public void setFiles(List<String> files) {
        this.files = files;
    }
    
    public String getBasePath() {
        return basePath;
    }
    
    public void setBasePath(String basePath) {
        this.basePath = basePath;
    }
    
    public int getCount() {
        return count;
    }
    
    public void setCount(int count) {
        this.count = count;
    }
    
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
}
