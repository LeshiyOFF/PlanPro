package com.projectlibre.api.rest;

import com.projectlibre.api.dto.ApiResponseDto;
import com.projectlibre.api.dto.ProjectSyncRequestDto;
import com.projectlibre.api.dto.TaskSyncResponseDto;
import com.projectlibre.api.storage.CoreProjectBridge;
import com.projectlibre.api.concurrent.CoreAccessGuard;
import com.projectlibre.api.sync.ApiToCoreResourceSynchronizer;
import com.projectlibre.api.sync.ApiToCoreTaskSynchronizer;
import com.projectlibre.api.sync.ProjectCalendarSyncService;
import com.projectlibre.api.sync.SyncResult;
import com.projectlibre1.pm.task.Project;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Unified REST controller для синхронизации проектных данных.
 * 
 * Clean Architecture: Interface Adapter (Interface Adapters Layer).
 * SOLID: Single Responsibility - HTTP endpoints для sync операций.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/files")
public class ProjectSyncRestController {
    
    private static final Logger log = LoggerFactory.getLogger(ProjectSyncRestController.class);
    
    private final CoreAccessGuard coreAccessGuard;
    private final CoreProjectBridge projectBridge;
    private final ApiToCoreTaskSynchronizer taskSynchronizer;
    private final ApiToCoreResourceSynchronizer resourceSynchronizer;
    private final ProjectCalendarSyncService projectCalendarSyncService;

    @Autowired
    public ProjectSyncRestController(CoreAccessGuard coreAccessGuard) {
        this.coreAccessGuard = coreAccessGuard;
        this.projectBridge = CoreProjectBridge.getInstance();
        this.taskSynchronizer = new ApiToCoreTaskSynchronizer();
        this.resourceSynchronizer = new ApiToCoreResourceSynchronizer();
        this.projectCalendarSyncService = new ProjectCalendarSyncService();
    }
    
    @PostMapping("/sync-project")
    public ResponseEntity<ApiResponseDto<TaskSyncResponseDto>> syncProject(
            @Valid @RequestBody ProjectSyncRequestDto request) {
        try {
            log.info("[ProjectSync] Sync request: projectId={}, tasks={}, resources={}",
                request.getProjectId(), request.getTaskCount(), request.getResourceCount());
            
            Project project = projectBridge.findById(request.getProjectId()).orElse(null);
            if (project == null) {
                log.error("[ProjectSync] ❌ Project not found: {}", request.getProjectId());
                return ResponseEntity.badRequest()
                    .body(ApiResponseDto.error("Project not found: " + request.getProjectId()));
            }
            
            int totalSynced = 0;
            int totalSkipped = 0;
            
            SyncResult taskResult = coreAccessGuard.executeWithLock(() -> 
                taskSynchronizer.synchronize(project, createTaskSyncRequest(request))
            );
            
            if (!taskResult.isSuccess()) {
                log.error("[ProjectSync] ❌ Task sync failed: {}", taskResult.getError());
                return ResponseEntity.badRequest()
                    .body(ApiResponseDto.error("Sync failed: " + taskResult.getError()));
            }
            
            totalSynced += taskResult.getSyncedCount();
            totalSkipped += taskResult.getSkippedCount();
            
            if (request.getResources() != null && !request.getResources().isEmpty()) {
                SyncResult resourceResult = coreAccessGuard.executeWithLock(() -> 
                    resourceSynchronizer.synchronize(project, request.getResources())
                );
                
                if (!resourceResult.isSuccess()) {
                    log.warn("[ProjectSync] ⚠️ Resource sync failed: {}", resourceResult.getError());
                    if (resourceResult.getErrorCode() != null) {
                        return ResponseEntity.badRequest()
                            .body(ApiResponseDto.error(resourceResult.getErrorMessage()));
                    }
                }
                
                totalSynced += resourceResult.getSyncedCount();
                totalSkipped += resourceResult.getSkippedCount();
            }

            if (request.getProjectCalendars() != null) {
                coreAccessGuard.executeWithLock(() ->
                    projectCalendarSyncService.applyProjectCalendars(project, request.getProjectCalendars()));
            }

            TaskSyncResponseDto data = TaskSyncResponseDto.success(totalSynced, totalSkipped);
            log.info("[ProjectSync] ✅ Sync completed: synced={}, skipped={}", totalSynced, totalSkipped);
            return ResponseEntity.ok(ApiResponseDto.success("Project synced", data));
            
        } catch (Throwable t) {
            log.error("[ProjectSync] ❌ CRITICAL SYNC ERROR");
            log.error("[ProjectSync] Error type: {}", t.getClass().getName());
            log.error("[ProjectSync] Error message: {}", t.getMessage());
            
            if (t instanceof StackOverflowError) {
                log.error("[ProjectSync] StackOverflowError detected - circular calendar dependency");
            } else {
                log.error("[ProjectSync] Full stack trace:", t);
            }
            
            if (t.getCause() != null) {
                log.error("[ProjectSync] Caused by: {}", t.getCause().getMessage(), t.getCause());
            }
            
            return ResponseEntity.internalServerError()
                .body(ApiResponseDto.error("Internal server error: " + t.getClass().getSimpleName() 
                    + ": " + t.getMessage()));
        }
    }
    
    private com.projectlibre.api.dto.TaskSyncRequestDto createTaskSyncRequest(ProjectSyncRequestDto request) {
        com.projectlibre.api.dto.TaskSyncRequestDto taskRequest = new com.projectlibre.api.dto.TaskSyncRequestDto();
        taskRequest.setProjectId(request.getProjectId());
        taskRequest.setTasks(request.getTasks());
        return taskRequest;
    }
}
