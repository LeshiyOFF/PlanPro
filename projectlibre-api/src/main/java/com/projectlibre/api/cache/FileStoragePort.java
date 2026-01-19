package com.projectlibre.api.cache;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

/**
 * Port for file storage operations (.pod files)
 * Authoritative source of truth for persistence
 * Follows Hexagonal Architecture (Ports & Adapters)
 */
public interface FileStoragePort {
    
    /**
     * Save project to file
     * @param projectId project id
     * @param filePath file path
     * @param data serialized data
     * @return true if saved successfully
     */
    boolean saveToFile(Long projectId, String filePath, byte[] data);
    
    /**
     * Load project from file
     * @param filePath file path
     * @return loaded data or null
     */
    byte[] loadFromFile(String filePath);
    
    /**
     * Check if file exists
     * @param filePath file path
     * @return true if exists
     */
    boolean fileExists(String filePath);
    
    /**
     * Delete file
     * @param filePath file path
     * @return true if deleted
     */
    boolean deleteFile(String filePath);
    
    /**
     * List project files in directory
     * @param directoryPath directory path
     * @return list of file paths
     */
    List<String> listProjectFiles(String directoryPath);
    
    /**
     * Get file extension for project files
     * @return file extension (e.g., "pod")
     */
    String getFileExtension();
    
    /**
     * Create backup of file
     * @param filePath original file path
     * @return backup file path
     */
    String createBackup(String filePath);
    
    /**
     * Get output stream for writing
     * @param filePath file path
     * @return output stream
     */
    OutputStream getOutputStream(String filePath);
    
    /**
     * Get input stream for reading
     * @param filePath file path
     * @return input stream
     */
    InputStream getInputStream(String filePath);
}
