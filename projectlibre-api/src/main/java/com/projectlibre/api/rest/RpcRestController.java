package com.projectlibre.api.rest;

import com.projectlibre.api.dto.RpcCommandRequestDto;
import com.projectlibre.api.dto.RpcCommandResponseDto;
import com.projectlibre.api.dto.UndoRedoStateDto;
import com.projectlibre.api.dto.UndoRedoClearResponseDto;
import com.projectlibre.api.dto.TaskSyncRequestDto;
import com.projectlibre.api.dto.TaskSyncRequestDto.FrontendTaskDto;
import com.projectlibre.api.service.ProjectService;
import com.projectlibre.api.service.TaskService;
import com.projectlibre.api.service.ResourceService;
import com.projectlibre.api.service.PreferenceService;
import com.projectlibre.api.undo.CoreUndoRedoAdapter;
import com.projectlibre.api.concurrent.CoreAccessGuard;
import com.projectlibre.api.storage.CoreProjectBridge;
import com.projectlibre.api.sync.ApiToCoreTaskSynchronizer;
import com.projectlibre.api.sync.ApiToCoreResourceSynchronizer;
import com.projectlibre.api.sync.SyncResult;
import com.projectlibre.api.converter.CoreToApiConverter;
import com.projectlibre.api.service.CriticalPathRecalculationService;
import com.projectlibre1.pm.task.Project;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.ArrayList;
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
    private final CoreAccessGuard coreAccessGuard;
    private final CoreProjectBridge projectBridge;
    private final ApiToCoreTaskSynchronizer synchronizer;
    private final CoreToApiConverter coreConverter;
    private final ObjectMapper objectMapper;
    private final CriticalPathRecalculationService criticalPathRecalculationService;

    public RpcRestController(ProjectService projectService, TaskService taskService,
                             ResourceService resourceService, PreferenceService preferenceService,
                             CoreAccessGuard coreAccessGuard,
                             CriticalPathRecalculationService criticalPathRecalculationService) {
        this.projectService = projectService;
        this.taskService = taskService;
        this.resourceService = resourceService;
        this.preferenceService = preferenceService;
        this.coreAccessGuard = coreAccessGuard;
        this.criticalPathRecalculationService = criticalPathRecalculationService;
        this.undoRedoAdapter = CoreUndoRedoAdapter.getInstance();
        this.projectBridge = CoreProjectBridge.getInstance();
        this.synchronizer = new ApiToCoreTaskSynchronizer();
        this.coreConverter = new CoreToApiConverter();
        this.objectMapper = new ObjectMapper();
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
            case "project.update": return syncProject(args);
            case "project.recalculate": return criticalPathRecalculationService.recalculate(asLong(args[0]));
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
    private Object syncProject(Object[] args) {
        Long projectId = asLong(args[0]);
        Map<String, Object> updates = (Map<String, Object>) args[1];
        
        Project project = projectBridge.findById(projectId).orElseThrow(() -> 
            new IllegalArgumentException("Project not found: " + projectId));
            
        com.projectlibre.api.dto.ProjectSyncRequestDto syncRequest = new com.projectlibre.api.dto.ProjectSyncRequestDto();
        syncRequest.setProjectId(projectId);
        
        if (updates.containsKey("tasks")) {
            List<Map<String, Object>> tasksRaw = (List<Map<String, Object>>) updates.get("tasks");
            List<FrontendTaskDto> tasks = new ArrayList<>();
            for (Map<String, Object> taskMap : tasksRaw) {
                tasks.add(objectMapper.convertValue(taskMap, FrontendTaskDto.class));
            }
            syncRequest.setTasks(tasks);
        }
        
        if (updates.containsKey("resources")) {
            List<Map<String, Object>> resourcesRaw = (List<Map<String, Object>>) updates.get("resources");
            List<com.projectlibre.api.dto.FrontendResourceDto> resources = new ArrayList<>();
            for (Map<String, Object> resourceMap : resourcesRaw) {
                resources.add(objectMapper.convertValue(resourceMap, com.projectlibre.api.dto.FrontendResourceDto.class));
            }
            syncRequest.setResources(resources);
        }
        
        SyncResult taskResult = coreAccessGuard.executeWithLock(() -> 
            synchronizer.synchronize(project, convertToTaskSyncRequest(syncRequest))
        );
        
        if (!taskResult.isSuccess()) {
            throw new RuntimeException("Sync failed: " + taskResult.getError());
        }
        
        if (syncRequest.getResources() != null && !syncRequest.getResources().isEmpty()) {
            com.projectlibre.api.sync.ApiToCoreResourceSynchronizer resourceSync = 
                new com.projectlibre.api.sync.ApiToCoreResourceSynchronizer();
            SyncResult resourceResult = 
                coreAccessGuard.executeWithLock(() -> 
                    resourceSync.synchronize(project, syncRequest.getResources())
                );
            
            if (!resourceResult.isSuccess()) {
                System.err.println("[RpcController] Resource sync warning: " + resourceResult.getError());
            }
        }
        
        return projectService.getProjectById(projectId);
    }
    
    private TaskSyncRequestDto convertToTaskSyncRequest(com.projectlibre.api.dto.ProjectSyncRequestDto request) {
        TaskSyncRequestDto taskRequest = new TaskSyncRequestDto();
        taskRequest.setProjectId(request.getProjectId());
        taskRequest.setTasks(request.getTasks());
        return taskRequest;
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
