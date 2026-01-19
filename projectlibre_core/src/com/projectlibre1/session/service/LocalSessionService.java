package com.projectlibre1.session.service;

import com.projectlibre1.exchange.FileImporter;
import com.projectlibre1.job.Job;
import com.projectlibre1.job.JobQueue;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.session.LoadOptions;
import com.projectlibre1.session.SaveOptions;
import com.projectlibre1.session.LocalSession;
import com.projectlibre1.session.Session;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

/**
 * Service wrapper over LocalSession
 * Provides high-level interface for working with local session
 * Implements proper delegation with validation and error handling
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class LocalSessionService implements LocalSessionServiceInterface {
    
    private final LocalSession localSession;
    
    public LocalSessionService(LocalSession localSession) {
        Objects.requireNonNull(localSession, "LocalSession cannot be null");
        this.localSession = localSession;
    }
    
    public long getSessionId() {
        return localSession.getId();
    }
    
    public boolean isSessionInitialized() {
        return localSession.isInitialized();
    }
    
    public void initializeSession(Object configuration) {
        localSession.init(configuration);
    }
    
    public Job createCloseProjectsJob(Collection<Project> projects) {
        LocalSessionValidator.validateProjectCollection(projects);
        return localSession.getCloseProjectsJob(projects);
    }
    
    public Job createLoadProjectJob(LoadOptions options) {
        LocalSessionValidator.validateLoadOptions(options);
        return localSession.getLoadProjectJob(options);
    }
    
    public Job createSaveProjectJob(Project project, SaveOptions options) {
        LocalSessionValidator.validateProject(project);
        LocalSessionValidator.validateSaveOptions(options);
        return localSession.getSaveProjectJob(project, options);
    }
    
    public Job createSaveProjectsJob(List<Project> projects, SaveOptions options) {
        LocalSessionValidator.validateProjectList(projects);
        LocalSessionValidator.validateSaveOptions(options);
        return localSession.getSaveProjectJob(projects, options);
    }
    
    public FileImporter getFileImporter(String fileName) {
        LocalSessionValidator.validateFileName(fileName);
        return LocalSession.getImporter(fileName);
    }
    
    public String chooseFileName(boolean isSave, String selectedFileName) {
        Objects.requireNonNull(selectedFileName, "Selected file name cannot be null");
        return localSession.chooseFileName(isSave, selectedFileName);
    }
    
    public boolean isProjectExists(long projectId) {
        LocalSessionValidator.validateProjectId(projectId);
        return localSession.projectExists(projectId);
    }
    
    public JobQueue getJobQueue() {
        return localSession.getJobQueue();
    }
    
    public void setJobQueue(JobQueue jobQueue) {
        LocalSessionValidator.validateJobQueue(jobQueue);
        localSession.setJobQueue(jobQueue);
    }
    
    public void scheduleJob(Job job) {
        LocalSessionValidator.validateJob(job);
        localSession.schedule(job);
    }
    
    public LocalSession getLocalSession() {
        return localSession;
    }
    
    public boolean wraps(LocalSession session) {
        return this.localSession.equals(session);
    }
}