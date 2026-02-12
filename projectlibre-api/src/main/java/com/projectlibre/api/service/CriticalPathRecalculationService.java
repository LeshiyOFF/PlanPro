package com.projectlibre.api.service;

import com.projectlibre.api.converter.CoreToApiConverter;
import com.projectlibre.api.dto.ProjectDataDto;
import com.projectlibre.api.recalculation.CpmRecalculationRunner;
import com.projectlibre.api.storage.CoreProjectBridge;
import com.projectlibre.api.concurrent.CoreAccessGuard;
import com.projectlibre1.pm.task.Project;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Сервис перерасчёта критического пути через Core ProjectLibre (CPM).
 * Устанавливает границы проекта (setEnd/setEndConstraint) перед recalculate().
 */
@Service
public class CriticalPathRecalculationService {

    private static final Logger log = LoggerFactory.getLogger("CriticalPathTrace");

    private final CoreAccessGuard coreAccessGuard;
    private final CoreToApiConverter coreConverter;

    public CriticalPathRecalculationService(CoreAccessGuard coreAccessGuard) {
        this.coreAccessGuard = coreAccessGuard;
        this.coreConverter = new CoreToApiConverter();
    }

    /**
     * Пересчитывает критический путь и возвращает обновлённые данные проекта.
     *
     * @param projectId ID проекта в CoreProjectBridge
     * @return ProjectDataDto с актуальными флагами critical
     * @throws IllegalArgumentException если проект не найден
     * @throws RuntimeException при ошибке перерасчёта
     */
    public ProjectDataDto recalculate(Long projectId) {
        log.info("[CriticalPathTrace] layer=api request projectId={}", projectId);

        Project coreProject = CoreProjectBridge.getInstance()
                .findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Project not found in CoreProjectBridge: " + projectId
                                + ". Make sure project is loaded via FileRestController first."));
        coreAccessGuard.executeWithLock(() -> new CpmRecalculationRunner().run(coreProject));
        ProjectDataDto result = coreConverter.convert(coreProject);

        int taskCount = result.getTasks() != null ? result.getTasks().size() : 0;
        int criticalCount = 0;
        List<String> criticalTaskIds = new ArrayList<>();
        if (result.getTasks() != null) {
            for (ProjectDataDto.TaskDataDto t : result.getTasks()) {
                if (Boolean.TRUE.equals(t.isCritical())) {
                    criticalCount++;
                    criticalTaskIds.add(t.getId() != null ? t.getId() : "?");
                }
            }
        }
        log.info("[CriticalPathTrace] layer=api response projectId={} taskCount={} criticalCount={} criticalTaskIds={}",
                projectId, taskCount, criticalCount, criticalTaskIds);

        return result;
    }
}
