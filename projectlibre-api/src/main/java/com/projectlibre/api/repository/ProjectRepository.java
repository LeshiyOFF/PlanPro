package com.projectlibre.api.repository;

import com.projectlibre.api.model.Project;
import java.util.List;

/**
 * Интерфейс репозитория для работы с проектами
 * Расширяет базовый контракт специфичными операциями
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public interface ProjectRepository extends BaseRepository<Project, Long> {
    
    /**
     * Найти проекты по статусу
     * 
     * @param status статус проекта
     * @return список проектов с указанным статусом
     */
    List<Project> findByStatus(String status);
    
    /**
     * Найти проекты по владельцу
     * 
     * @param owner владелец проекта
     * @return список проектов указанного владельца
     */
    List<Project> findByOwner(String owner);
    
    /**
     * Найти активные проекты
     * 
     * @return список активных проектов
     */
    List<Project> findActiveProjects();
    
    /**
     * Выполнить пересчет проекта
     * 
     * @param id идентификатор проекта
     * @return пересчитанный проект
     */
    Project recalculate(Long id);
    
    /**
     * Получить следующий доступный идентификатор
     * 
     * @return следующий ID
     */
    Long getNextId();
}
