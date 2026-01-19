package com.projectlibre1.threadsafe;

/**
 * Interface for thread-safe unique ID pool
 * Defines contract for thread-safe ID generation
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public interface ThreadSafeUniqueIdPoolInterface {
    
    /**
     * Get next unique ID thread-safe
     * 
     * @return unique ID
     */
    long getNextUniqueId();
    
    /**
     * Reserve unique ID thread-safe
     * 
     * @return reserved unique ID
     */
    long reserveUniqueId();
    
    /**
     * Release reserved unique ID thread-safe
     * 
     * @param id ID to release
     */
    void releaseUniqueId(long id);
    
    /**
     * Get last operation timestamp
     * 
     * @return timestamp of last operation
     */
    long getLastOperationTime();
    
    /**
     * Check if pool is thread-safe
     * 
     * @return true if pool provides thread safety
     */
    boolean isThreadSafe();
}