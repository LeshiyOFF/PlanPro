package com.projectlibre.api.storage;

import com.projectlibre1.pm.task.Project;
import com.projectlibre.api.service.SaveResult;
import com.projectlibre.api.service.LoadResult;

/**
 * Port for native .pod file storage using Java Serialization.
 * Follows Hexagonal Architecture (Ports & Adapters pattern).
 */
public interface NativeStoragePort {
    
    /**
     * Save project to .pod file.
     */
    SaveResult saveProject(Project project, String filePath, boolean createBackup);
    
    /**
     * Load project from .pod file.
     */
    LoadResult loadProject(String filePath);
    
    /**
     * Get the storage format version.
     */
    String getFormatVersion();
}
