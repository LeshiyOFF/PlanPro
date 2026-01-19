package com.projectlibre.api.adapter;

import com.projectlibre.api.persistence.PersistencePort;
import com.projectlibre1.concurrent.ThreadSafeManager;
import com.projectlibre1.concurrent.ThreadSafeManagerInterface;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Supplier;

/**
 * Абстрактный базовый адаптер для потокобезопасных операций
 * Использует PersistencePort для хранения данных
 * Предоставляет общую логику синхронизации
 * 
 * @param <T> тип сущности
 * @author ProjectLibre Team
 * @version 2.0.0
 */
public abstract class AbstractThreadSafeAdapter<T> {
    
    protected final ThreadSafeManagerInterface syncManager;
    protected final PersistencePort<T, Long> persistence;
    protected final AtomicLong idGenerator;
    protected final String lockPrefix;
    
    protected AbstractThreadSafeAdapter(String lockPrefix, 
                                       PersistencePort<T, Long> persistence) {
        this.syncManager = ThreadSafeManager.getInstance();
        this.persistence = persistence;
        this.idGenerator = new AtomicLong(1);
        this.lockPrefix = lockPrefix;
    }
    
    /**
     * Выполнить операцию чтения с блокировкой
     */
    protected <R> R executeRead(Supplier<R> operation) {
        return syncManager.executeWithReadLock(lockPrefix + "_read", operation);
    }
    
    /**
     * Выполнить операцию записи с блокировкой
     */
    protected <R> R executeWrite(Supplier<R> operation) {
        return syncManager.executeWithWriteLock(lockPrefix + "_write", operation);
    }
    
    /**
     * Выполнить синхронизированную операцию
     */
    protected void executeSynchronized(Runnable operation) {
        syncManager.executeSynchronized(lockPrefix + "_sync", operation);
    }
    
    /**
     * Получить следующий идентификатор
     */
    public Long getNextId() {
        return idGenerator.getAndIncrement();
    }
    
    /**
     * Получить количество элементов
     */
    public long count() {
        return persistence.count();
    }
    
    /**
     * Проверить существование элемента
     */
    public boolean existsById(Long id) {
        return persistence.existsById(id);
    }
}
