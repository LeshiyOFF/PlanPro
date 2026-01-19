package com.projectlibre.api.rest;

import com.projectlibre.api.dto.RpcCommandRequestDto;
import com.projectlibre.api.dto.RpcCommandResponseDto;
import com.projectlibre.api.dto.UndoRedoStateDto;
import com.projectlibre.api.dto.UndoRedoClearResponseDto;
import com.projectlibre.api.service.ProjectService;
import com.projectlibre.api.service.TaskService;
import com.projectlibre.api.service.ResourceService;
import com.projectlibre.api.service.PreferenceService;
import com.projectlibre.api.undo.CoreUndoRedoAdapter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

/**
 * RPC-style controller for compatibility with Electron bridge.
 * Maps legacy command requests to modern services.
 * Follows SRP by delegating to specialized services.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class RpcRestController {
    
    private final ProjectService projectService;
    private final TaskService taskService;
    private final ResourceService resourceService;
    private final PreferenceService preferenceService;
    private final CoreUndoRedoAdapter undoRedoAdapter;
    
    public RpcRestController(ProjectService projectService, TaskService taskService,
                           ResourceService resourceService, PreferenceService preferenceService) {
        this.projectService = projectService;
        this.taskService = taskService;
        this.resourceService = resourceService;
        this.preferenceService = preferenceService;
        this.undoRedoAdapter = CoreUndoRedoAdapter.getInstance();
    }
    
    @PostMapping("/{command}")
    public ResponseEntity<RpcCommandResponseDto> handleRpcCommand(
            @PathVariable String command,
            @Valid @RequestBody(required = false) RpcCommandRequestDto request) {
        
        Object[] args = request != null && request.getArgs() != null
                ? request.getArgs().toArray()
                : new Object[0];
        
        try {
            Object result = dispatchCommand(command, args);
            return ResponseEntity.ok(RpcCommandResponseDto.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(RpcCommandResponseDto.error(e.getMessage()));
        }
    }
    
    private Object dispatchCommand(String command, Object[] args) {
        switch (command) {
            case "project.list": return projectService.getAllProjects();
            case "project.get": return projectService.getProjectById(asLong(args[0]));
            case "project.delete": return projectService.deleteProject(asLong(args[0]));
            case "task.list": return taskService.getAllTasks();
            case "resource.list": return resourceService.getAllResources();
            case "undo.perform": return performUndo(args);
            case "undo.redo": return performRedo(args);
            case "undo.getState": return getUndoState(args);
            case "undo.clear": return clearUndo(args);
            case "config.ping": {
                Map<String, String> pingResponse = new HashMap<>();
                pingResponse.put("status", "pong");
                return pingResponse;
            }
            default: throw new IllegalArgumentException("Unknown command: " + command);
        }
    }
    
    private Long asLong(Object val) {
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).longValue();
        return Long.parseLong(val.toString());
    }
    
    private Object performUndo(Object[] args) {
        if (args.length > 0 && args[0] != null) undoRedoAdapter.setActiveProject(asLong(args[0]));
        undoRedoAdapter.undo();
        return getUndoState(args);
    }
    
    private Object performRedo(Object[] args) {
        if (args.length > 0 && args[0] != null) undoRedoAdapter.setActiveProject(asLong(args[0]));
        undoRedoAdapter.redo();
        return getUndoState(args);
    }
    
    private Object getUndoState(Object[] args) {
        if (args.length > 0 && args[0] != null) {
            undoRedoAdapter.setActiveProject(asLong(args[0]));
        }
        UndoRedoStateDto state = new UndoRedoStateDto();
        state.setCanUndo(undoRedoAdapter.canUndo());
        state.setCanRedo(undoRedoAdapter.canRedo());
        return state;
    }
    
    private Object clearUndo(Object[] args) {
        if (args.length > 0 && args[0] != null) {
            undoRedoAdapter.setActiveProject(asLong(args[0]));
        }
        undoRedoAdapter.clearHistory();
        return UndoRedoClearResponseDto.cleared();
    }
}
