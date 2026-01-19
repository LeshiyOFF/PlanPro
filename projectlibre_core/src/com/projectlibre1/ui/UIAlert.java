package com.projectlibre1.ui;

import java.util.Set;
import java.util.HashSet;

/**
 * UI Alert - adapter for Alert operations
 * Provides abstraction for UI notifications
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class UIAlert {
    
    private final UIExecutorInterface uiExecutor;
    
    public UIAlert() {
        this.uiExecutor = UIThreadExecutor.getInstance();
    }
    
    public UIAlert(UIExecutorInterface uiExecutor) {
        this.uiExecutor = uiExecutor != null ? uiExecutor : UIThreadExecutor.getInstance();
    }
    
    /**
     * Show warning message
     * 
     * @param message warning message
     */
    public void warn(Object message) {
        if (message == null) {
            return;
        }
        
        uiExecutor.invokeLater(() -> {
            try {
                // Try to use Alert class if available
                Class<?> alertClass = Class.forName("com.projectlibre1.util.Alert");
                java.lang.reflect.Method method = alertClass.getMethod("warn", Object.class);
                method.invoke(null, message);
            } catch (Exception e) {
                // Fallback to console
                System.err.println("WARNING: " + message);
            }
        });
    }
    
    /**
     * Show error message
     * 
     * @param message error message
     */
    public void error(Object message) {
        if (message == null) {
            return;
        }
        
        uiExecutor.invokeLater(() -> {
            try {
                // Try to use Alert class if available
                Class<?> alertClass = Class.forName("com.projectlibre1.util.Alert");
                java.lang.reflect.Method method = alertClass.getMethod("error", Object.class);
                method.invoke(null, message);
            } catch (Exception e) {
                // Fallback to console
                System.err.println("ERROR: " + message);
            }
        });
    }
    
    /**
     * Show confirmation dialog
     * 
     * @param message confirmation message
     * @return result of confirmation
     */
    public int confirm(Object message) {
        if (message == null) {
            return -1;
        }
        
        try {
            if (uiExecutor.isHeadless()) {
                // In headless mode, return default
                return 0; // NO_OPTION equivalent
            }
            
            // Try to use Alert class if available
            Class<?> alertClass = Class.forName("com.projectlibre1.util.Alert");
            java.lang.reflect.Method method = alertClass.getMethod("confirm", Object.class);
            return (Integer) method.invoke(null, message);
        } catch (Exception e) {
            // Fallback to console
            System.out.println("CONFIRM: " + message);
            return 0; // NO_OPTION equivalent
        }
    }
    
    /**
     * Show yes/no confirmation dialog
     * 
     * @param message confirmation message
     * @return result of confirmation
     */
    public int confirmYesNo(Object message) {
        if (message == null) {
            return -1;
        }
        
        try {
            if (uiExecutor.isHeadless()) {
                return 0; // NO_OPTION equivalent
            }
            
            Class<?> alertClass = Class.forName("com.projectlibre1.util.Alert");
            java.lang.reflect.Method method = alertClass.getMethod("confirmYesNo", Object.class);
            return (Integer) method.invoke(null, message);
        } catch (Exception e) {
            System.out.println("YES/NO: " + message);
            return 0;
        }
    }
    
    /**
     * Show ok/cancel dialog
     * 
     * @param message confirmation message
     * @return result of confirmation
     */
    public boolean okCancel(Object message) {
        if (message == null) {
            return false;
        }
        
        try {
            if (uiExecutor.isHeadless()) {
                return true; // Default to OK in headless
            }
            
            Class<?> alertClass = Class.forName("com.projectlibre1.util.Alert");
            java.lang.reflect.Method method = alertClass.getMethod("okCancel", Object.class);
            return (Boolean) method.invoke(null, message);
        } catch (Exception e) {
            System.out.println("OK/CANCEL: " + message);
            return true;
        }
    }
    
    /**
     * Show rename project dialog
     * 
     * @param name current name
     * @param projectNames existing project names
     * @param saveAs true if save as operation
     * @return new name
     */
    public String renameProject(String name, Set<String> projectNames, boolean saveAs) {
        try {
            if (uiExecutor.isHeadless()) {
                return name; // Return original name in headless
            }
            
            Class<?> alertClass = Class.forName("com.projectlibre1.util.Alert");
            java.lang.reflect.Method method = alertClass.getMethod("renameProject", 
                String.class, Set.class, boolean.class);
            return (String) method.invoke(null, name, projectNames, saveAs);
        } catch (Exception e) {
            System.out.println("RENAME: " + name);
            return name;
        }
    }
    
    /**
     * Get UI executor
     * 
     * @return UI executor
     */
    public UIExecutorInterface getUIExecutor() {
        return uiExecutor;
    }
}