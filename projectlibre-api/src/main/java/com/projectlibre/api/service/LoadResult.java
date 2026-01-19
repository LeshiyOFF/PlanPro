package com.projectlibre.api.service;

import com.projectlibre1.pm.task.Project;

/**
 * Result class for load operations.
 */
public final class LoadResult {
    
    private final boolean success;
    private final Project project;
    private final String filePath;
    private final String error;
    
    private LoadResult(boolean success, Project project, String filePath, String error) {
        this.success = success;
        this.project = project;
        this.filePath = filePath;
        this.error = error;
    }
    
    public static LoadResult success(Project project, String filePath) {
        return new LoadResult(true, project, filePath, null);
    }
    
    public static LoadResult error(String error) {
        return new LoadResult(false, null, null, error);
    }
    
    public boolean isSuccess() { return success; }
    public Project getProject() { return project; }
    public String getFilePath() { return filePath; }
    public String getError() { return error; }
}
