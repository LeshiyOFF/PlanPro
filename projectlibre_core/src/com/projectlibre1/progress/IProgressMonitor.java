package com.projectlibre1.progress;

/**
 * Interface for monitoring operation progress.
 * Abstracts GUI dependencies for headless mode compatibility.
 * 
 * Single Responsibility: Define contract for progress indication.
 * Interface Segregation: Minimal set of methods for progress.
 * 
 * @author ProjectLibre Team
 * @version 3.0.0
 */
public interface IProgressMonitor {
    
    /**
     * Sets current progress.
     * 
     * @param progress progress value (0 to maximum)
     */
    void setProgress(int progress);
    
    /**
     * Sets a note about current operation.
     * 
     * @param note current operation description
     */
    void setNote(String note);
    
    /**
     * Checks if operation was canceled by user.
     * 
     * @return true if canceled
     */
    boolean isCanceled();
    
    /**
     * Closes the progress monitor.
     */
    void close();
    
    /**
     * Sets minimum progress value.
     * 
     * @param min minimum value
     */
    void setMinimum(int min);
    
    /**
     * Sets maximum progress value.
     * 
     * @param max maximum value
     */
    void setMaximum(int max);
    
    /**
     * Sets delay before showing popup.
     * 
     * @param millisToPopup milliseconds
     */
    void setMillisToPopup(int millisToPopup);
    
    /**
     * Sets time to decide before showing popup.
     * 
     * @param millisToDecideToPopup milliseconds
     */
    void setMillisToDecideToPopup(int millisToDecideToPopup);
}
