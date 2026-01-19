package com.projectlibre.api.repository;

import java.util.List;
import java.util.Optional;

/**
 * Базовый интерфейс репозитория для CRUD операций
 * Определяет контракт для работы с сущностями
 * 
 * @param <T> тип сущности
 * @param <ID> тип идентификатора
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public interface BaseRepository<T, ID> {
    
    /**
     * Найти сущность по идентификатору
     * 
     * @param id идентификатор сущности
     * @return Optional с сущностью или пустой Optional
     */
    Optional<T> findById(ID id);
    
    /**
     * Получить все сущности
     * 
     * @return список всех сущностей
     */
    List<T> findAll();
    
    /**
     * Сохранить сущность (создать или обновить)
     * 
     * @param entity сущность для сохранения
     * @return сохраненная сущность
     */
    T save(T entity);
    
    /**
     * Удалить сущность по идентификатору
     * 
     * @param id идентификатор сущности
     * @return true если удалено успешно
     */
    boolean deleteById(ID id);
    
    /**
     * Проверить существование сущности
     * 
     * @param id идентификатор сущности
     * @return true если сущность существует
     */
    boolean existsById(ID id);
    
    /**
     * Получить количество сущностей
     * 
     * @return количество сущностей
     */
    long count();
}
