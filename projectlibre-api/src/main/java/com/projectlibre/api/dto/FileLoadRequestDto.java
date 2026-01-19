package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for file load requests.
 * Synchronized with TypeScript ProjectOpenRequest interface.
 * Single Responsibility: Transfer file load parameters.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class FileLoadRequestDto {
    
    @NotBlank(message = "File path is required")
    private String filePath;
    
    private boolean readOnly;
    
    public FileLoadRequestDto() {
        this.readOnly = false;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public boolean isReadOnly() {
        return readOnly;
    }
    
    public void setReadOnly(boolean readOnly) {
        this.readOnly = readOnly;
    }
}
