package com.projectlibre1.concurrent;

import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.Supplier;

/**
 * Interface for thread-safe operations manager
 * Provides contract for synchronization operations
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public interface ThreadSafeManagerInterface {
    
    /**
     * Execute operation with exclusive lock
     * 
     * @param lockName lock identifier
     * @param operation operation to execute
     * @param <T> return type
     * @return operation result
     */
    <T> T executeWithLock(String lockName, Supplier<T> operation);
    
    /**
     * Execute operation with read lock
     * 
     * @param lockName lock identifier
     * @param operation operation to execute
     * @param <T> return type
     * @return operation result
     */
    <T> T executeWithReadLock(String lockName, Supplier<T> operation);
    
    /**
     * Execute operation with write lock
     * 
     * @param lockName lock identifier
     * @param operation operation to execute
     * @param <T> return type
     * @return operation result
     */
    <T> T executeWithWriteLock(String lockName, Supplier<T> operation);
    
    /**
     * Execute synchronized block
     * 
     * @param lockName lock identifier
     * @param operation operation to execute
     */
    void executeSynchronized(String lockName, Runnable operation);
    
    /**
     * Get lock for manual management
     * 
     * @param lockName lock identifier
     * @return lock instance
     */
    ReentrantLock getLock(String lockName);
    
    /**
     * Get read-write lock for manual management
     * 
     * @param lockName lock identifier
     * @return read-write lock instance
     */
    ReentrantReadWriteLock getReadWriteLock(String lockName);
    
    /**
     * Get total operation count
     * 
     * @return number of synchronized operations
     */
    long getOperationCount();
    
    /**
     * Get active locks count
     * 
     * @return number of active locks
     */
    int getActiveLocksCount();
    
    /**
     * Remove unused lock
     * 
     * @param lockName lock identifier
     * @return true if lock was removed
     */
    boolean removeLock(String lockName);
    
    /**
     * Remove unused read-write lock
     * 
     * @param lockName lock identifier
     * @return true if lock was removed
     */
    boolean removeReadWriteLock(String lockName);
    
    /**
     * Cleanup unused locks
     * 
     * @return number of cleaned locks
     */
    int cleanupUnusedLocks();
}