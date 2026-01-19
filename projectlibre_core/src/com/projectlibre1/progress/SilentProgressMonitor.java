package com.projectlibre1.progress;

/**
 * Headless implementation of IProgressMonitor.
 * Logs progress to console instead of showing GUI dialogs.
 * 
 * Single Responsibility: Non-interactive progress monitoring.
 * 
 * @author ProjectLibre Team
 * @version 3.0.0
 */
public class SilentProgressMonitor implements IProgressMonitor {
    
    private final String taskName;
    private final boolean verbose;
    private int currentProgress = 0;
    private int min = 0;
    private int max = 100;
    private boolean canceled = false;
    
    public SilentProgressMonitor(String taskName, boolean verbose) {
        this.taskName = taskName;
        this.verbose = verbose;
        logIfVerbose("Starting task: " + taskName);
    }
    
    @Override
    public void setProgress(int progress) {
        this.currentProgress = progress;
        if (verbose && (progress % 10 == 0)) {
            logIfVerbose("Progress: " + progress + "%");
        }
    }
    
    @Override
    public void setNote(String note) {
        logIfVerbose("Note: " + note);
    }
    
    @Override
    public boolean isCanceled() {
        return canceled;
    }
    
    @Override
    public void close() {
        logIfVerbose("Task completed: " + taskName);
    }
    
    @Override
    public void setMinimum(int min) {
        this.min = min;
    }
    
    @Override
    public void setMaximum(int max) {
        this.max = max;
    }
    
    @Override
    public void setMillisToPopup(int millisToPopup) {
        // No popup in silent mode
    }
    
    @Override
    public void setMillisToDecideToPopup(int millisToDecideToPopup) {
        // No popup in silent mode
    }
    
    public void cancel() {
        this.canceled = true;
        logIfVerbose("Task canceled: " + taskName);
    }
    
    private void logIfVerbose(String message) {
        if (verbose) {
            System.out.println("[SilentMonitor] " + message);
        }
    }
}
