package com.projectlibre1.ui;

import com.projectlibre1.job.JobAdapter;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Swing Migration Utility
 * Provides utilities for migrating from SwingUtilities to UI adapters
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class SwingMigrationUtil {
    
    private static final AtomicBoolean migrationEnabled = new AtomicBoolean(false);
    
    /**
     * Enable migration mode
     * 
     * @param enabled true to enable migration
     */
    public static void enableMigration(boolean enabled) {
        migrationEnabled.set(enabled);
    }
    
    /**
     * Check if migration is enabled
     * 
     * @return true if migration enabled
     */
    public static boolean isMigrationEnabled() {
        return migrationEnabled.get();
    }
    
    /**
     * Get replacement for SwingUtilities.invokeLater
     * 
     * @param runnable task to execute
     */
    public static void invokeLater(Runnable runnable) {
        if (migrationEnabled.get()) {
            UIThreadExecutor.getInstance().invokeLater(runnable);
        } else {
            // Fallback to original SwingUtilities
            try {
                Class<?> swingUtils = Class.forName("javax.swing.SwingUtilities");
                java.lang.reflect.Method method = swingUtils.getMethod("invokeLater", Runnable.class);
                method.invoke(null, runnable);
            } catch (Exception e) {
                throw new RuntimeException("Swing not available", e);
            }
        }
    }
    
    /**
     * Get replacement for SwingUtilities.invokeAndWait
     * 
     * @param runnable task to execute
     */
    public static void invokeAndWait(Runnable runnable) {
        if (migrationEnabled.get()) {
            UIThreadExecutor.getInstance().invokeAndWait(runnable);
        } else {
            // Fallback to original SwingUtilities
            try {
                Class<?> swingUtils = Class.forName("javax.swing.SwingUtilities");
                java.lang.reflect.Method method = swingUtils.getMethod("invokeAndWait", Runnable.class);
                method.invoke(null, runnable);
            } catch (Exception e) {
                throw new RuntimeException("Swing not available", e);
            }
        }
    }
    
    /**
     * Create UI alert for migration
     * 
     * @return UI alert instance
     */
    public static UIAlert createUIAlert() {
        return UIAdapterFactory.getInstance().createAlert();
    }
    
    /**
     * Create job adapter for migration
     * 
     * @return job adapter instance
     */
    public static JobAdapter createJobAdapter() {
        return UIAdapterFactory.getInstance().createJobAdapter();
    }
    
    /**
     * Migrate existing code pattern
     * 
     * @param runnable original runnable with SwingUtilities
     * @return migrated runnable
     */
    public static Runnable migrateRunnable(Runnable runnable) {
        if (!migrationEnabled.get()) {
            return runnable;
        }
        
        return () -> invokeLater(runnable);
    }
    
    /**
     * Initialize migration with headless mode
     * 
     * @param headless true for headless mode
     */
    public static void initializeMigration(boolean headless) {
        migrationEnabled.set(true);
        UIThreadExecutor.getInstance().setHeadless(headless);
    }
}