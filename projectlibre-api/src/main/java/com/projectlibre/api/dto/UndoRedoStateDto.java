package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

/**
 * DTO for Undo/Redo state information
 * Used for synchronization between React store and Java Core
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class UndoRedoStateDto {
    
    private boolean canUndo;
    private boolean canRedo;
    private String undoName;
    private String redoName;
    private List<String> editHistory;
    private int historySize;
    
    public UndoRedoStateDto() {}
    
    public UndoRedoStateDto(boolean canUndo, boolean canRedo, String undoName, String redoName) {
        this.canUndo = canUndo;
        this.canRedo = canRedo;
        this.undoName = undoName;
        this.redoName = redoName;
    }

    public boolean isCanUndo() { return canUndo; }
    public void setCanUndo(boolean canUndo) { this.canUndo = canUndo; }

    public boolean isCanRedo() { return canRedo; }
    public void setCanRedo(boolean canRedo) { this.canRedo = canRedo; }

    public String getUndoName() { return undoName; }
    public void setUndoName(String undoName) { this.undoName = undoName; }

    public String getRedoName() { return redoName; }
    public void setRedoName(String redoName) { this.redoName = redoName; }

    public List<String> getEditHistory() { return editHistory; }
    public void setEditHistory(List<String> editHistory) { this.editHistory = editHistory; }

    public int getHistorySize() { return historySize; }
    public void setHistorySize(int historySize) { this.historySize = historySize; }
}
