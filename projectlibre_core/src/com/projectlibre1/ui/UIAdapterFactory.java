package com.projectlibre1.ui;

import com.projectlibre1.job.JobAdapter;

/**
 * Factory for creating UI adapters
 * Provides centralized access to UI abstraction components
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class UIAdapterFactory {
    
    private static volatile UIAdapterFactory instance;
    private static final Object lock = new Object();
    
    private UIExecutorInterface defaultExecutor;
    
    private UIAdapterFactory() {
        this.defaultExecutor = UIThreadExecutor.getInstance();
    }
    
    /**
     * Get singleton instance
     * 
     * @return UIAdapterFactory instance
     */
    public static UIAdapterFactory getInstance() {
        UIAdapterFactory result = instance;
        if (result == null) {
            synchronized (lock) {
                result = instance;
                if (result == null) {
                    instance = result = new UIAdapterFactory();
                }
            }
        }
        return result;
    }
    
    /**
     * Create UI thread executor
     * 
     * @return UI executor
     */
    public UIExecutorInterface createExecutor() {
        return defaultExecutor;
    }
    
    /**
     * Create UI thread executor with custom implementation
     * 
     * @param executor custom executor
     * @return UI executor
     */
    public UIExecutorInterface createExecutor(UIExecutorInterface executor) {
        return executor != null ? executor : defaultExecutor;
    }
    
    /**
     * Create UI alert
     * 
     * @return UI alert
     */
    public UIAlert createAlert() {
        return new UIAlert(defaultExecutor);
    }
    
    /**
     * Create UI alert with custom executor
     * 
     * @param executor custom executor
     * @return UI alert
     */
    public UIAlert createAlert(UIExecutorInterface executor) {
        return new UIAlert(executor != null ? executor : defaultExecutor);
    }
    
    /**
     * Create job adapter
     * 
     * @return job adapter
     */
    public JobAdapter createJobAdapter() {
        return new JobAdapter(defaultExecutor);
    }
    
    /**
     * Create job adapter with custom executor
     * 
     * @param executor custom executor
     * @return job adapter
     */
    public JobAdapter createJobAdapter(UIExecutorInterface executor) {
        return new JobAdapter(executor != null ? executor : defaultExecutor);
    }
    
    /**
     * Set headless mode for default executor
     * 
     * @param headless true if headless mode
     */
    public void setHeadless(boolean headless) {
        defaultExecutor.setHeadless(headless);
    }
    
    /**
     * Check if in headless mode
     * 
     * @return true if headless
     */
    public boolean isHeadless() {
        return defaultExecutor.isHeadless();
    }
}