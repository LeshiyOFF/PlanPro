package com.projectlibre.api.exchange;

import com.projectlibre1.exchange.FileImporter;
import com.projectlibre1.exchange.LocalFileImporter;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.pm.task.ProjectFactory;
import com.projectlibre1.session.Session;
import com.projectlibre1.job.JobQueue;

import java.io.File;
import java.io.InputStream;
import java.lang.reflect.Field;

/**
 * Headless file importer for ProjectLibre projects.
 * Decouples import logic from GUI dependencies like JFileChooser.
 * 
 * Single Responsibility: Import projects from files or streams without GUI.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class HeadlessFileImporter {
    
    private final Session session;
    private final ProjectFactory projectFactory;
    private final CalendarRestorer calendarRestorer;
    
    public HeadlessFileImporter(Session session) {
        this.session = session;
        this.projectFactory = ProjectFactory.getInstance();
        this.calendarRestorer = new CalendarRestorer();
    }
    
    public Project importFile(File file) throws Exception {
        System.out.println("[HeadlessImporter] Importing file: " + file.getAbsolutePath());
        LocalFileImporter importer = new LocalFileImporter();
        injectDependencies(importer);
        
        importer.setFileName(file.getAbsolutePath());
        importer.importFile();
        
        // Get project with timeout safety for async edge cases
        Project project = waitForProjectResult(importer, file.getName());
        return project;
    }
    
    public Project importFile(String filePath) throws Exception {
        return importFile(new File(filePath));
    }
    
    public Project importStream(InputStream inputStream, String fileName) throws Exception {
        System.out.println("[HeadlessImporter] Importing from stream: " + fileName);
        LocalFileImporter importer = new LocalFileImporter();
        injectDependencies(importer);
        
        importer.setFileInputStream(inputStream);
        importer.setFileName(fileName);
        importer.importFile();
        
        // Get project with timeout safety for async edge cases
        Project project = waitForProjectResult(importer, fileName);
        return project;
    }
    
    private void injectDependencies(LocalFileImporter importer) throws Exception {
        // LocalFileImporter inherits from FileImporter which has these fields
        // No 'session' field exists - LocalFileImporter uses SessionFactory internally
        
        Field projectFactoryField = FileImporter.class.getDeclaredField("projectFactory");
        projectFactoryField.setAccessible(true);
        projectFactoryField.set(importer, projectFactory);
        
        JobQueue jobQueue = session.getJobQueue();
        if (jobQueue != null) {
            Field jobQueueField = FileImporter.class.getDeclaredField("jobQueue");
            jobQueueField.setAccessible(true);
            jobQueueField.set(importer, jobQueue);
        }
    }
    
    /**
     * Waits for project import to complete with timeout protection.
     * 
     * Safety mechanism for edge cases where async loading might still occur
     * despite headless mode configuration. In normal headless flow, project
     * should be available immediately due to synchronous loading.
     * 
     * @param importer FileImporter instance
     * @param fileName File name for logging
     * @return Imported project or null if timeout
     * @throws InterruptedException if waiting is interrupted
     */
    private Project waitForProjectResult(LocalFileImporter importer, String fileName) 
            throws InterruptedException {
        Project project = importer.getProject();
        
        if (project != null) {
            System.out.println("[HeadlessImporter] ✅ Project loaded immediately: " + 
                project.getName());
            
            // 🔍 ДИАГНОСТИКА ДАТ: Логируем даты задач сразу после десериализации
            System.out.println("[HeadlessImporter] 📅 Task dates AFTER deserialization:");
            try {
                java.util.Iterator<com.projectlibre1.pm.task.Task> taskIter = project.getTaskOutlineIterator();
                int taskCount = 0;
                while (taskIter.hasNext() && taskCount < 10) {
                    com.projectlibre1.pm.task.Task task = taskIter.next();
                    if (!task.isExternal()) {
                        System.out.println("[HeadlessImporter]   Task '" + task.getName() + "': " +
                            "start=" + new java.util.Date(task.getStart()) + ", " +
                            "end=" + new java.util.Date(task.getEnd()) + ", " +
                            "constraint=" + task.getConstraintType() + ", " +
                            "constraintDate=" + new java.util.Date(task.getConstraintDate()));
                        taskCount++;
                    }
                }
            } catch (Exception e) {
                System.err.println("[HeadlessImporter] Failed to log task dates: " + e.getMessage());
            }
            
            logResourceCalendars(project);
            
            // КРИТИЧЕСКИ ВАЖНО: Восстанавливаем календари после десериализации
            restoreResourceCalendars(project);
            
            return project;
        }
        
        // Safety timeout for async edge cases (should not happen in headless mode)
        System.out.println("[HeadlessImporter] ⚠ Project null, waiting with timeout...");
        int timeoutSeconds = 30;
        int attempts = 0;
        
        while (project == null && attempts < timeoutSeconds) {
            Thread.sleep(1000);
            project = importer.getProject();
            attempts++;
            
            if (attempts % 5 == 0) {
                System.out.println("[HeadlessImporter] Still waiting... (" + 
                    attempts + "/" + timeoutSeconds + "s)");
            }
        }
        
        if (project != null) {
            System.out.println("[HeadlessImporter] ✅ Project loaded after " + 
                attempts + "s: " + project.getName());
        } else {
            System.err.println("[HeadlessImporter] ❌ Timeout (" + timeoutSeconds + 
                "s) waiting for: " + fileName);
        }
        
        return project;
    }
    
    /**
     * КРИТИЧЕСКИЙ МЕТОД: Восстанавливает календари ресурсов после десериализации.
     * V2.0: С предварительной очисткой CalendarService от накопленных дубликатов.
     * 
     * Проблема: После десериализации Core создаёт новые объекты WorkingCalendar
     * с uniqueId=-1 и неправильным именем (совпадает с именем ресурса).
     * 
     * Решение: 
     * 1. Очистка CalendarService от дубликатов
     * 2. Восстановление календарей по uniqueId + имя + fixedId
     */
    private void restoreResourceCalendars(Project project) {
        System.out.println("[HeadlessImporter] 🔧 Restoring resource calendars...");
        
        try {
            // КРИТИЧЕСКАЯ ЗАЩИТА: Очистка CalendarService ПЕРЕД восстановлением
            System.out.println("[HeadlessImporter] 🧹 Pre-restoration CalendarService cleanup...");
            CalendarServiceCleaner cleaner = new CalendarServiceCleaner();
            cleaner.cleanDuplicates();
            System.out.println("[HeadlessImporter] ✅ Cleanup done, removed: " + 
                cleaner.getRemovedCount() + " duplicates");
            
            // Восстановление календарей
            calendarRestorer.restoreCalendars(project);
            System.out.println("[HeadlessImporter] ✅ Calendars restored: " + 
                calendarRestorer.getRestoredCount() + " restored, " + 
                calendarRestorer.getFailedCount() + " failed");
            
            // Логируем результат после восстановления
            System.out.println("[HeadlessImporter] 📅 Resource calendars AFTER restoration:");
            logResourceCalendarsInternal(project);
        } catch (Throwable t) {
            System.err.println("[HeadlessImporter] ❌ Calendar restoration failed: " + 
                t.getMessage());
            t.printStackTrace();
        }
    }
    
    /**
     * Логирует календари ресурсов после десериализации.
     */
    private void logResourceCalendars(Project project) {
        System.out.println("[HeadlessImporter] 📅 Resource calendars AFTER deserialization:");
        
        try {
            if (project.getResourcePool() == null) {
                System.out.println("[HeadlessImporter] ⚠️ ResourcePool is NULL");
                return;
            }
            
            java.util.Collection<?> loadedResources = project.getResourcePool().getResourceList();
            if (loadedResources == null) {
                System.out.println("[HeadlessImporter] ⚠️ ResourceList is NULL");
                return;
            }
            
            int resCount = 0;
            for (Object obj : loadedResources) {
                if (obj instanceof com.projectlibre1.pm.resource.Resource) {
                    com.projectlibre1.pm.resource.Resource r = 
                        (com.projectlibre1.pm.resource.Resource) obj;
                    com.projectlibre1.pm.calendar.WorkCalendar cal = r.getWorkCalendar();
                    if (cal != null && cal instanceof com.projectlibre1.pm.calendar.WorkingCalendar) {
                        com.projectlibre1.pm.calendar.WorkingCalendar wc = 
                            (com.projectlibre1.pm.calendar.WorkingCalendar) cal;
                        com.projectlibre.api.validator.CalendarSafetyValidator.ValidationResult validation = 
                            new com.projectlibre.api.validator.CalendarSafetyValidator().validate(wc);
                        String prefix = !validation.isValid() ? "⚠️ UNSAFE" : "";
                        System.out.println("[HeadlessImporter]   - '" + r.getName() + "' → " + prefix + 
                            " '" + wc.getName() + "' (fixedId=" + wc.getFixedId() + 
                            ", uniqueId=" + wc.getUniqueId() + ")");
                    } else {
                        System.out.println("[HeadlessImporter]   - '" + r.getName() + "' → NO CALENDAR");
                    }
                    resCount++;
                    if (resCount >= 10) break;
                }
            }
        } catch (Exception e) {
            System.err.println("[HeadlessImporter] Failed to log resource calendars: " + 
                e.getMessage());
        }
    }
    
    /**
     * Внутренний метод для логирования календарей (используется после восстановления).
     */
    private void logResourceCalendarsInternal(Project project) {
        try {
            if (project.getResourcePool() == null) return;
            
            java.util.Collection<?> resources = project.getResourcePool().getResourceList();
            if (resources == null) return;
            
            int count = 0;
            for (Object obj : resources) {
                if (obj instanceof com.projectlibre1.pm.resource.Resource) {
                    com.projectlibre1.pm.resource.Resource r = 
                        (com.projectlibre1.pm.resource.Resource) obj;
                    com.projectlibre1.pm.calendar.WorkCalendar cal = r.getWorkCalendar();
                    if (cal instanceof com.projectlibre1.pm.calendar.WorkingCalendar) {
                        com.projectlibre1.pm.calendar.WorkingCalendar wc = 
                            (com.projectlibre1.pm.calendar.WorkingCalendar) cal;
                        System.out.println("[HeadlessImporter]   - '" + r.getName() + 
                            "' → '" + wc.getName() + 
                            "' (fixedId=" + wc.getFixedId() + 
                            ", uniqueId=" + wc.getUniqueId() + ")");
                    }
                    if (++count >= 10) break;
                }
            }
        } catch (Exception e) {
            System.err.println("[HeadlessImporter] Log error: " + e.getMessage());
        }
    }
}
