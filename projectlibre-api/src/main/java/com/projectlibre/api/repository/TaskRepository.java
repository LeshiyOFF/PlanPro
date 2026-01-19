package com.projectlibre.api.repository;

import com.projectlibre.api.model.Task;
import java.util.List;

/**
 * Интерфейс репозитория для работы с задачами
 * Расширяет базовый контракт специфичными операциями
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public interface TaskRepository extends BaseRepository<Task, Long> {
    
    /**
     * Найти задачи по идентификатору проекта
     * 
     * @param projectId идентификатор проекта
     * @return список задач проекта
     */
    List<Task> findByProjectId(Long projectId);
    
    /**
     * Найти задачи по статусу
     * 
     * @param status статус задачи
     * @return список задач с указанным статусом
     */
    List<Task> findByStatus(String status);
    
    /**
     * Найти задачи по исполнителю
     * 
     * @param assigneeId идентификатор исполнителя
     * @return список задач исполнителя
     */
    List<Task> findByAssigneeId(Long assigneeId);
    
    /**
     * Найти просроченные задачи
     * 
     * @return список просроченных задач
     */
    List<Task> findOverdueTasks();
    
    /**
     * Получить следующий доступный идентификатор
     * 
     * @return следующий ID
     */
    Long getNextId();
}
