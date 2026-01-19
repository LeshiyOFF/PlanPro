package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO для запроса выбора файла через диалог
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class FileDialogRequestDto {
    private boolean save;
    private String selectedFileName;
    private String title;
    private String defaultExtension;
    
    public FileDialogRequestDto() {
    }
    
    public FileDialogRequestDto(boolean save, String selectedFileName) {
        this.save = save;
        this.selectedFileName = selectedFileName;
    }
    
    public boolean isSave() {
        return save;
    }
    
    public void setSave(boolean save) {
        this.save = save;
    }
    
    public String getSelectedFileName() {
        return selectedFileName;
    }
    
    public void setSelectedFileName(String selectedFileName) {
        this.selectedFileName = selectedFileName;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDefaultExtension() {
        return defaultExtension;
    }
    
    public void setDefaultExtension(String defaultExtension) {
        this.defaultExtension = defaultExtension;
    }
}
