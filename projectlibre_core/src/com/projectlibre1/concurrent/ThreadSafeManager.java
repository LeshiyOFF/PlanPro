package com.projectlibre1.concurrent;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.atomic.AtomicLong;
import java.util.Map;
import java.util.function.Supplier;

/**
 * Thread-Safe Manager - centralized synchronization manager
 * Provides unified thread-safe operations across application
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ThreadSafeManager implements ThreadSafeManagerInterface {
    
    private static volatile ThreadSafeManager instance;
    private static final ReentrantLock creationLock = new ReentrantLock();
    
    private final Map<String, ReentrantLock> locks;
    private final Map<String, ReentrantReadWriteLock> rwLocks;
    private final AtomicLong operationCounter;
    
    private ThreadSafeManager() {
        this.locks = new ConcurrentHashMap<>();
        this.rwLocks = new ConcurrentHashMap<>();
        this.operationCounter = new AtomicLong(0);
    }
    
    /**
     * Get singleton instance
     * 
     * @return ThreadSafeManager instance
     */
    public static ThreadSafeManager getInstance() {
        ThreadSafeManager result = instance;
        if (result == null) {
            creationLock.lock();
            try {
                result = instance;
                if (result == null) {
                    instance = result = new ThreadSafeManager();
                }
            } finally {
                creationLock.unlock();
            }
        }
        return result;
    }
    
    public <T> T executeWithLock(String lockName, Supplier<T> operation) {
        if (lockName == null || operation == null) {
            throw new IllegalArgumentException("Lock name and operation cannot be null");
        }
        
        ReentrantLock lock = locks.computeIfAbsent(lockName, k -> new ReentrantLock());
        lock.lock();
        try {
            operationCounter.incrementAndGet();
            return operation.get();
        } finally {
            lock.unlock();
        }
    }
    
    public <T> T executeWithReadLock(String lockName, Supplier<T> operation) {
        if (lockName == null || operation == null) {
            throw new IllegalArgumentException("Lock name and operation cannot be null");
        }
        
        ReentrantReadWriteLock lock = rwLocks.computeIfAbsent(lockName, k -> new ReentrantReadWriteLock());
        lock.readLock().lock();
        try {
            operationCounter.incrementAndGet();
            return operation.get();
        } finally {
            lock.readLock().unlock();
        }
    }
    
    public <T> T executeWithWriteLock(String lockName, Supplier<T> operation) {
        if (lockName == null || operation == null) {
            throw new IllegalArgumentException("Lock name and operation cannot be null");
        }
        
        ReentrantReadWriteLock lock = rwLocks.computeIfAbsent(lockName, k -> new ReentrantReadWriteLock());
        lock.writeLock().lock();
        try {
            operationCounter.incrementAndGet();
            return operation.get();
        } finally {
            lock.writeLock().unlock();
        }
    }
    
    public void executeSynchronized(String lockName, Runnable operation) {
        if (lockName == null || operation == null) {
            throw new IllegalArgumentException("Lock name and operation cannot be null");
        }
        
        ReentrantLock lock = locks.computeIfAbsent(lockName, k -> new ReentrantLock());
        lock.lock();
        try {
            operationCounter.incrementAndGet();
            operation.run();
        } finally {
            lock.unlock();
        }
    }
    
    public ReentrantLock getLock(String lockName) {
        if (lockName == null) {
            throw new IllegalArgumentException("Lock name cannot be null");
        }
        return locks.computeIfAbsent(lockName, k -> new ReentrantLock());
    }
    
    public ReentrantReadWriteLock getReadWriteLock(String lockName) {
        if (lockName == null) {
            throw new IllegalArgumentException("Lock name cannot be null");
        }
        return rwLocks.computeIfAbsent(lockName, k -> new ReentrantReadWriteLock());
    }
    
    public long getOperationCount() {
        return operationCounter.get();
    }
    
    public int getActiveLocksCount() {
        long lockedCount = locks.values().stream().filter(ReentrantLock::isLocked).count();
        long rwLockedCount = rwLocks.values().stream()
            .filter(l -> l.getReadLockCount() > 0 || l.isWriteLocked()).count();
        return (int) (lockedCount + rwLockedCount);
    }
    
    public boolean removeLock(String lockName) {
        if (lockName == null) {
            return false;
        }
        
        ReentrantLock lock = locks.get(lockName);
        if (lock != null && !lock.isLocked()) {
            locks.remove(lockName);
            return true;
        }
        return false;
    }
    
    public boolean removeReadWriteLock(String lockName) {
        if (lockName == null) {
            return false;
        }
        
        ReentrantReadWriteLock lock = rwLocks.get(lockName);
        if (lock != null && lock.getReadLockCount() == 0 && !lock.isWriteLocked()) {
            rwLocks.remove(lockName);
            return true;
        }
        return false;
    }
    
    public int cleanupUnusedLocks() {
        int cleaned = 0;
        
        locks.entrySet().removeIf(entry -> {
            ReentrantLock lock = entry.getValue();
            if (!lock.isLocked()) {
                return true;
            }
            return false;
        });
        
        rwLocks.entrySet().removeIf(entry -> {
            ReentrantReadWriteLock lock = entry.getValue();
            if (lock.getReadLockCount() == 0 && !lock.isWriteLocked()) {
                return true;
            }
            return false;
        });
        
        return cleaned;
    }
}