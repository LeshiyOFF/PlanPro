package com.projectlibre1.threadsafe;

import com.projectlibre1.job.Job;
import com.projectlibre1.job.JobQueue;

import java.util.Collection;

/**
 * Interface for thread-safe local session
 * Defines contract for thread-safe session operations
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public interface ThreadSafeLocalSessionInterface {
    
    /**
     * Get session ID thread-safe
     * 
     * @return session ID
     */
    long getId();
    
    /**
     * Check if session is initialized thread-safe
     * 
     * @return initialization status
     */
    boolean isInitialized();
    
    /**
     * Initialize session thread-safe
     * 
     * @param configuration session configuration
     */
    void init(Object configuration);
    
    /**
     * Get close projects job thread-safe
     * 
     * @param projects projects to close
     * @return close job
     */
    Job getCloseProjectsJob(Collection projects);
    
    /**
     * Get load project job thread-safe
     * 
     * @param options load options
     * @return load job
     */
    Job getLoadProjectJob(Object options);
    
    /**
     * Get save project job thread-safe
     * 
     * @param project project to save
     * @param options save options
     * @return save job
     */
    Job getSaveProjectJob(Object project, Object options);
    
    /**
     * Check if project exists thread-safe
     * 
     * @param projectId project ID
     * @return existence status
     */
    boolean projectExists(long projectId);
    
    /**
     * Get job queue thread-safe
     * 
     * @return job queue
     */
    JobQueue getJobQueue();
    
    /**
     * Set job queue thread-safe
     * 
     * @param jobQueue job queue
     */
    void setJobQueue(JobQueue jobQueue);
    
    /**
     * Schedule job thread-safe
     * 
     * @param job job to schedule
     */
    void schedule(Job job);
    
    /**
     * Choose file name thread-safe
     * 
     * @param isSave save operation
     * @param selectedFileName selected file name
     * @return chosen file name
     */
    String chooseFileName(boolean isSave, String selectedFileName);
    
    /**
     * Get current operation thread
     * 
     * @return current thread
     */
    Thread getCurrentOperation();
    
    /**
     * Get last access time
     * 
     * @return last access timestamp
     */
    long getLastAccessTime();
    
    /**
     * Check if session is thread-safe
     * 
     * @return true if session provides thread safety
     */
    boolean isThreadSafe();
}