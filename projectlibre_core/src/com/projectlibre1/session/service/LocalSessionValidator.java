package com.projectlibre1.session.service;

import com.projectlibre1.job.Job;
import com.projectlibre1.job.JobQueue;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.session.LoadOptions;
import com.projectlibre1.session.SaveOptions;

import java.util.Collection;
import java.util.List;

/**
 * Validator for LocalSession operations
 * Provides validation and safety checks for session operations
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class LocalSessionValidator {
    
    /**
     * Private constructor to prevent instantiation
     */
    private LocalSessionValidator() {
        throw new UnsupportedOperationException("Validator class cannot be instantiated");
    }
    
    /**
     * Validate project collection
     * 
     * @param projects collection of projects
     * @throws IllegalArgumentException if validation fails
     */
    public static void validateProjectCollection(Collection<Project> projects) {
        if (projects == null) {
            throw new IllegalArgumentException("Projects collection cannot be null");
        }
    }
    
    /**
     * validate load options
     * 
     * @param options load options
     * @throws IllegalArgumentException if validation fails
     */
    public static void validateLoadOptions(LoadOptions options) {
        if (options == null) {
            throw new IllegalArgumentException("Load options cannot be null");
        }
    }
    
    /**
     * Validate save options
     * 
     * @param options save options
     * @throws IllegalArgumentException if validation fails
     */
    public static void validateSaveOptions(SaveOptions options) {
        if (options == null) {
            throw new IllegalArgumentException("Save options cannot be null");
        }
    }
    
    /**
     * Validate project
     * 
     * @param project project
     * @throws IllegalArgumentException if validation fails
     */
    public static void validateProject(Project project) {
        if (project == null) {
            throw new IllegalArgumentException("Project cannot be null");
        }
    }
    
    /**
     * Validate project list
     * 
     * @param projects list of projects
     * @throws IllegalArgumentException if validation fails
     */
    public static void validateProjectList(List<Project> projects) {
        if (projects == null) {
            throw new IllegalArgumentException("Projects list cannot be null");
        }
    }
    
    /**
     * Validate job
     * 
     * @param job job
     * @throws IllegalArgumentException if validation fails
     */
    public static void validateJob(Job job) {
        if (job == null) {
            throw new IllegalArgumentException("Job cannot be null");
        }
    }
    
    /**
     * Validate job queue
     * 
     * @param jobQueue job queue
     * @throws IllegalArgumentException if validation fails
     */
    public static void validateJobQueue(JobQueue jobQueue) {
        if (jobQueue == null) {
            throw new IllegalArgumentException("Job queue cannot be null");
        }
    }
    
    /**
     * Validate file name
     * 
     * @param fileName file name
     * @throws IllegalArgumentException if validation fails
     */
    public static void validateFileName(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            throw new IllegalArgumentException("File name cannot be null or empty");
        }
    }
    
    /**
     * Validate project ID
     * 
     * @param projectId project ID
     * @throws IllegalArgumentException if validation fails
     */
    public static void validateProjectId(long projectId) {
        if (projectId <= 0) {
            throw new IllegalArgumentException("Project ID must be positive");
        }
    }
}