package com.projectlibre.api.sync;

import com.projectlibre.api.dto.ProjectSyncRequestDto;
import com.projectlibre.api.dto.TaskSyncRequestDto;
import com.projectlibre.api.dto.TaskSyncRequestDto.FrontendTaskDto;
import com.projectlibre1.pm.task.Project;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Единая логика синхронизации проекта: ресурсы → подстановка ID → задачи.
 * Используется REST (ProjectSyncRestController) и RPC (RpcRestController) для идентичного результата.
 *
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public final class ProjectSyncService {

    private static final Logger log = LoggerFactory.getLogger(ProjectSyncService.class);

    private final ApiToCoreResourceSynchronizer resourceSynchronizer;
    private final ApiToCoreTaskSynchronizer taskSynchronizer;

    public ProjectSyncService() {
        this.resourceSynchronizer = new ApiToCoreResourceSynchronizer();
        this.taskSynchronizer = new ApiToCoreTaskSynchronizer();
    }

    /**
     * Выполняет синхронизацию: сначала ресурсы (и маппинг ID), затем задачи с подставленными Core ID.
     * Вызывать внутри CoreAccessGuard.executeWithLock().
     *
     * @param project Core Project
     * @param request запрос с задачами и ресурсами
     * @return результат с маппингом и счётчиками
     */
    public ProjectSyncResult sync(Project project, ProjectSyncRequestDto request) {
        if (project == null) {
            return ProjectSyncResult.error("Project is null");
        }
        if (request == null) {
            return ProjectSyncResult.error("Request is null");
        }

        int totalSynced = 0;
        int totalSkipped = 0;
        Map<String, String> resourceIdMapping = null;

        if (request.getResources() != null && !request.getResources().isEmpty()) {
            SyncResult resourceResult = resourceSynchronizer.synchronize(project, request.getResources());
            if (!resourceResult.isSuccess()) {
                log.warn("[ProjectSyncService] Resource sync failed: {}", resourceResult.getError());
                return ProjectSyncResult.error("Resource sync failed: " + resourceResult.getError());
            }
            totalSynced += resourceResult.getSyncedCount();
            totalSkipped += resourceResult.getSkippedCount();
            resourceIdMapping = resourceResult.getResourceIdMapping();
        }

        List<FrontendTaskDto> tasks = request.getTasks() != null ? request.getTasks() : new ArrayList<>();
        List<FrontendTaskDto> tasksToSync = TaskResourceIdSubstitutor.substitute(tasks, resourceIdMapping);
        TaskSyncRequestDto taskRequest = new TaskSyncRequestDto();
        taskRequest.setProjectId(request.getProjectId());
        taskRequest.setTasks(tasksToSync);

        SyncResult taskResult = taskSynchronizer.synchronize(project, taskRequest);
        if (!taskResult.isSuccess()) {
            log.error("[ProjectSyncService] Task sync failed: {}", taskResult.getError());
            return ProjectSyncResult.error("Sync failed: " + taskResult.getError());
        }
        totalSynced += taskResult.getSyncedCount();
        totalSkipped += taskResult.getSkippedCount();

        log.debug("[ProjectSyncService] Sync completed: totalSynced={}, totalSkipped={}, mappingSize={}",
            totalSynced, totalSkipped, resourceIdMapping != null ? resourceIdMapping.size() : 0);
        return ProjectSyncResult.success(totalSynced, totalSkipped, resourceIdMapping);
    }
}
