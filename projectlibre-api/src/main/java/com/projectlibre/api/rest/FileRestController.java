package com.projectlibre.api.rest;

import com.projectlibre.api.dto.*;
import com.projectlibre.api.service.NativeStorageService;
import com.projectlibre.api.service.ProjectService;
import com.projectlibre.api.service.LoadResult;
import com.projectlibre.api.service.SaveResult;
import com.projectlibre.api.storage.CoreProjectBridge;
import com.projectlibre.api.adapter.CoreProjectFactory;
import com.projectlibre.api.session.GlobalSessionManager;
import com.projectlibre.api.concurrent.CoreAccessGuard;
import com.projectlibre.api.converter.CoreToApiConverter;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.session.Session;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for native .pod file operations.
 * Uses GlobalSessionManager for thread-safe Core integration.
 * CoreAccessGuard protects from race conditions in concurrent requests.
 * 
 * @version 4.0.0
 */
@RestController
@RequestMapping("/api/files")
public class FileRestController {
    
    private final NativeStorageService storageService;
    private final GlobalSessionManager sessionManager;
    private final CoreAccessGuard coreAccessGuard;
    private final CoreProjectBridge projectBridge;
    private final ProjectService projectService;
    private final CoreProjectFactory coreFactory;
    private final CoreToApiConverter converter;
    
    @Autowired
    public FileRestController(GlobalSessionManager sessionManager, 
                              CoreAccessGuard coreAccessGuard) {
        this.sessionManager = sessionManager;
        this.coreAccessGuard = coreAccessGuard;
        this.projectBridge = CoreProjectBridge.getInstance();
        this.projectService = new ProjectService();
        this.coreFactory = CoreProjectFactory.getInstance();
        this.converter = new CoreToApiConverter();
        
        Session session = sessionManager.getSession();
        this.storageService = new NativeStorageService(session);
    }
    
    @PostMapping("/save")
    public ResponseEntity<ApiResponseDto<FileSaveResponseDto>> saveProject(
            @Valid @RequestBody FileSaveRequestDto request) {
        try {
            logSaveRequest(request);
            Project project = getOrCreateCoreProject(request.getProjectId());
            if (project == null) {
                return ResponseEntity.badRequest().body(ApiResponseDto.error("Project not found"));
            }
            
            String filePath = determineFilePath(request, project);
            SaveResult result = coreAccessGuard.executeWithLock(() -> 
                storageService.saveProject(project, filePath, request.isCreateBackup())
            );
            
            if (result.isSuccess()) {
                FileSaveResponseDto data = FileSaveResponseDto.success(
                    request.getProjectId(), result.getFilePath(), result.getBackupPath());
                return ResponseEntity.ok(ApiResponseDto.success("Saved", data));
            }
            return ResponseEntity.badRequest().body(ApiResponseDto.error(result.getError()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponseDto.error(e.getMessage()));
        }
    }
    
    @PostMapping("/load")
    public ResponseEntity<ApiResponseDto<FileLoadResponseDto>> loadProject(
            @Valid @RequestBody FileLoadRequestDto request) {
        try {
            System.out.println("[FileRestController] Load: " + request.getFilePath());
            logBridgeState("BEFORE");
            
            LoadResult result = coreAccessGuard.executeWithLock(() -> 
                storageService.loadProject(request.getFilePath())
            );
            
            if (result.isSuccess()) {
                Project project = result.getProject();
                if (project != null) {
                    projectBridge.registerProject(project);
                    logBridgeState("AFTER");
                }
                FileLoadResponseDto data = FileLoadResponseDto.success(
                    result.getFilePath(),
                    project != null ? project.getName() : "Unknown",
                    project != null ? project.getUniqueId() : null);
                return ResponseEntity.ok(ApiResponseDto.success("Loaded", data));
            }
            return ResponseEntity.badRequest().body(ApiResponseDto.error(result.getError()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponseDto.error(e.getMessage()));
        }
    }
    
    @GetMapping("/list")
    public ResponseEntity<ApiResponseDto<FileListResponseDto>> listProjects(
            @RequestParam(required = false) String directory) {
        try {
            List<String> files = (directory != null && !directory.isEmpty())
                ? storageService.listProjects(directory)
                : storageService.listProjects();
            FileListResponseDto data = FileListResponseDto.success(files, storageService.getBasePath());
            return ResponseEntity.ok(ApiResponseDto.success("Listed", data));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponseDto.error(e.getMessage()));
        }
    }
    
    /**
     * Получает полные данные проекта (tasks + resources) из Core модели.
     * Этот endpoint является МОСТОМ между Core ProjectLibre и Frontend.
     * 
     * @param projectId ID проекта в CoreProjectBridge
     * @return ProjectDataDto с tasks и resources в формате frontend
     */
    @GetMapping("/project/{projectId}/data")
    public ResponseEntity<ApiResponseDto<ProjectDataDto>> getProjectData(
            @PathVariable Long projectId) {
        try {
            System.out.println("[FileRestController] GetProjectData: projectId=" + projectId);
            logBridgeState("GET_DATA");
            
            // Ищем проект в CoreProjectBridge
            Project coreProject = projectBridge.findById(projectId).orElse(null);
            
            if (coreProject == null) {
                System.out.println("[FileRestController] ❌ Project not found in bridge: " + projectId);
                return ResponseEntity.notFound().build();
            }
            
            System.out.println("[FileRestController] ✅ Found project: " + coreProject.getName());
            
            // Конвертируем Core модель в DTO для frontend
            ProjectDataDto data = coreAccessGuard.executeWithLock(() -> 
                converter.convert(coreProject)
            );
            
            System.out.println("[FileRestController] ✅ Converted: " + 
                data.getTaskCount() + " tasks, " + data.getResourceCount() + " resources");
            
            return ResponseEntity.ok(ApiResponseDto.success("Project data retrieved", data));
            
        } catch (Exception e) {
            System.err.println("[FileRestController] ❌ Error getting project data: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(ApiResponseDto.error(e.getMessage()));
        }
    }
    
    private Project getOrCreateCoreProject(Long projectId) {
        Project project = projectBridge.findById(projectId).orElse(null);
        if (project == null) {
            com.projectlibre.api.model.Project apiProject = projectService.getProjectById(projectId);
            if (apiProject != null) {
                Session session = sessionManager.getSession();
                project = coreAccessGuard.executeWithLock(() -> 
                    coreFactory.createCoreProject(apiProject, session)
                );
                projectBridge.registerProject(project);
            }
        }
        return project;
    }
    
    private String determineFilePath(FileSaveRequestDto request, Project project) {
        if (request.getFilePath() != null && !request.getFilePath().isEmpty()) {
            return request.getFilePath();
        }
        return storageService.buildFilePath(project.getName());
    }
    
    private void logBridgeState(String stage) {
        System.out.println("[FileRestController] [Bridge " + stage + "] Count: " + 
                         projectBridge.getLoadedCount() + ", IDs: " + projectBridge.getAllProjectIds());
    }
    
    private void logSaveRequest(FileSaveRequestDto request) {
        System.out.println("[FileRestController] Save: projectId=" + request.getProjectId());
        logBridgeState("BEFORE");
    }
}
