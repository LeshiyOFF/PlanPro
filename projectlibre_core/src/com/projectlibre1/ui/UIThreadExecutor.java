package com.projectlibre1.ui;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * UI Thread Executor - adapter for SwingUtilities.invokeLater
 * Provides abstraction for UI thread operations
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class UIThreadExecutor implements UIExecutorInterface {
    
    private static volatile UIThreadExecutor instance;
    private static final Object lock = new Object();
    
    private final ExecutorService uiExecutor;
    private final AtomicBoolean isHeadless;
    
    private UIThreadExecutor() {
        this.uiExecutor = Executors.newSingleThreadExecutor(r -> {
            Thread thread = new Thread(r, "UI-Thread");
            thread.setDaemon(true);
            return thread;
        });
        this.isHeadless = new AtomicBoolean(false);
    }
    
    /**
     * Get singleton instance
     * 
     * @return UIThreadExecutor instance
     */
    public static UIThreadExecutor getInstance() {
        UIThreadExecutor result = instance;
        if (result == null) {
            synchronized (lock) {
                result = instance;
                if (result == null) {
                    instance = result = new UIThreadExecutor();
                }
            }
        }
        return result;
    }
    
    /**
     * Execute runnable on UI thread
     * 
     * @param runnable task to execute
     */
    public void invokeLater(Runnable runnable) {
        if (runnable == null) {
            throw new IllegalArgumentException("Runnable cannot be null");
        }
        
        if (isHeadless.get()) {
            // In headless mode, execute immediately
            runnable.run();
        } else {
            // Use Swing if available, otherwise fallback to executor
            try {
                invokeLaterSwing(runnable);
            } catch (Exception e) {
                uiExecutor.submit(runnable);
            }
        }
    }
    
    /**
     * Execute runnable immediately if on UI thread, otherwise invoke later
     * 
     * @param runnable task to execute
     */
    public void invokeAndWait(Runnable runnable) {
        if (runnable == null) {
            throw new IllegalArgumentException("Runnable cannot be null");
        }
        
        if (isHeadless.get()) {
            runnable.run();
        } else {
            try {
                invokeAndWaitSwing(runnable);
            } catch (Exception e) {
                synchronized (runnable) {
                    uiExecutor.submit(runnable);
                    try {
                        runnable.wait(5000); // 5 second timeout
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
        }
    }
    
    /**
     * Set headless mode
     * 
     * @param headless true if headless mode
     */
    public void setHeadless(boolean headless) {
        isHeadless.set(headless);
    }
    
    /**
     * Check if in headless mode
     * 
     * @return true if headless
     */
    public boolean isHeadless() {
        return isHeadless.get();
    }
    
    /**
     * Shutdown executor
     */
    public void shutdown() {
        uiExecutor.shutdown();
    }
    
    /**
     * Try to use SwingUtilities if available
     * 
     * @param runnable task to execute
     */
    private void invokeLaterSwing(Runnable runnable) {
        try {
            Class<?> swingUtils = Class.forName("javax.swing.SwingUtilities");
            java.lang.reflect.Method method = swingUtils.getMethod("invokeLater", Runnable.class);
            method.invoke(null, runnable);
        } catch (Exception e) {
            throw new RuntimeException("Swing not available", e);
        }
    }
    
    /**
     * Try to use SwingUtilities.invokeAndWait if available
     * 
     * @param runnable task to execute
     */
    private void invokeAndWaitSwing(Runnable runnable) {
        try {
            Class<?> swingUtils = Class.forName("javax.swing.SwingUtilities");
            java.lang.reflect.Method method = swingUtils.getMethod("invokeAndWait", Runnable.class);
            method.invoke(null, runnable);
        } catch (Exception e) {
            throw new RuntimeException("Swing not available", e);
        }
    }
}