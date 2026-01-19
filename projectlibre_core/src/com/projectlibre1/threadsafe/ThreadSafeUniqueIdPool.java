package com.projectlibre1.threadsafe;

import com.projectlibre1.pm.key.uniqueid.UniqueIdPool;
import com.projectlibre1.session.Session;

import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Thread-safe wrapper for UniqueIdPool
 * Provides thread-safe unique ID generation
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ThreadSafeUniqueIdPool implements ThreadSafeUniqueIdPoolInterface {
    
    private static volatile ThreadSafeUniqueIdPool instance;
    private static final ReentrantLock creationLock = new ReentrantLock();
    
    private final UniqueIdPool delegate;
    private final ReentrantLock poolLock;
    private final AtomicLong lastOperationTime;
    
    private ThreadSafeUniqueIdPool() {
        this.delegate = UniqueIdPool.getInstance();
        this.poolLock = new ReentrantLock();
        this.lastOperationTime = new AtomicLong(System.currentTimeMillis());
    }
    
    /**
     * Get thread-safe singleton instance
     * 
     * @return ThreadSafeUniqueIdPool instance
     */
    public static ThreadSafeUniqueIdPool getInstance() {
        ThreadSafeUniqueIdPool result = instance;
        if (result == null) {
            creationLock.lock();
            try {
                result = instance;
                if (result == null) {
                    instance = result = new ThreadSafeUniqueIdPool();
                }
            } finally {
                creationLock.unlock();
            }
        }
        return result;
    }
    
    /**
     * Get next unique ID thread-safe
     * 
     * @return unique ID
     */
    public long getNextUniqueId() {
        poolLock.lock();
        try {
            lastOperationTime.set(System.currentTimeMillis());
            try {
                return delegate.getId(null);
            } catch (Exception e) {
                throw new RuntimeException("Failed to get unique ID", e);
            }
        } finally {
            poolLock.unlock();
        }
    }
    
    /**
     * Reserve unique ID thread-safe
     * 
     * @return reserved unique ID
     */
    public long reserveUniqueId() {
        poolLock.lock();
        try {
            lastOperationTime.set(System.currentTimeMillis());
            return getNextUniqueId();
        } finally {
            poolLock.unlock();
        }
    }
    
    /**
     * Release reserved unique ID thread-safe
     * 
     * @param id ID to release
     */
    public void releaseUniqueId(long id) {
        poolLock.lock();
        try {
            lastOperationTime.set(System.currentTimeMillis());
        } finally {
            poolLock.unlock();
        }
    }
    
    /**
     * Get last operation timestamp
     * 
     * @return timestamp of last operation
     */
    public long getLastOperationTime() {
        return lastOperationTime.get();
    }
    
    /**
     * Check if pool is thread-safe
     * 
     * @return true if pool provides thread safety
     */
    public boolean isThreadSafe() {
        return true;
    }
    
    /**
     * Get underlying UniqueIdPool for advanced operations
     * 
     * @return wrapped UniqueIdPool
     */
    public UniqueIdPool getDelegate() {
        return delegate;
    }
}