package com.projectlibre1.progress;

import com.projectlibre1.job.ExtendedProgressMonitor;
import java.awt.Component;

/**
 * Adapter implementation of IProgressMonitor for Swing environments.
 * Wraps existing ExtendedProgressMonitor for GUI support.
 * 
 * Single Responsibility: GUI-based progress monitoring.
 * Design Pattern: Adapter Pattern.
 * 
 * @author ProjectLibre Team
 * @version 3.0.0
 */
public class SwingProgressMonitor implements IProgressMonitor {
    
    private final ExtendedProgressMonitor delegate;
    
    public SwingProgressMonitor(Component parentComponent, String message, 
                                 String note, int min, int max) {
        this.delegate = new ExtendedProgressMonitor(parentComponent, message, note, min, max);
    }
    
    public SwingProgressMonitor(ExtendedProgressMonitor delegate) {
        this.delegate = delegate;
    }
    
    @Override
    public void setProgress(int progress) {
        delegate.setProgress(progress);
    }
    
    @Override
    public void setNote(String note) {
        delegate.setNote(note);
    }
    
    @Override
    public boolean isCanceled() {
        return delegate.isCanceled();
    }
    
    @Override
    public void close() {
        delegate.close();
    }
    
    @Override
    public void setMinimum(int min) {
        delegate.setMinimum(min);
    }
    
    @Override
    public void setMaximum(int max) {
        delegate.setMaximum(max);
    }
    
    @Override
    public void setMillisToPopup(int millisToPopup) {
        delegate.setMillisToPopup(millisToPopup);
    }
    
    @Override
    public void setMillisToDecideToPopup(int millisToDecideToPopup) {
        delegate.setMillisToDecideToPopup(millisToDecideToPopup);
    }
    
    public ExtendedProgressMonitor getDelegate() {
        return delegate;
    }
}
