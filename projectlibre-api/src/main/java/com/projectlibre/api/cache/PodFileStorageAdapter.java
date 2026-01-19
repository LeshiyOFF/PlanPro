package com.projectlibre.api.cache;

import java.io.*;
import java.nio.file.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Adapter for .pod file storage operations
 * Authoritative source of truth for project persistence
 */
public class PodFileStorageAdapter implements FileStoragePort {
    
    private static volatile PodFileStorageAdapter instance;
    private static final Object LOCK = new Object();
    private static final String FILE_EXTENSION = "pod";
    private static final String BACKUP_SUFFIX = ".bak";
    
    private String basePath;
    
    private PodFileStorageAdapter() {
        this.basePath = getDefaultBasePath();
        ensureDirectoryExists(basePath);
    }
    
    public static PodFileStorageAdapter getInstance() {
        PodFileStorageAdapter result = instance;
        if (result == null) {
            synchronized (LOCK) {
                result = instance;
                if (result == null) {
                    instance = result = new PodFileStorageAdapter();
                }
            }
        }
        return result;
    }
    
    public void setBasePath(String path) {
        this.basePath = path;
        ensureDirectoryExists(basePath);
    }
    
    private String getDefaultBasePath() {
        String userHome = System.getProperty("user.home");
        return Paths.get(userHome, "ProjectLibre", "projects").toString();
    }
    
    private void ensureDirectoryExists(String path) {
        try {
            Files.createDirectories(Paths.get(path));
        } catch (IOException e) {
            System.err.println("[PodStorage] Failed to create directory: " + e.getMessage());
        }
    }
    
    @Override
    public boolean saveToFile(Long projectId, String filePath, byte[] data) {
        try {
            Path path = Paths.get(filePath);
            Files.createDirectories(path.getParent());
            Files.write(path, data, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            System.out.println("[PodStorage] Saved project " + projectId + " to " + filePath);
            return true;
        } catch (IOException e) {
            System.err.println("[PodStorage] Save failed: " + e.getMessage());
            return false;
        }
    }
    
    @Override
    public byte[] loadFromFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (!Files.exists(path)) {
                System.err.println("[PodStorage] File not found: " + filePath);
                return null;
            }
            byte[] data = Files.readAllBytes(path);
            System.out.println("[PodStorage] Loaded file: " + filePath + " (" + data.length + " bytes)");
            return data;
        } catch (IOException e) {
            System.err.println("[PodStorage] Load failed: " + e.getMessage());
            return null;
        }
    }
    
    @Override
    public boolean fileExists(String filePath) {
        return Files.exists(Paths.get(filePath));
    }
    
    @Override
    public boolean deleteFile(String filePath) {
        try {
            return Files.deleteIfExists(Paths.get(filePath));
        } catch (IOException e) {
            System.err.println("[PodStorage] Delete failed: " + e.getMessage());
            return false;
        }
    }
    
    @Override
    public List<String> listProjectFiles(String directoryPath) {
        try {
            Path dir = Paths.get(directoryPath != null ? directoryPath : basePath);
            if (!Files.exists(dir)) return Collections.emptyList();
            
            return Files.list(dir)
                .filter(p -> p.toString().endsWith("." + FILE_EXTENSION))
                .map(Path::toString)
                .collect(Collectors.toList());
        } catch (IOException e) {
            System.err.println("[PodStorage] List failed: " + e.getMessage());
            return Collections.emptyList();
        }
    }
    
    @Override
    public String getFileExtension() {
        return FILE_EXTENSION;
    }
    
    @Override
    public String createBackup(String filePath) {
        try {
            Path source = Paths.get(filePath);
            if (!Files.exists(source)) return null;
            
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            String backupPath = filePath + "." + timestamp + BACKUP_SUFFIX;
            Files.copy(source, Paths.get(backupPath), StandardCopyOption.REPLACE_EXISTING);
            System.out.println("[PodStorage] Backup created: " + backupPath);
            return backupPath;
        } catch (IOException e) {
            System.err.println("[PodStorage] Backup failed: " + e.getMessage());
            return null;
        }
    }
    
    @Override
    public OutputStream getOutputStream(String filePath) {
        try {
            Path path = Paths.get(filePath);
            Files.createDirectories(path.getParent());
            return Files.newOutputStream(path, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        } catch (IOException e) {
            System.err.println("[PodStorage] OutputStream failed: " + e.getMessage());
            return null;
        }
    }
    
    @Override
    public InputStream getInputStream(String filePath) {
        try {
            return Files.newInputStream(Paths.get(filePath));
        } catch (IOException e) {
            System.err.println("[PodStorage] InputStream failed: " + e.getMessage());
            return null;
        }
    }
    
    public String getBasePath() { return basePath; }
    
    public String buildFilePath(String projectName) {
        return Paths.get(basePath, projectName + "." + FILE_EXTENSION).toString();
    }
}
