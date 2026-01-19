package com.projectlibre.api.persistence;

import java.util.List;
import java.util.Optional;

/**
 * Порт для операций персистентности
 * Определяет контракт для сохранения/загрузки сущностей
 * Следует принципам Hexagonal Architecture (Ports & Adapters)
 * 
 * @param <T> тип сущности
 * @param <ID> тип идентификатора
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public interface PersistencePort<T, ID> {
    
    /**
     * Найти сущность по идентификатору
     * 
     * @param id идентификатор
     * @return Optional с сущностью или пустой Optional
     */
    Optional<T> findById(ID id);
    
    /**
     * Найти все сущности
     * 
     * @return список всех сущностей
     */
    List<T> findAll();
    
    /**
     * Сохранить сущность
     * 
     * @param entity сущность для сохранения
     * @return сохраненная сущность
     */
    T save(T entity);
    
    /**
     * Удалить сущность по идентификатору
     * 
     * @param id идентификатор
     * @return true если сущность была удалена
     */
    boolean deleteById(ID id);
    
    /**
     * Проверить существование сущности
     * 
     * @param id идентификатор
     * @return true если сущность существует
     */
    boolean existsById(ID id);
    
    /**
     * Получить количество сущностей
     * 
     * @return количество сущностей
     */
    long count();
    
    /**
     * Очистить все данные
     */
    void clear();
}
