package com.projectlibre.api.rest;

import com.projectlibre.api.dto.ApiResponseDto;
import com.projectlibre.api.model.Project;
import com.projectlibre.api.service.ProjectService;
import com.projectlibre.api.storage.CoreProjectBridge;
import com.projectlibre.api.adapter.CoreProjectFactory;
import com.projectlibre.api.session.GlobalSessionManager;
import com.projectlibre.api.concurrent.CoreAccessGuard;
import com.projectlibre1.session.Session;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

/**
 * Modern Spring Boot REST controller for projects.
 * Uses GlobalSessionManager for thread-safe Core integration.
 * CoreAccessGuard protects from race conditions in concurrent requests.
 * 
 * @version 4.0.0
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProjectRestController {
    
    private final ProjectService projectService;
    private final GlobalSessionManager sessionManager;
    private final CoreAccessGuard coreAccessGuard;
    private final CoreProjectBridge projectBridge;
    private final CoreProjectFactory coreFactory;
    
    @Autowired
    public ProjectRestController(ProjectService projectService, 
                                  GlobalSessionManager sessionManager,
                                  CoreAccessGuard coreAccessGuard) {
        this.projectService = projectService;
        this.sessionManager = sessionManager;
        this.coreAccessGuard = coreAccessGuard;
        this.projectBridge = CoreProjectBridge.getInstance();
        this.coreFactory = CoreProjectFactory.getInstance();
    }
    
    @GetMapping("/projects")
    public ResponseEntity<ApiResponseDto<List<Project>>> getAllProjects() {
        try {
            List<Project> projects = projectService.getAllProjects();
            return ResponseEntity.ok(ApiResponseDto.success("Projects retrieved", projects));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error("Failed: " + e.getMessage()));
        }
    }
    
    @PostMapping("/projects")
    public ResponseEntity<ApiResponseDto<Project>> createProject(@Valid @RequestBody Project project) {
        try {
            System.out.println("[ProjectRestController] Creating: " + project.getName());
            logBridgeState("BEFORE");
            
            Project created = projectService.createProject(project);
            
            try {
                Session session = sessionManager.getSession();
                com.projectlibre1.pm.task.Project coreProject = coreAccessGuard.executeWithLock(() -> 
                    coreFactory.createCoreProject(created, session)
                );
                
                if (coreProject != null) {
                    projectBridge.registerProject(coreProject);
                    logBridgeState("AFTER");
                }
            } catch (Exception coreError) {
                System.err.println("[ProjectRestController] ❌ Core failed: " + coreError.getMessage());
            }
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDto.success("Project created", created));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.error("Failed: " + e.getMessage()));
        }
    }
    
    private void logBridgeState(String stage) {
        System.out.println("[ProjectRestController] [Bridge " + stage + "] Count: " + 
                         projectBridge.getLoadedCount() + ", IDs: " + projectBridge.getAllProjectIds());
    }
    
    @PutMapping("/projects/{id}")
    public ResponseEntity<ApiResponseDto<Project>> updateProject(@PathVariable Long id, @Valid @RequestBody Project project) {
        try {
            project.setId(id);
            Project updated = projectService.updateProject(project);
            return ResponseEntity.ok(ApiResponseDto.success("Project updated", updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponseDto.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/projects/{id}")
    public ResponseEntity<ApiResponseDto<Void>> deleteProject(@PathVariable Long id) {
        try {
            projectService.deleteProject(id);
            return ResponseEntity.ok(ApiResponseDto.success("Project deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponseDto.error(e.getMessage()));
        }
    }
}
