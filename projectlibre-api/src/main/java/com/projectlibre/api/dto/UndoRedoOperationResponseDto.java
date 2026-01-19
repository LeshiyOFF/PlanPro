package com.projectlibre.api.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTO for undo/redo operation responses.
 * Replaces Map<String, Object> with strongly typed POJO.
 * Follows SOLID: Single Responsibility Principle.
 */
public class UndoRedoOperationResponseDto extends BaseDto {
    
    @NotNull
    private Boolean success;
    
    @NotNull
    private Boolean canUndo;
    
    @NotNull
    private Boolean canRedo;
    
    public UndoRedoOperationResponseDto() {
    }
    
    public UndoRedoOperationResponseDto(Boolean success, Boolean canUndo, Boolean canRedo) {
        this.success = success;
        this.canUndo = canUndo;
        this.canRedo = canRedo;
    }
    
    public Boolean getSuccess() {
        return success;
    }
    
    public void setSuccess(Boolean success) {
        this.success = success;
    }
    
    public Boolean getCanUndo() {
        return canUndo;
    }
    
    public void setCanUndo(Boolean canUndo) {
        this.canUndo = canUndo;
    }
    
    public Boolean getCanRedo() {
        return canRedo;
    }
    
    public void setCanRedo(Boolean canRedo) {
        this.canRedo = canRedo;
    }
}
