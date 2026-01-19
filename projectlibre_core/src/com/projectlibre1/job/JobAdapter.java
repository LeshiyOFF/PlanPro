package com.projectlibre1.job;

import com.projectlibre1.ui.UIAlert;
import com.projectlibre1.ui.UIExecutorInterface;
import com.projectlibre1.ui.UIThreadExecutor;

/**
 * Job Adapter - provides UI abstraction for Job operations
 * Replaces direct SwingUtilities dependencies
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class JobAdapter {
    
    private final UIExecutorInterface uiExecutor;
    private final UIAlert uiAlert;
    
    public JobAdapter() {
        this.uiExecutor = UIThreadExecutor.getInstance();
        this.uiAlert = new UIAlert(uiExecutor);
    }
    
    public JobAdapter(UIExecutorInterface uiExecutor) {
        this.uiExecutor = uiExecutor != null ? uiExecutor : UIThreadExecutor.getInstance();
        this.uiAlert = new UIAlert(this.uiExecutor);
    }
    
    /**
     * Execute runnable on UI thread (replaces SwingUtilities.invokeLater)
     * 
     * @param runnable task to execute
     */
    public void invokeLater(Runnable runnable) {
        uiExecutor.invokeLater(runnable);
    }
    
    /**
     * Execute progress update on UI thread
     * 
     * @param progressMonitor progress monitor
     * @param progress progress value (0-100)
     * @param note progress note
     */
    public void updateProgress(Object progressMonitor, int progress, String note) {
        uiExecutor.invokeLater(() -> {
            try {
                if (progressMonitor != null) {
                    // Try to use ProgressMonitor methods
                    progressMonitor.getClass().getMethod("setProgress", int.class)
                        .invoke(progressMonitor, progress);
                    progressMonitor.getClass().getMethod("setNote", String.class)
                        .invoke(progressMonitor, note);
                }
            } catch (Exception e) {
                // Fallback to console
                System.out.println("Progress: " + progress + "% - " + note);
            }
        });
    }
    
    /**
     * Close progress monitor on UI thread
     * 
     * @param progressMonitor progress monitor
     */
    public void closeProgress(Object progressMonitor) {
        uiExecutor.invokeLater(() -> {
            try {
                if (progressMonitor != null) {
                    progressMonitor.getClass().getMethod("close")
                        .invoke(progressMonitor);
                }
            } catch (Exception e) {
                // Fallback to console
                System.out.println("Progress closed");
            }
        });
    }
    
    /**
     * Show warning message
     * 
     * @param message warning message
     */
    public void showWarning(String message) {
        uiAlert.warn(message);
    }
    
    /**
     * Show error message
     * 
     * @param message error message
     */
    public void showError(String message) {
        uiAlert.error(message);
    }
    
    /**
     * Show confirmation dialog
     * 
     * @param message confirmation message
     * @return result
     */
    public int showConfirm(String message) {
        return uiAlert.confirm(message);
    }
    
    /**
     * Show ok/cancel dialog
     * 
     * @param message confirmation message
     * @return result
     */
    public boolean showOkCancel(String message) {
        return uiAlert.okCancel(message);
    }
    
    /**
     * Show rename project dialog
     * 
     * @param name current name
     * @param projectNames existing names
     * @param saveAs save as operation
     * @return new name
     */
    public String showRenameDialog(String name, java.util.Set<String> projectNames, boolean saveAs) {
        return uiAlert.renameProject(name, projectNames, saveAs);
    }
    
    /**
     * Get UI executor
     * 
     * @return UI executor
     */
    public UIExecutorInterface getUIExecutor() {
        return uiExecutor;
    }
    
    /**
     * Get UI alert
     * 
     * @return UI alert
     */
    public UIAlert getUIAlert() {
        return uiAlert;
    }
}