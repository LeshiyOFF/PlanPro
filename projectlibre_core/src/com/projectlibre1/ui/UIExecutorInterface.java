package com.projectlibre1.ui;

/**
 * Interface for UI thread execution
 * Provides abstraction for UI operations
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public interface UIExecutorInterface {
    
    /**
     * Execute runnable on UI thread
     * 
     * @param runnable task to execute
     */
    void invokeLater(Runnable runnable);
    
    /**
     * Execute runnable immediately if on UI thread, otherwise invoke later
     * 
     * @param runnable task to execute
     */
    void invokeAndWait(Runnable runnable);
    
    /**
     * Set headless mode
     * 
     * @param headless true if headless mode
     */
    void setHeadless(boolean headless);
    
    /**
     * Check if in headless mode
     * 
     * @return true if headless
     */
    boolean isHeadless();
    
    /**
     * Shutdown executor
     */
    void shutdown();
}