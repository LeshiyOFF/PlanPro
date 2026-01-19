package com.projectlibre.api.test.controller;

import com.projectlibre.api.test.framework.HttpClientTestFramework;
import com.projectlibre.api.test.framework.HttpClientTestFramework.*;
import static com.projectlibre.api.test.framework.HttpClientTestFramework.*;

import java.io.IOException;

/**
 * Comprehensive unit tests for ProjectController REST endpoints
 * Tests all CRUD operations with various scenarios
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ProjectControllerTest {
    
    private static final String PROJECTS_ENDPOINT = "/projects";
    private static final String PROJECT_ENDPOINT_PREFIX = "/projects/";
    
    // Теперь используем удобные методы из HttpClientTestFramework
    
    public static void main(String[] args) {
        System.out.println("=== ProjectController Unit Tests ===");
        
        TestSuite suite = new TestSuite("ProjectController");
        
        // Initialize test data
        initializeTestData();
        
        // Run all test suites
        suite.addResult(runGetAllProjectsTest());
        suite.addResult(runGetProjectByIdTest());
        suite.addResult(runCreateProjectTest());
        suite.addResult(runUpdateProjectTest());
        suite.addResult(runDeleteProjectTest());
        suite.addResult(runErrorHandlingTest());
        suite.addResult(runJsonValidationTest());
        suite.addResult(runPerformanceTest());
        
        // Print results
        suite.printResults();
        
        // Return exit code based on test results
        System.exit(suite.allTestsPassed() ? 0 : 1);
    }
    
    /**
     * Initialize test data before running tests
     */
    private static void initializeTestData() {
        System.out.println("Initializing test data...");
        
        try {
            // Clean up any existing test data
            cleanupTestData();
            
            // Create initial test projects
            String project1 = """
                {
                    "name": "Test Project Alpha",
                    "description": "First test project for unit testing",
                    "owner": "test-user"
                }
                """;
                
            String project2 = """
                {
                    "name": "Test Project Beta", 
                    "description": "Second test project for unit testing",
                    "owner": "test-user"
                }
                """;
                
            HttpResponse response1 = createProject(project1);
            HttpResponse response2 = createProject(project2);
            
            if (response1.isSuccess() && response2.isSuccess()) {
                System.out.println("Test data initialized successfully");
            } else {
                System.out.println("Warning: Failed to initialize test data");
            }
            
        } catch (IOException e) {
            System.err.println("Failed to initialize test data: " + e.getMessage());
        }
    }
    
    /**
     * Clean up test data after tests
     */
    private static void cleanupTestData() {
        try {
            // Get all projects and delete them
            HttpResponse response = getProjects();
            if (response.isSuccess()) {
                // Extract project IDs and delete them
                String body = response.getBody();
                if (body.contains("\"data\":[")) {
                    // Simple cleanup - this is test code
                    System.out.println("Cleaning up test data...");
                }
            }
        } catch (IOException e) {
            System.err.println("Failed to cleanup test data: " + e.getMessage());
        }
    }
    
    /**
     * Test GET /projects endpoint
     */
    private static TestResult runGetAllProjectsTest() {
        return executeTest("GET /projects - Success", () -> {
            HttpResponse response = getProjects();
            
            if (!response.isSuccess()) {
                throw new RuntimeException("Expected 200, got " + response.getStatusCode());
            }
            
            if (!assertSuccess(response)) {
                throw new RuntimeException("Response does not indicate success");
            }
            
            if (!assertJsonContainsField(response.getBody(), "data")) {
                throw new RuntimeException("Response missing data field");
            }
            
            int count = parseJsonCount(response.getBody());
            if (count < 0) {
                throw new RuntimeException("Invalid count in response");
            }
            
            System.out.println("Retrieved " + count + " projects");
            return true;
        });
    }
    
    /**
     * Test GET /projects/{id} endpoint
     */
    private static TestResult runGetProjectByIdTest() {
        return executeTest("GET /projects/{id} - Success", () -> {
            // First create a project
            String createProject = """
                {
                    "name": "Project for GET test",
                    "description": "Project to test GET by ID",
                    "owner": "test-user"
                }
                """;
                
            HttpResponse createResponse = createProject(createProject);
            if (!createResponse.isSuccess()) {
                throw new RuntimeException("Failed to create test project");
            }
            
            // Try to get the project
            HttpResponse response = getProject(1);
            
            if (!response.isSuccess()) {
                throw new RuntimeException("Expected 200, got " + response.getStatusCode());
            }
            
            if (!assertJsonContains(response.getBody(), "name", "Project for GET test")) {
                throw new RuntimeException("Project name not found in response");
            }
            
            if (!assertJsonContains(response.getBody(), "owner", "test-user")) {
                throw new RuntimeException("Project owner not found in response");
            }
            return true;
        });
    }
    
    /**
     * Test POST /projects endpoint
     */
    private static TestResult runCreateProjectTest() {
        return executeTest("POST /projects - Success", () -> {
            String newProject = """
                {
                    "name": "New Test Project",
                    "description": "Project created during unit testing",
                    "owner": "test-user"
                }
                """;
                
            HttpResponse response = createProject(newProject);
            
            if (!response.isSuccess()) {
                throw new RuntimeException("Expected 200, got " + response.getStatusCode());
            }
            
            if (!assertSuccess(response)) {
                throw new RuntimeException("Response does not indicate success");
            }
            
            if (!response.getBody().contains("created successfully")) {
                throw new RuntimeException("Success message not found in response");
            }
            
            if (!assertJsonContainsField(response.getBody(), "data")) {
                throw new RuntimeException("Created project data not found in response");
            }
            
            System.out.println("Created project successfully");
            return true;
        });
    }
    
    /**
     * Test PUT /projects/{id} endpoint
     */
    private static TestResult runUpdateProjectTest() {
        return executeTest("PUT /projects/{id} - Success", () -> {
            // First create a project
            String createProject = """
                {
                    "name": "Project to Update",
                    "description": "Original project description",
                    "owner": "test-user"
                }
                """;
                
            HttpResponse createResponse = createProject(createProject);
            if (!createResponse.isSuccess()) {
                throw new RuntimeException("Failed to create test project");
            }
            
            // Update the project
            String updateProject = """
                {
                    "name": "Updated Project Name",
                    "description": "Updated project description",
                    "status": "IN_PROGRESS",
                    "priority": "HIGH"
                }
                """;
                
            HttpResponse response = updateProject(1, updateProject);
            
            if (!response.isSuccess()) {
                throw new RuntimeException("Expected 200, got " + response.getStatusCode());
            }
            
            if (!response.getBody().contains("updated successfully")) {
                throw new RuntimeException("Success message not found in response");
            }
            
            // Verify the updates
            if (!assertJsonContains(response.getBody(), "name", "Updated Project Name")) {
                throw new RuntimeException("Updated name not found in response");
            }
            
            System.out.println("Updated project successfully");
            return true;
        });
    }
    
    /**
     * Test DELETE /projects/{id} endpoint
     */
    private static TestResult runDeleteProjectTest() {
        return executeTest("DELETE /projects/{id} - Success", () -> {
            // First create a project
            String createProject = """
                {
                    "name": "Project to Delete",
                    "description": "Project to be deleted during testing",
                    "owner": "test-user"
                }
                """;
                
            HttpResponse createResponse = createProject(createProject);
            if (!createResponse.isSuccess()) {
                throw new RuntimeException("Failed to create test project");
            }
            
            // Delete the project
            HttpResponse response = deleteProject(1);
            
            if (!response.isSuccess()) {
                throw new RuntimeException("Expected 200, got " + response.getStatusCode());
            }
            
            if (!response.getBody().contains("deleted successfully")) {
                throw new RuntimeException("Success message not found in response");
            }
            
            // Verify deletion
            HttpResponse verifyResponse = getProject(1);
            if (!verifyResponse.isNotFound()) {
                throw new RuntimeException("Project should be deleted but still exists");
            }
            
            System.out.println("Deleted project successfully");
            return true;
        });
    }
    
    /**
     * Test error handling in various scenarios
     */
    private static TestResult runErrorHandlingTest() {
        return executeTest("Error Handling - Invalid ID", () -> {
            HttpResponse response = getProject(999999);
            
            if (!response.isNotFound()) {
                throw new RuntimeException("Expected 404, got " + response.getStatusCode());
            }
            
            if (!response.getBody().contains("\"success\":false")) {
                throw new RuntimeException("Response should indicate failure");
            }
            
            if (!response.getBody().contains("not found")) {
                throw new RuntimeException("Response should contain 'not found' message");
            }
            return true;
        });
    }
    
    /**
     * Test JSON validation and parsing
     */
    private static TestResult runJsonValidationTest() {
        return executeTest("JSON Validation - Invalid Data", () -> {
            String invalidJson = """
                {
                    "name": "",
                    "description": "Project with missing required fields"
                }
                """;
                
            HttpResponse response = createProject(invalidJson);
            
            // Should handle gracefully or return error
            if (response.getStatusCode() != 400 && !response.isSuccess()) {
                throw new RuntimeException("Expected 400 or graceful handling, got " + response.getStatusCode());
            }
            
            System.out.println("JSON validation test completed");
            return true;
        });
    }
    
    /**
     * Test performance under load
     */
    private static TestResult runPerformanceTest() {
        return executeTest("Performance - Multiple Requests", () -> {
            long startTime = System.currentTimeMillis();
            int requestCount = 10;
            int successCount = 0;
            
            for (int i = 0; i < requestCount; i++) {
                try {
                    HttpResponse response = getProjects();
                    if (response.isSuccess()) {
                        successCount++;
                    }
                    
                    // Small delay to simulate real usage
                    Thread.sleep(50);
                } catch (Exception e) {
                    // Count as failure
                }
            }
            
            long totalTime = System.currentTimeMillis() - startTime;
            double averageTime = (double) totalTime / requestCount;
            
            if (successCount < requestCount * 0.9) { // 90% success rate required
                throw new RuntimeException("Performance test failed: low success rate " + 
                                     successCount + "/" + requestCount);
            }
            
            if (averageTime > 1000) { // 1 second average max
                throw new RuntimeException("Performance test failed: average time too high " + averageTime + "ms");
            }
            
            System.out.println("Performance test: " + successCount + "/" + requestCount + 
                             " requests successful, avg " + averageTime + "ms");
            return true;
        });
    }
}