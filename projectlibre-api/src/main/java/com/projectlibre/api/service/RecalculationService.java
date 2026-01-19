package com.projectlibre.api.service;

import com.projectlibre.api.scheduling.RecalculationResult;
import com.projectlibre.api.scheduling.SchedulingEngineAdapter;
import com.projectlibre.api.scheduling.SchedulingEnginePort;

/**
 * Сервис пересчёта проекта
 * Предоставляет API для запуска движка планирования
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class RecalculationService {
    
    private final SchedulingEnginePort schedulingEngine;
    
    public RecalculationService() {
        this.schedulingEngine = SchedulingEngineAdapter.getInstance();
    }
    
    public RecalculationService(SchedulingEnginePort schedulingEngine) {
        this.schedulingEngine = schedulingEngine;
    }
    
    /**
     * Выполнить полный пересчёт проекта
     * 
     * @param projectId идентификатор проекта
     * @return результат пересчёта
     */
    public RecalculationResult recalculateProject(Long projectId) {
        if (projectId == null) {
            return RecalculationResult.failure(null, "Project ID cannot be null");
        }
        return schedulingEngine.recalculate(projectId);
    }
    
    /**
     * Выполнить инкрементальный пересчёт для задачи
     * 
     * @param projectId идентификатор проекта
     * @param taskId идентификатор задачи
     * @return результат пересчёта
     */
    public RecalculationResult recalculateTask(Long projectId, Long taskId) {
        if (projectId == null) {
            return RecalculationResult.failure(null, "Project ID cannot be null");
        }
        if (taskId == null) {
            return RecalculationResult.failure(projectId, "Task ID cannot be null");
        }
        return schedulingEngine.recalculateTask(projectId, taskId);
    }
    
    /**
     * Проверить, требуется ли пересчёт
     * 
     * @param projectId идентификатор проекта
     * @return true если пересчёт необходим
     */
    public boolean needsRecalculation(Long projectId) {
        if (projectId == null) {
            return false;
        }
        return schedulingEngine.needsRecalculation(projectId);
    }
    
    /**
     * Проверить, изменился ли критический путь
     * 
     * @param projectId идентификатор проекта
     * @return true если критический путь изменился
     */
    public boolean isCriticalPathChanged(Long projectId) {
        if (projectId == null) {
            return false;
        }
        return schedulingEngine.isCriticalPathChanged(projectId);
    }
    
    /**
     * Пометить проект как требующий пересчёта
     * 
     * @param projectId идентификатор проекта
     */
    public void markForRecalculation(Long projectId) {
        if (projectId != null) {
            ((SchedulingEngineAdapter) schedulingEngine).markForRecalculation(projectId);
        }
    }
}
