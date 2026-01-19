package com.projectlibre.api.storage;

import com.projectlibre.api.exchange.HeadlessFileImporter;
import com.projectlibre.api.service.LoadResult;
import com.projectlibre.api.service.SaveResult;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.session.Session;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.AtomicMoveNotSupportedException;

/**
 * Adapter for native .pod file storage.
 * Uses PodFormatWriter for correct POD format (DocumentData + XML).
 * Uses PodBackupManager for safe file replacement.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
public class NativeStorageAdapter implements NativeStoragePort {
    
    private final Session session;
    private final PodFormatWriter formatWriter;
    private final PodBackupManager backupManager;
    
    public NativeStorageAdapter(Session session) {
        this.session = session;
        this.formatWriter = new PodFormatWriter();
        this.backupManager = new PodBackupManager();
    }
    
    @Override
    public SaveResult saveProject(Project project, String filePath, boolean createBackup) {
        File targetFile = null;
        File tempFile = null;
        
        try {
            System.out.println("[NativeStorage] Saving: " + project.getName());
            System.out.println("[NativeStorage] Target: " + filePath);
            
            targetFile = new File(filePath);
            ensureParentDirectory(targetFile);
            
            tempFile = createTempFile(targetFile);
            
            if (createBackup && targetFile.exists()) {
                backupManager.createBackup(targetFile);
            }
            
            writeProjectToTempFile(project, tempFile);
            replaceFinalFile(tempFile, targetFile);
            
            System.out.println("[NativeStorage] ✅ Save completed: " + filePath);
            return SaveResult.success(filePath, 
                createBackup ? backupManager.getBackupPath(filePath) : null);
                
        } catch (Exception e) {
            System.err.println("[NativeStorage] ❌ Save failed: " + e.getMessage());
            e.printStackTrace();
            cleanupTempFile(tempFile);
            return SaveResult.error(e.getMessage());
        }
    }
    
    @Override
    public LoadResult loadProject(String filePath) {
        try {
            System.out.println("[NativeStorage] Loading: " + filePath);
            File file = new File(filePath);
            
            if (!file.exists()) return LoadResult.error("Not found");
            
            HeadlessFileImporter importer = new HeadlessFileImporter(session);
            Project project = importer.importFile(file);
            
            if (project == null) return LoadResult.error("Null project");
            
            // ✅ CRITICAL FIX: Set fileName (used for getTitle() and future saves)
            project.setFileName(filePath);
            System.out.println("[NativeStorage] ✅ Set fileName: " + filePath);
            
            // ✅ FALLBACK: If project name is empty, use file name
            String projectName = project.getName();
            if (projectName == null || projectName.trim().isEmpty()) {
                String fileName = file.getName();
                String nameWithoutExt = fileName.replaceFirst("[.][^.]+$", ""); // Remove extension
                
                // Protection: handle edge case of files like ".pod" (only extension)
                if (nameWithoutExt.isEmpty()) {
                    nameWithoutExt = "Unnamed Project";
                }
                
                project.setName(nameWithoutExt);
                System.out.println("[NativeStorage] ✅ Set fallback project name: " + nameWithoutExt);
            } else {
                System.out.println("[NativeStorage] ℹ Project name already set: " + projectName);
            }
            
            // ✅ SYNC: ResourcePool name should match project name (mimics GUI behavior)
            if (project.getResourcePool() != null) {
                project.getResourcePool().setName(project.getName());
                System.out.println("[NativeStorage] ✅ Synced ResourcePool name: " + project.getName());
            }
            
            return LoadResult.success(project, filePath);
        } catch (Exception e) {
            System.err.println("[NativeStorage] ❌ Load failed: " + e.getMessage());
            e.printStackTrace();
            return LoadResult.error(e.getMessage());
        }
    }
    
    @Override
    public String getFormatVersion() {
        return "ПланПро POD 1.0";
    }
    
    /**
     * Создаёт родительскую директорию для файла, если её нет.
     */
    private void ensureParentDirectory(File file) {
        File parent = file.getParentFile();
        if (parent != null && !parent.exists()) {
            boolean created = parent.mkdirs();
            if (created) {
                System.out.println("[NativeStorage] ✅ Created directory: " + parent);
            }
        }
    }
    
    /**
     * Создаёт временный файл для безопасной записи.
     */
    private File createTempFile(File targetFile) {
        String path = targetFile.getAbsolutePath();
        String extension = "";
        String baseName = path;
        
        int dotIndex = path.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = path.substring(dotIndex);
            baseName = path.substring(0, dotIndex);
        }
        
        File tempFile = targetFile;
        for (int i = 0; tempFile.exists(); i++) {
            String tempPath = baseName + "_tmp" + i + extension;
            tempFile = new File(tempPath);
        }
        
        return tempFile;
    }
    
    /**
     * Записывает проект во временный файл.
     */
    private void writeProjectToTempFile(Project project, File tempFile) throws Exception {
        System.out.println("[NativeStorage] Writing to temp: " + tempFile.getName());
        
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            formatWriter.write(project, fos);
        }
        
        if (!tempFile.exists() || tempFile.length() == 0) {
            throw new IllegalStateException("Temp file is empty or not created");
        }
        
        System.out.println("[NativeStorage] ✅ Temp file written: " + 
            tempFile.length() + " bytes");
    }
    
    /**
     * Заменяет целевой файл временным используя Java NIO.
     * Использует атомарное перемещение когда возможно.
     * Включает retry-логику для Windows file locking.
     */
    private void replaceFinalFile(File tempFile, File targetFile) throws IOException {
        Path tempPath = tempFile.toPath();
        Path targetPath = targetFile.toPath();
        
        IOException lastException = null;
        
        for (int attempt = 0; attempt < 3; attempt++) {
            try {
                if (attempt > 0) {
                    System.out.println("[NativeStorage] ⚠️ Retry attempt " + 
                        (attempt + 1) + "/3");
                    Thread.sleep(100 * attempt);
                }
                
                try {
                    Files.move(tempPath, targetPath,
                        StandardCopyOption.REPLACE_EXISTING,
                        StandardCopyOption.ATOMIC_MOVE);
                    System.out.println("[NativeStorage] ✅ File replaced (atomic)");
                    return;
                    
                } catch (AtomicMoveNotSupportedException e) {
                    Files.move(tempPath, targetPath,
                        StandardCopyOption.REPLACE_EXISTING);
                    System.out.println("[NativeStorage] ✅ File replaced (non-atomic)");
                    return;
                }
                
            } catch (IOException e) {
                lastException = e;
                if (attempt == 2) {
                    System.err.println("[NativeStorage] ❌ All retry attempts failed");
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IOException("Interrupted during file replacement", e);
            }
        }
        
        throw new IOException("Failed to replace file after 3 attempts", lastException);
    }
    
    /**
     * Удаляет временный файл при ошибке.
     */
    private void cleanupTempFile(File tempFile) {
        if (tempFile != null && tempFile.exists()) {
            boolean deleted = tempFile.delete();
            if (deleted) {
                System.out.println("[NativeStorage] ✅ Cleaned up temp file");
            }
        }
    }
}
