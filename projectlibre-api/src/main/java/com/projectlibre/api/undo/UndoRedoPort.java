package com.projectlibre.api.undo;

import com.projectlibre.api.dto.UndoRedoStateDto;

/**
 * Port for Undo/Redo operations
 * Follows Hexagonal Architecture (Ports & Adapters)
 * Bridges React store (Zustand) with Java Core UndoController
 */
public interface UndoRedoPort {
    
    /**
     * Execute undo operation
     * @return true if undo was executed
     */
    boolean undo();
    
    /**
     * Execute redo operation
     * @return true if redo was executed
     */
    boolean redo();
    
    /**
     * Check if undo is available
     * @return true if can undo
     */
    boolean canUndo();
    
    /**
     * Check if redo is available
     * @return true if can redo
     */
    boolean canRedo();
    
    /**
     * Get current undo/redo state
     * @return state DTO with all info
     */
    UndoRedoStateDto getState();
    
    /**
     * Clear all undo/redo history
     */
    void clearHistory();
    
    /**
     * Begin transaction for grouping edits
     */
    void beginTransaction();
    
    /**
     * End transaction for grouping edits
     */
    void endTransaction();
}
