package com.projectlibre.api.service;

import com.projectlibre.api.storage.NativeStorageAdapter;
import com.projectlibre.api.storage.NativeStoragePort;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.session.Session;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for managing native ProjectLibre files.
 * Uses NativeStorageAdapter for core interactions.
 * 
 * Single Responsibility: High-level file management logic.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
@Service
public class NativeStorageService {
    
    private final NativeStoragePort storagePort;
    private final String basePath;
    
    public NativeStorageService(Session session) {
        this.storagePort = new NativeStorageAdapter(session);
        this.basePath = System.getProperty("user.home") + File.separator + "ПланПро";
        ensureDirectoryExists(new File(basePath));
    }
    
    public SaveResult saveProject(Project project, String filePath, boolean createBackup) {
        return storagePort.saveProject(project, filePath, createBackup);
    }
    
    public LoadResult loadProject(String filePath) {
        return storagePort.loadProject(filePath);
    }
    
    public List<String> listProjects() {
        return listProjects(basePath);
    }
    
    public List<String> listProjects(String directory) {
        List<String> result = new ArrayList<>();
        File dir = new File(directory);
        if (dir.exists() && dir.isDirectory()) {
            File[] files = dir.listFiles((d, name) -> name.endsWith(".pod"));
            if (files != null) {
                for (File f : files) result.add(f.getAbsolutePath());
            }
        }
        return result;
    }
    
    public boolean fileExists(String filePath) {
        return new File(filePath).exists();
    }
    
    public String getBasePath() {
        return basePath;
    }
    
    public String buildFilePath(String projectName) {
        return basePath + File.separator + projectName + ".pod";
    }
    
    public String getFormatVersion() {
        return "ПланПро POD 1.0";
    }
    
    private void ensureDirectoryExists(File dir) {
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }
}
