package com.projectlibre1.threadsafe;

import com.projectlibre1.session.Session;

/**
 * Interface for thread-safe session factory
 * Defines contract for thread-safe session management
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public interface ThreadSafeSessionFactoryInterface {
    
    /**
     * Get thread-safe session
     * 
     * @param type session type
     * @return thread-safe session
     */
    Session getSession(String type);
    
    /**
     * Get thread-safe default session
     * 
     * @return thread-safe default session
     */
    Session getDefaultSession();
    
    /**
     * Check if factory is thread-safe
     * 
     * @return true if factory provides thread safety
     */
    boolean isThreadSafe();
}