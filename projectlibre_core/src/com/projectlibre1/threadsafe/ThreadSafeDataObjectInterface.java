package com.projectlibre1.threadsafe;

/**
 * Interface for thread-safe data objects
 * Defines contract for thread-safe data access
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public interface ThreadSafeDataObjectInterface<T> {
    
    /**
     * Get data with thread safety
     * 
     * @param dataKey key for data
     * @return data value
     */
    Object getData(String dataKey);
    
    /**
     * Set data with thread safety
     * 
     * @param dataKey key for data
     * @param value data value
     */
    void setData(String dataKey, Object value);
    
    /**
     * Get cached data with thread safety
     * 
     * @return cached data
     */
    T getCachedData();
    
    /**
     * Set cached data with thread safety
     * 
     * @param data cached data
     */
    void setCachedData(T data);
    
    /**
     * Get last modification timestamp
     * 
     * @return last modification time
     */
    long getLastModified();
    
    /**
     * Check if data object is thread-safe
     * 
     * @return true if object provides thread safety
     */
    boolean isThreadSafe();
}