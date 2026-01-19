package com.projectlibre.api.repository;

import com.projectlibre.api.model.Resource;
import java.util.List;

/**
 * Интерфейс репозитория для работы с ресурсами
 * Расширяет базовый контракт специфичными операциями
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public interface ResourceRepository extends BaseRepository<Resource, Long> {
    
    /**
     * Найти ресурсы по типу
     * 
     * @param type тип ресурса (HUMAN, MATERIAL, FINANCIAL)
     * @return список ресурсов указанного типа
     */
    List<Resource> findByType(String type);
    
    /**
     * Найти ресурсы по статусу
     * 
     * @param status статус ресурса
     * @return список ресурсов с указанным статусом
     */
    List<Resource> findByStatus(String status);
    
    /**
     * Найти ресурсы по проекту
     * 
     * @param projectId идентификатор проекта
     * @return список ресурсов проекта
     */
    List<Resource> findByProjectId(Long projectId);
    
    /**
     * Найти доступные ресурсы
     * 
     * @return список доступных ресурсов
     */
    List<Resource> findAvailableResources();
    
    /**
     * Получить следующий доступный идентификатор
     * 
     * @return следующий ID
     */
    Long getNextId();
}
