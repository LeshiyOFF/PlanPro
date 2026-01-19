package com.projectlibre1.concurrent;

import com.projectlibre1.job.JobQueue;
import com.projectlibre1.session.Session;

/**
 * Factory for creating thread-safe components
 * Provides centralized access to synchronized components
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ThreadSafeFactory {
    
    private static volatile ThreadSafeFactory instance;
    private static final Object lock = new Object();
    
    private final ThreadSafeManagerInterface syncManager;
    
    private ThreadSafeFactory() {
        this.syncManager = ThreadSafeManager.getInstance();
    }
    
    public static ThreadSafeFactory getInstance() {
        ThreadSafeFactory result = instance;
        if (result == null) {
            synchronized (lock) {
                result = instance;
                if (result == null) {
                    instance = result = new ThreadSafeFactory();
                }
            }
        }
        return result;
    }
    
    public ThreadSafeJobQueue createJobQueue() {
        return new ThreadSafeJobQueue(syncManager);
    }
    
    public ThreadSafeJobQueue createJobQueue(ThreadSafeManagerInterface syncManager) {
        return new ThreadSafeJobQueue(syncManager != null ? syncManager : this.syncManager);
    }
    
    public ThreadSafeSession createSession(Session delegate) {
        return new ThreadSafeSession(delegate, syncManager);
    }
    
    public ThreadSafeSession createSession(Session delegate, ThreadSafeManagerInterface syncManager) {
        return new ThreadSafeSession(delegate, 
            syncManager != null ? syncManager : this.syncManager);
    }
    
    public ThreadSafeManagerInterface getSyncManager() {
        return syncManager;
    }
    
    public ThreadSafeManagerInterface createSyncManager() {
        return new CustomThreadSafeManager();
    }
    
    private static class CustomThreadSafeManager implements ThreadSafeManagerInterface {
        
        private final java.util.concurrent.ConcurrentHashMap<String, 
            java.util.concurrent.locks.ReentrantLock> locks;
        private final java.util.concurrent.ConcurrentHashMap<String, 
            java.util.concurrent.locks.ReentrantReadWriteLock> rwLocks;
        private final java.util.concurrent.atomic.AtomicLong operationCounter;
        
        public CustomThreadSafeManager() {
            this.locks = new java.util.concurrent.ConcurrentHashMap<>();
            this.rwLocks = new java.util.concurrent.ConcurrentHashMap<>();
            this.operationCounter = new java.util.concurrent.atomic.AtomicLong(0);
        }
        
        public <T> T executeWithLock(String lockName, java.util.function.Supplier<T> operation) {
            java.util.concurrent.locks.ReentrantLock lock = locks.computeIfAbsent(lockName, 
                k -> new java.util.concurrent.locks.ReentrantLock());
            lock.lock();
            try {
                operationCounter.incrementAndGet();
                return operation.get();
            } finally {
                lock.unlock();
            }
        }
        
        public <T> T executeWithReadLock(String lockName, java.util.function.Supplier<T> operation) {
            java.util.concurrent.locks.ReentrantReadWriteLock lock = rwLocks.computeIfAbsent(lockName, 
                k -> new java.util.concurrent.locks.ReentrantReadWriteLock());
            lock.readLock().lock();
            try {
                operationCounter.incrementAndGet();
                return operation.get();
            } finally {
                lock.readLock().unlock();
            }
        }
        
        public <T> T executeWithWriteLock(String lockName, java.util.function.Supplier<T> operation) {
            java.util.concurrent.locks.ReentrantReadWriteLock lock = rwLocks.computeIfAbsent(lockName, 
                k -> new java.util.concurrent.locks.ReentrantReadWriteLock());
            lock.writeLock().lock();
            try {
                operationCounter.incrementAndGet();
                return operation.get();
            } finally {
                lock.writeLock().unlock();
            }
        }
        
        public void executeSynchronized(String lockName, java.lang.Runnable operation) {
            java.util.concurrent.locks.ReentrantLock lock = locks.computeIfAbsent(lockName, 
                k -> new java.util.concurrent.locks.ReentrantLock());
            lock.lock();
            try {
                operationCounter.incrementAndGet();
                operation.run();
            } finally {
                lock.unlock();
            }
        }
        
        public java.util.concurrent.locks.ReentrantLock getLock(String lockName) {
            return locks.computeIfAbsent(lockName, 
                k -> new java.util.concurrent.locks.ReentrantLock());
        }
        
        public java.util.concurrent.locks.ReentrantReadWriteLock getReadWriteLock(String lockName) {
            return rwLocks.computeIfAbsent(lockName, 
                k -> new java.util.concurrent.locks.ReentrantReadWriteLock());
        }
        
        public long getOperationCount() {
            return operationCounter.get();
        }
        
        public int getActiveLocksCount() {
            long lockedCount = locks.values().stream()
                .filter(java.util.concurrent.locks.ReentrantLock::isLocked).count();
            long rwLockedCount = rwLocks.values().stream()
                .filter(l -> l.getReadLockCount() > 0 || l.isWriteLocked()).count();
            return (int) (lockedCount + rwLockedCount);
        }
        
        public boolean removeLock(String lockName) {
            java.util.concurrent.locks.ReentrantLock lock = locks.get(lockName);
            if (lock != null && !lock.isLocked()) {
                locks.remove(lockName);
                return true;
            }
            return false;
        }
        
        public boolean removeReadWriteLock(String lockName) {
            java.util.concurrent.locks.ReentrantReadWriteLock lock = rwLocks.get(lockName);
            if (lock != null && lock.getReadLockCount() == 0 && !lock.isWriteLocked()) {
                rwLocks.remove(lockName);
                return true;
            }
            return false;
        }
        
        public int cleanupUnusedLocks() {
            int cleaned = 0;
            locks.entrySet().removeIf(entry -> {
                java.util.concurrent.locks.ReentrantLock lock = entry.getValue();
                if (!lock.isLocked()) {
                    return true;
                }
                return false;
            });
            
            rwLocks.entrySet().removeIf(entry -> {
                java.util.concurrent.locks.ReentrantReadWriteLock lock = entry.getValue();
                if (lock.getReadLockCount() == 0 && !lock.isWriteLocked()) {
                    return true;
                }
                return false;
            });
            
            return cleaned;
        }
    }
}