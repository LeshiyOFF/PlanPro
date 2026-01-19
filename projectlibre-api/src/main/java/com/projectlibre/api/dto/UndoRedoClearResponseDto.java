package com.projectlibre.api.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTO for undo/redo clear operation responses.
 * Replaces Map<String, Object> with strongly typed POJO.
 * Follows SOLID: Single Responsibility Principle.
 */
public class UndoRedoClearResponseDto extends BaseDto {
    
    @NotNull
    private String status;
    
    public UndoRedoClearResponseDto() {
    }
    
    public UndoRedoClearResponseDto(String status) {
        this.status = status;
    }
    
    public static UndoRedoClearResponseDto cleared() {
        return new UndoRedoClearResponseDto("cleared");
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}
