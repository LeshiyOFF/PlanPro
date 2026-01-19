package com.projectlibre1.session.service;

import com.projectlibre1.exchange.FileImporter;
import com.projectlibre1.job.Job;
import com.projectlibre1.job.JobQueue;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.session.LoadOptions;
import com.projectlibre1.session.LocalSession;
import com.projectlibre1.session.SaveOptions;
import com.projectlibre1.session.SessionFactory;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Assertions;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;

/**
 * Tests for LocalSession service wrapper
 * Tests all methods functionality, validation and error handling
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
class LocalSessionServiceTest {
    
    private LocalSessionServiceInterface sessionService;
    private LocalSession mockLocalSession;
    
    @BeforeEach
    void setUp() {
        mockLocalSession = SessionFactory.getInstance().getLocalSession();
        sessionService = LocalSessionServiceFactory.createLocalSessionService(mockLocalSession);
    }
    
    @Test
    @DisplayName("Test getting session identifier")
    void testGetSessionId() {
        long sessionId = sessionService.getSessionId();
        Assertions.assertTrue(sessionId >= 0, "Session ID should be non-negative");
    }
    
    @Test
    @DisplayName("Test session initialization")
    void testSessionInitialization() {
        Assertions.assertFalse(sessionService.isSessionInitialized(), "Session should not be initialized initially");
        
        sessionService.initializeSession(null);
        Assertions.assertTrue(sessionService.isSessionInitialized(), "Session should be initialized after init call");
    }
    
    @Test
    @DisplayName("Test creating close projects job")
    void testCreateCloseProjectsJob() {
        Collection<Project> projects = Arrays.asList(new Project());
        Job job = sessionService.createCloseProjectsJob(projects);
        
        Assertions.assertNotNull(job, "Close projects job should not be null");
        Assertions.assertTrue(job.getName().contains("closeProjects"), "Job name should contain 'closeProjects'");
    }
    
    @Test
    @DisplayName("Test creating load project job")
    void testCreateLoadProjectJob() {
        LoadOptions options = new LoadOptions();
        Job job = sessionService.createLoadProjectJob(options);
        
        Assertions.assertNotNull(job, "Load project job should not be null");
    }
    
    @Test
    @DisplayName("Test creating save project job")
    void testCreateSaveProjectJob() {
        Project project = new Project();
        SaveOptions options = new SaveOptions();
        Job job = sessionService.createSaveProjectJob(project, options);
        
        Assertions.assertNotNull(job, "Save project job should not be null");
    }
    
    @Test
    @DisplayName("Test creating save projects job")
    void testCreateSaveProjectsJob() {
        List<Project> projects = Arrays.asList(new Project());
        SaveOptions options = new SaveOptions();
        Job job = sessionService.createSaveProjectsJob(projects, options);
        
        Assertions.assertNotNull(job, "Save projects job should not be null");
    }
    
    @Test
    @DisplayName("Test getting file importer")
    void testGetFileImporter() {
        String fileName = "test.pod";
        FileImporter importer = sessionService.getFileImporter(fileName);
        
        Assertions.assertNotNull(importer, "File importer should not be null");
    }
    
    @Test
    @DisplayName("Test choosing file name")
    void testChooseFileName() {
        String fileName = sessionService.chooseFileName(true, "test.pod");
        
        Assertions.assertNotNull(fileName, "Chosen file name should not be null");
        Assertions.assertTrue(fileName.length() > 0, "File name should not be empty");
    }
    
    @Test
    @DisplayName("Test checking project existence")
    void testProjectExists() {
        long projectId = 1L;
        boolean exists = sessionService.isProjectExists(projectId);
        
        Assertions.assertNotNull(exists, "Project existence check should not return null");
    }
    
    @Test
    @DisplayName("Test job queue operations")
    void testJobQueueOperations() {
        JobQueue jobQueue = sessionService.getJobQueue();
        Assertions.assertNotNull(jobQueue, "Job queue should not be null");
        
        JobQueue newQueue = new JobQueue();
        sessionService.setJobQueue(newQueue);
        Assertions.assertEquals(newQueue, sessionService.getJobQueue(), "Job queue should be updated");
        
        Job testJob = new Job();
        sessionService.scheduleJob(testJob);
        Assertions.assertTrue(newQueue.contains(testJob), "Job should be scheduled");
    }
    
    @Test
    @DisplayName("Test constructor with null session")
    void testConstructorWithNullSession() {
        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            new LocalSessionService(null);
        }, "Constructor should throw exception for null session");
    }
    
    @Test
    @DisplayName("Test factory methods")
    void testLocalSessionServiceFactory() {
        LocalSessionServiceInterface service1 = LocalSessionServiceFactory.createLocalSessionService();
        Assertions.assertNotNull(service1, "Factory should create service instance");
        
        LocalSessionServiceInterface service2 = LocalSessionServiceFactory.createLocalSessionService(mockLocalSession);
        Assertions.assertNotNull(service2, "Factory should create service with session");
        
        Assertions.assertTrue(service2 instanceof LocalSessionService, "Service should be LocalSessionService instance");
    }
    
    @Test
    @DisplayName("Test validation of null inputs")
    void testValidationOfNullInputs() {
        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            sessionService.createCloseProjectsJob(null);
        }, "Should throw exception for null projects collection");
        
        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            sessionService.createLoadProjectJob(null);
        }, "Should throw exception for null load options");
        
        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            sessionService.createSaveProjectJob(null, new SaveOptions());
        }, "Should throw exception for null project");
        
        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            sessionService.createSaveProjectJob(new Project(), null);
        }, "Should throw exception for null save options");
        
        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            sessionService.getFileImporter(null);
        }, "Should throw exception for null file name");
        
        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            sessionService.getFileImporter("");
        }, "Should throw exception for empty file name");
    }
    
    @Test
    @DisplayName("Test advanced service functionality")
    void testAdvancedServiceFunctionality() {
        LocalSessionService service = (LocalSessionService) sessionService;
        
        // Test getting underlying session
        LocalSession underlyingSession = service.getLocalSession();
        Assertions.assertNotNull(underlyingSession, "Underlying session should not be null");
        Assertions.assertEquals(mockLocalSession, underlyingSession, "Should return wrapped session");
        
        // Test wraps method
        Assertions.assertTrue(service.wraps(mockLocalSession), "Should wrap the mock session");
        
        LocalSession otherSession = new LocalSession();
        Assertions.assertFalse(service.wraps(otherSession), "Should not wrap other session");
    }
}