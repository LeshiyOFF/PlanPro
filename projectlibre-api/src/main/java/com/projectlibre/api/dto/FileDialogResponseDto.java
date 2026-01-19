package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO для ответа выбора файла через диалог
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class FileDialogResponseDto {
    private String selectedPath;
    private boolean cancelled;
    private String errorMessage;
    
    public FileDialogResponseDto() {
    }
    
    public FileDialogResponseDto(String selectedPath) {
        this.selectedPath = selectedPath;
        this.cancelled = false;
    }
    
    public static FileDialogResponseDto cancelled() {
        FileDialogResponseDto response = new FileDialogResponseDto();
        response.setCancelled(true);
        return response;
    }
    
    public static FileDialogResponseDto error(String errorMessage) {
        FileDialogResponseDto response = new FileDialogResponseDto();
        response.setErrorMessage(errorMessage);
        return response;
    }
    
    public String getSelectedPath() {
        return selectedPath;
    }
    
    public void setSelectedPath(String selectedPath) {
        this.selectedPath = selectedPath;
    }
    
    public boolean isCancelled() {
        return cancelled;
    }
    
    public void setCancelled(boolean cancelled) {
        this.cancelled = cancelled;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
