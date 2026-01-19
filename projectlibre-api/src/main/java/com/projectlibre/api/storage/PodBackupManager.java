package com.projectlibre.api.storage;

import java.io.File;

/**
 * Управляет созданием резервных копий POD-файлов перед перезаписью.
 * 
 * Single Responsibility: управление бэкапами файлов.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class PodBackupManager {
    
    private static final String BACKUP_EXTENSION = ".bak";
    
    /**
     * Создаёт резервную копию файла, если он существует.
     * 
     * @param file файл для бэкапа
     * @return true если бэкап создан или файл не существует
     */
    public boolean createBackup(File file) {
        if (file == null || !file.exists()) {
            return true;
        }
        
        try {
            String backupPath = file.getAbsolutePath() + BACKUP_EXTENSION;
            File backupFile = new File(backupPath);
            
            if (backupFile.exists()) {
                boolean deleted = backupFile.delete();
                if (!deleted) {
                    System.err.println("[PodBackupManager] ⚠️ Failed to delete old backup");
                }
            }
            
            boolean renamed = file.renameTo(backupFile);
            if (renamed) {
                System.out.println("[PodBackupManager] ✅ Backup created: " + backupPath);
                return true;
            } else {
                System.err.println("[PodBackupManager] ❌ Failed to rename to backup");
                return false;
            }
        } catch (Exception e) {
            System.err.println("[PodBackupManager] ❌ Backup error: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Получает путь к резервной копии файла.
     */
    public String getBackupPath(String filePath) {
        return filePath + BACKUP_EXTENSION;
    }
}
