package com.projectlibre.api.sync;

import com.projectlibre.api.dto.TaskSyncRequestDto.FrontendTaskDto;
import com.projectlibre1.pm.dependency.Dependency;
import com.projectlibre1.pm.dependency.DependencyService;
import com.projectlibre1.pm.dependency.DependencyType;
import com.projectlibre1.pm.task.NormalTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Идемпотентный синхронизатор зависимостей (Predecessors) из Frontend в Core Project.
 * 
 * <p>Обеспечивает полную синхронизацию: создаёт новые связи и удаляет устаревшие.
 * После синхронизации состояние зависимостей в Core точно соответствует Frontend.</p>
 * 
 * <p><b>Принцип:</b> Core.dependencies = Frontend.dependencies (не append-only).</p>
 * 
 * @author ProjectLibre Team
 * @version 3.0.0 (DEP-SYNC)
 * @see DependencyRemovalService
 */
public class DependencySynchronizer {

    private static final Logger log = LoggerFactory.getLogger(DependencySynchronizer.class);
    
    /** Маркер источника событий для трассировки в Core и триггера CPM. */
    private static final String EVENT_SOURCE_MARKER = "API_DEPENDENCY_SYNC";

    private final DependencyRemovalService removalService;
    
    private int createdCount;
    private int skippedCount;
    private int skippedExistingCount;
    private int skippedSummarySubtaskCount;

    public DependencySynchronizer() {
        this.removalService = new DependencyRemovalService(EVENT_SOURCE_MARKER);
    }

    public void synchronize(List<FrontendTaskDto> frontendTasks, Map<String, NormalTask> taskMap) {
        if (frontendTasks == null || frontendTasks.isEmpty() || taskMap == null) {
            return;
        }

        log.info("[DepSync] Starting dependency sync for {} tasks", frontendTasks.size());
        resetCounters();

        DependencyService depService = DependencyService.getInstance();

        for (FrontendTaskDto frontendTask : frontendTasks) {
            processFrontendTask(frontendTask, taskMap, depService);
        }

        log.info("[DepSync] Completed: created={}, removed={}, skipped={}, existing={}, summarySubtask={}",
                createdCount, removalService.getRemovedCount(), skippedCount, 
                skippedExistingCount, skippedSummarySubtaskCount);
    }

    private void resetCounters() {
        createdCount = 0;
        skippedCount = 0;
        skippedExistingCount = 0;
        skippedSummarySubtaskCount = 0;
        removalService.resetRemovedCount();
    }

    /**
     * Обрабатывает задачу из Frontend: синхронизирует её predecessors с Core.
     * Алгоритм: toRemove = Core - Frontend, toAdd = Frontend - Core
     */
    private void processFrontendTask(FrontendTaskDto frontendTask, 
                                     Map<String, NormalTask> taskMap,
                                     DependencyService depService) {
        NormalTask successorTask = taskMap.get(frontendTask.getId());
        if (successorTask == null) {
            skippedCount++;
            return;
        }

        Set<String> currentPredIds = removalService.getCurrentPredecessorIds(successorTask);
        Set<String> newPredIds = extractNewPredecessorIds(frontendTask);

        Set<String> toRemove = calculateSetDifference(currentPredIds, newPredIds);
        Set<String> toAdd = calculateSetDifference(newPredIds, currentPredIds);

        logSyncChangesIfNeeded(successorTask, currentPredIds, newPredIds, toRemove, toAdd);

        removalService.removeObsoleteDependencies(successorTask, toRemove);

        for (String predecessorId : toAdd) {
            createDependencyIfValid(depService, taskMap, predecessorId, successorTask);
        }
    }

    private Set<String> extractNewPredecessorIds(FrontendTaskDto frontendTask) {
        Set<String> newPredIds = new HashSet<>();
        List<String> predecessors = frontendTask.getPredecessors();
        if (predecessors != null) {
            newPredIds.addAll(predecessors);
        }
        return newPredIds;
    }

    private Set<String> calculateSetDifference(Set<String> source, Set<String> toSubtract) {
        Set<String> result = new HashSet<>(source);
        result.removeAll(toSubtract);
        return result;
    }

    private void logSyncChangesIfNeeded(NormalTask task, Set<String> current, 
                                        Set<String> newPreds, Set<String> toRemove, 
                                        Set<String> toAdd) {
        if (!toRemove.isEmpty() || !toAdd.isEmpty()) {
            log.info("[DepSync] Task '{}': current={}, new={}, toRemove={}, toAdd={}",
                    task.getName(), current, newPreds, toRemove, toAdd);
        }
    }

    private void createDependencyIfValid(DependencyService depService, 
                                         Map<String, NormalTask> taskMap,
                                         String predecessorId, 
                                         NormalTask successorTask) {
        NormalTask predecessorTask = taskMap.get(predecessorId);
        if (predecessorTask == null) {
            skippedCount++;
            return;
        }

        if (isDependencyExists(predecessorTask, successorTask)) {
            skippedExistingCount++;
            return;
        }

        if (isSummarySubtaskLink(predecessorTask, successorTask)) {
            skippedSummarySubtaskCount++;
            return;
        }

        createDependency(depService, predecessorTask, successorTask);
    }

    private boolean isDependencyExists(NormalTask predecessor, NormalTask successor) {
        boolean exists = predecessor.getSuccessorList().findRight(successor) != null;
        if (exists && log.isDebugEnabled()) {
            log.debug("[DepSync] Skip existing: {} -> {}", predecessor.getName(), successor.getName());
        }
        return exists;
    }

    private boolean isSummarySubtaskLink(NormalTask predecessor, NormalTask successor) {
        boolean isSummary = successor.wbsDescendentOf(predecessor) 
                        || predecessor.wbsDescendentOf(successor);
        if (isSummary && log.isDebugEnabled()) {
            log.debug("[DepSync] Skip summary-subtask: {} -> {}", predecessor.getName(), successor.getName());
        }
        return isSummary;
    }

    private void createDependency(DependencyService depService, 
                                  NormalTask predecessor, 
                                  NormalTask successor) {
        try {
            Dependency dep = depService.newDependency(
                    predecessor,
                    successor,
                    DependencyType.FS,
                    0,
                    EVENT_SOURCE_MARKER
            );
            if (dep != null) {
                createdCount++;
                logDependencyCreated(predecessor, successor);
            }
        } catch (Exception e) {
            skippedCount++;
            log.warn("[DepSync] Failed: {} -> {}: {}", 
                    predecessor.getName(), successor.getName(), e.getMessage());
        }
    }

    private void logDependencyCreated(NormalTask predecessor, NormalTask successor) {
        if (log.isDebugEnabled()) {
            log.debug("[DepSync] Created: {} -> {}", predecessor.getName(), successor.getName());
        }
    }

    public int getCreatedCount() { return createdCount; }
    public int getRemovedCount() { return removalService.getRemovedCount(); }
    public int getSkippedCount() { return skippedCount; }
    public int getSkippedExistingCount() { return skippedExistingCount; }
    public int getSkippedSummarySubtaskCount() { return skippedSummarySubtaskCount; }
}
