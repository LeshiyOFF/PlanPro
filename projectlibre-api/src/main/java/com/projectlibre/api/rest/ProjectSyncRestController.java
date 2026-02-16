package com.projectlibre.api.rest;

import com.projectlibre.api.dto.ApiResponseDto;
import com.projectlibre.api.dto.ProjectSyncRequestDto;
import com.projectlibre.api.dto.TaskSyncResponseDto;
import com.projectlibre.api.storage.CoreProjectBridge;
import com.projectlibre.api.concurrent.CoreAccessGuard;
import com.projectlibre.api.sync.ProjectCalendarSyncService;
import com.projectlibre.api.sync.ProjectSyncResult;
import com.projectlibre.api.sync.ProjectSyncService;
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
    private final ProjectSyncService projectSyncService;
    private final ProjectCalendarSyncService projectCalendarSyncService;

    @Autowired
    public ProjectSyncRestController(CoreAccessGuard coreAccessGuard) {
        this.coreAccessGuard = coreAccessGuard;
        this.projectBridge = CoreProjectBridge.getInstance();
        this.projectSyncService = new ProjectSyncService();
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

            ProjectSyncResult syncResult = coreAccessGuard.executeWithLock(() ->
                projectSyncService.sync(project, request));
            if (!syncResult.isSuccess()) {
                log.error("[ProjectSync] ❌ Sync failed: {}", syncResult.getErrorMessage());
                return ResponseEntity.badRequest()
                    .body(ApiResponseDto.error(syncResult.getErrorMessage()));
            }

            if (request.getProjectCalendars() != null) {
                coreAccessGuard.executeWithLock(() ->
                    projectCalendarSyncService.applyProjectCalendars(project, request.getProjectCalendars()));
            }

            TaskSyncResponseDto data = TaskSyncResponseDto.success(
                syncResult.getTotalSynced(), syncResult.getTotalSkipped(), syncResult.getResourceIdMapping());
            log.info("[ProjectSync] ✅ Sync completed: synced={}, skipped={}, mappingSize={}",
                syncResult.getTotalSynced(), syncResult.getTotalSkipped(),
                syncResult.getResourceIdMapping() != null ? syncResult.getResourceIdMapping().size() : 0);
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
    
}
