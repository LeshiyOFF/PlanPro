package com.projectlibre.api.rest;

import com.projectlibre.api.dto.ApiResponseDto;
import com.projectlibre.api.dto.TaskSyncRequestDto;
import com.projectlibre.api.dto.TaskSyncResponseDto;
import com.projectlibre.api.storage.CoreProjectBridge;
import com.projectlibre.api.concurrent.CoreAccessGuard;
import com.projectlibre.api.sync.ApiToCoreTaskSynchronizer;
import com.projectlibre.api.sync.ApiToCoreTaskSynchronizer.SyncResult;
import com.projectlibre1.pm.task.Project;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller для синхронизации задач из Frontend в Core Project.
 * Используется перед сохранением .pod файла для переноса данных из Zustand store.
 * 
 * Принцип SRP: отвечает только за синхронизацию задач.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/files")
public class TaskSyncRestController {
    
    private final CoreAccessGuard coreAccessGuard;
    private final CoreProjectBridge projectBridge;
    private final ApiToCoreTaskSynchronizer synchronizer;
    
    @Autowired
    public TaskSyncRestController(CoreAccessGuard coreAccessGuard) {
        this.coreAccessGuard = coreAccessGuard;
        this.projectBridge = CoreProjectBridge.getInstance();
        this.synchronizer = new ApiToCoreTaskSynchronizer();
    }
    
    /**
     * Синхронизирует задачи из Frontend (Zustand store) в Core Project.
     * Должен вызываться перед saveProject() для сохранения данных из UI.
     * 
     * @param request Запрос с projectId и массивом задач
     * @return Результат синхронизации
     */
    @PostMapping("/sync-tasks")
    public ResponseEntity<ApiResponseDto<TaskSyncResponseDto>> syncTasks(
            @Valid @RequestBody TaskSyncRequestDto request) {
        try {
            System.out.println("[TaskSyncController] Sync request: projectId=" + request.getProjectId() +
                             ", tasks=" + request.getTaskCount());
            
            // Находим проект в bridge
            Project project = projectBridge.findById(request.getProjectId()).orElse(null);
            
            if (project == null) {
                System.out.println("[TaskSyncController] ❌ Project not found: " + request.getProjectId());
                return ResponseEntity.badRequest()
                    .body(ApiResponseDto.error("Project not found: " + request.getProjectId()));
            }
            
            // Выполняем синхронизацию с блокировкой
            SyncResult result = coreAccessGuard.executeWithLock(() -> 
                synchronizer.synchronize(project, request)
            );
            
            if (result.isSuccess()) {
                TaskSyncResponseDto data = TaskSyncResponseDto.success(
                    result.getSyncedCount(), 
                    result.getSkippedCount()
                );
                System.out.println("[TaskSyncController] ✅ Sync completed: " + data.getMessage());
                return ResponseEntity.ok(ApiResponseDto.success("Tasks synced", data));
            } else {
                System.err.println("[TaskSyncController] ❌ Sync failed: " + result.getError());
                return ResponseEntity.badRequest()
                    .body(ApiResponseDto.error(result.getError()));
            }
            
        } catch (Exception e) {
            System.err.println("[TaskSyncController] ❌ Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(ApiResponseDto.error(e.getMessage()));
        }
    }
}
