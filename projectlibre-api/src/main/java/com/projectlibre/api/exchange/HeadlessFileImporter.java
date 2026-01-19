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
    
    public HeadlessFileImporter(Session session) {
        this.session = session;
        this.projectFactory = ProjectFactory.getInstance();
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
}
