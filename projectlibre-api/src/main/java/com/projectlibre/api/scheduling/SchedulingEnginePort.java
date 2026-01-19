package com.projectlibre.api.scheduling;

/**
 * Порт для движка планирования (Scheduling Engine)
 * Определяет контракт для пересчёта проекта и критического пути
 * Следует принципам Hexagonal Architecture (Ports & Adapters)
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public interface SchedulingEnginePort {
    
    /**
     * Выполнить полный пересчёт проекта
     * Включает пересчёт дат всех задач и критического пути
     * 
     * @param projectId идентификатор проекта
     * @return результат пересчёта с обновлёнными данными
     */
    RecalculationResult recalculate(Long projectId);
    
    /**
     * Выполнить инкрементальный пересчёт для конкретной задачи
     * Оптимизированный вариант для изменения одной задачи
     * 
     * @param projectId идентификатор проекта
     * @param taskId идентификатор изменённой задачи
     * @return результат пересчёта
     */
    RecalculationResult recalculateTask(Long projectId, Long taskId);
    
    /**
     * Проверить, требуется ли пересчёт проекту
     * 
     * @param projectId идентификатор проекта
     * @return true если пересчёт необходим
     */
    boolean needsRecalculation(Long projectId);
    
    /**
     * Получить информацию о критическом пути
     * 
     * @param projectId идентификатор проекта
     * @return true если критический путь изменился после последнего пересчёта
     */
    boolean isCriticalPathChanged(Long projectId);
}
