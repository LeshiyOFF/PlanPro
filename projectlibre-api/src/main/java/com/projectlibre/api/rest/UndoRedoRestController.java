package com.projectlibre.api.rest;

import com.projectlibre.api.dto.ApiResponseDto;
import com.projectlibre.api.dto.UndoRedoOperationResponseDto;
import com.projectlibre.api.dto.UndoRedoStateDto;
import com.projectlibre.api.dto.UndoRedoClearResponseDto;
import com.projectlibre.api.undo.CoreUndoRedoAdapter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Modern Spring Boot REST controller for undo/redo operations
 * Replaces HttpServer-based UndoRedoController
 * Provides injection protection and strongly typed DTOs
 */
@RestController
@RequestMapping("/api/undo")
@CrossOrigin(origins = "*")
public class UndoRedoRestController {
    
    private final CoreUndoRedoAdapter undoRedoAdapter;
    
    public UndoRedoRestController() {
        this.undoRedoAdapter = CoreUndoRedoAdapter.getInstance();
    }
    
    @PostMapping
    public ResponseEntity<ApiResponseDto<UndoRedoOperationResponseDto>> undo(
            @RequestParam(required = false) Long projectId) {
        try {
            if (projectId != null) {
                undoRedoAdapter.setActiveProject(projectId);
            }
            boolean success = undoRedoAdapter.undo();
            UndoRedoOperationResponseDto data = new UndoRedoOperationResponseDto(
                success,
                undoRedoAdapter.canUndo(),
                undoRedoAdapter.canRedo()
            );
            return ResponseEntity.ok(ApiResponseDto.success("Undo performed", data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error("Undo failed: " + e.getMessage()));
        }
    }
    
    @PostMapping("/redo")
    public ResponseEntity<ApiResponseDto<UndoRedoOperationResponseDto>> redo(
            @RequestParam(required = false) Long projectId) {
        try {
            if (projectId != null) {
                undoRedoAdapter.setActiveProject(projectId);
            }
            boolean success = undoRedoAdapter.redo();
            UndoRedoOperationResponseDto data = new UndoRedoOperationResponseDto(
                success,
                undoRedoAdapter.canUndo(),
                undoRedoAdapter.canRedo()
            );
            return ResponseEntity.ok(ApiResponseDto.success("Redo performed", data));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error("Redo failed: " + e.getMessage()));
        }
    }
    
    @GetMapping("/state")
    public ResponseEntity<ApiResponseDto<UndoRedoStateDto>> getState(
            @RequestParam(required = false) Long projectId) {
        try {
            if (projectId != null) {
                undoRedoAdapter.setActiveProject(projectId);
            }
            UndoRedoStateDto state = new UndoRedoStateDto();
            state.setCanUndo(undoRedoAdapter.canUndo());
            state.setCanRedo(undoRedoAdapter.canRedo());
            return ResponseEntity.ok(ApiResponseDto.success("Undo/Redo state retrieved", state));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error("Failed to get Undo/Redo state: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponseDto<UndoRedoClearResponseDto>> clear(
            @RequestParam(required = false) Long projectId) {
        try {
            if (projectId != null) {
                undoRedoAdapter.setActiveProject(projectId);
            }
            undoRedoAdapter.clearHistory();
            return ResponseEntity.ok(ApiResponseDto.success("History cleared", UndoRedoClearResponseDto.cleared()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error("Failed to clear history: " + e.getMessage()));
        }
    }
}
