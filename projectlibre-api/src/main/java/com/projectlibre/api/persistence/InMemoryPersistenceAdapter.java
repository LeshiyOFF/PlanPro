package com.projectlibre.api.persistence;

import com.projectlibre1.concurrent.ThreadSafeManager;
import com.projectlibre1.concurrent.ThreadSafeManagerInterface;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

/**
 * In-memory адаптер для персистентности
 * Реализует хранение в памяти с потокобезопасностью
 * Используется как основа для более сложных адаптеров
 * 
 * @param <T> тип сущности
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class InMemoryPersistenceAdapter<T> implements PersistencePort<T, Long> {
    
    private final Map<Long, T> storage;
    private final ThreadSafeManagerInterface syncManager;
    private final String lockPrefix;
    
    public InMemoryPersistenceAdapter(String lockPrefix) {
        this.storage = new ConcurrentHashMap<>();
        this.syncManager = ThreadSafeManager.getInstance();
        this.lockPrefix = lockPrefix;
    }
    
    @Override
    public Optional<T> findById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return executeRead(() -> Optional.ofNullable(storage.get(id)));
    }
    
    @Override
    public List<T> findAll() {
        return executeRead(() -> new ArrayList<>(storage.values()));
    }
    
    @Override
    public T save(T entity) {
        if (entity == null) {
            throw new PersistenceException("Entity cannot be null");
        }
        return executeWrite(() -> {
            Long id = extractId(entity);
            storage.put(id, entity);
            return entity;
        });
    }
    
    @Override
    public boolean deleteById(Long id) {
        if (id == null) {
            return false;
        }
        return executeWrite(() -> storage.remove(id) != null);
    }
    
    @Override
    public boolean existsById(Long id) {
        if (id == null) {
            return false;
        }
        return executeRead(() -> storage.containsKey(id));
    }
    
    @Override
    public long count() {
        return executeRead(() -> (long) storage.size());
    }
    
    @Override
    public void clear() {
        executeWrite(() -> {
            storage.clear();
            return null;
        });
    }
    
    protected <R> R executeRead(Supplier<R> operation) {
        return syncManager.executeWithReadLock(lockPrefix + "_read", operation);
    }
    
    protected <R> R executeWrite(Supplier<R> operation) {
        return syncManager.executeWithWriteLock(lockPrefix + "_write", operation);
    }
    
    /**
     * Извлечь идентификатор из сущности
     * Должен быть переопределен в подклассах
     */
    protected Long extractId(T entity) {
        throw new UnsupportedOperationException("extractId must be implemented");
    }
    
    protected Map<Long, T> getStorage() {
        return storage;
    }
}
