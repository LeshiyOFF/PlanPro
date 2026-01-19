package com.projectlibre1.session.service;

import com.projectlibre1.exchange.FileImporter;
import com.projectlibre1.job.Job;
import com.projectlibre1.job.JobQueue;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.session.LoadOptions;
import com.projectlibre1.session.SaveOptions;

import java.util.Collection;
import java.util.List;

/**
 * Interface of service wrapper over local session
 * Defines contract for working with session in accordance with Dependency Inversion Principle
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public interface LocalSessionServiceInterface {
    
    /**
     * Get unique session identifier
     * 
     * @return session identifier
     */
    long getSessionId();
    
    /**
     * Check if session is initialized
     * 
     * @return true if session is initialized
     */
    boolean isSessionInitialized();
    
    /**
     * Initialize session
     * 
     * @param configuration configuration
     */
    void initializeSession(Object configuration);
    
    /**
     * Create close projects job
     * 
     * @param projects collection of projects to close
     * @return close projects job
     */
    Job createCloseProjectsJob(Collection<Project> projects);
    
    /**
     * Create load project job
     * 
     * @param options load options
     * @return load project job
     */
    Job createLoadProjectJob(LoadOptions options);
    
    /**
     * Create save project job
     * 
     * @param project project to save
     * @param options save options
     * @return save project job
     */
    Job createSaveProjectJob(Project project, SaveOptions options);
    
    /**
     * Create save projects job
     * 
     * @param projects list of projects to save
     * @param options save options
     * @return save projects job
     */
    Job createSaveProjectsJob(List<Project> projects, SaveOptions options);
    
    /**
     * Get file importer by file name
     * 
     * @param fileName file name
     * @return file importer
     */
    FileImporter getFileImporter(String fileName);
    
    /**
     * Choose file name for save/load
     * 
     * @param isSave save operation flag
     * @param selectedFileName selected file name
     * @return resulting file name
     */
    String chooseFileName(boolean isSave, String selectedFileName);
    
    /**
     * Check if project exists
     * 
     * @param projectId project identifier
     * @return true if project exists
     */
    boolean isProjectExists(long projectId);
    
    /**
     * Get session job queue
     * 
     * @return job queue
     */
    JobQueue getJobQueue();
    
    /**
     * Set job queue
     * 
     * @param jobQueue job queue
     */
    void setJobQueue(JobQueue jobQueue);
    
    /**
     * Schedule job
     * 
     * @param job job to schedule
     */
    void scheduleJob(Job job);
}