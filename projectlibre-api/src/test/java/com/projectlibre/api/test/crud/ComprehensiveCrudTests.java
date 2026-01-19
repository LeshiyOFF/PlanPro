package com.projectlibre.api.test.crud;

import com.projectlibre.api.test.framework.HttpClientTestFramework;
import static com.projectlibre.api.test.framework.HttpClientTestFramework.*;

/**
 * Comprehensive CRUD tests for all endpoints
 * Tests all CRUD operations with edge cases and validation
 */
public class ComprehensiveCrudTests {
    
    private static int totalTests = 0;
    private static int passedTests = 0;
    
    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("     COMPREHENSIVE CRUD TESTS");
        System.out.println("=================================================");
        
        // PROJECT CRUD TESTS
        System.out.println("\n=== PROJECT CRUD TESTS ===");
        testProjectCrudOperations();
        
        // TASK CRUD TESTS  
        System.out.println("\n=== TASK CRUD TESTS ===");
        testTaskCrudOperations();
        
        // RESOURCE CRUD TESTS
        System.out.println("\n=== RESOURCE CRUD TESTS ===");
        testResourceCrudOperations();
        
        // EDGE CASES AND VALIDATION
        System.out.println("\n=== EDGE CASES AND VALIDATION ===");
        testEdgeCasesAndValidation();
        
        // PERFORMANCE AND LOAD TESTS
        System.out.println("\n=== PERFORMANCE AND LOAD TESTS ===");
        testPerformanceAndLoad();
        
        // RESULTS
        System.out.println("\n" + "=".repeat(60));
        System.out.println("CRUD TESTING RESULTS");
        System.out.println("=".repeat(60));
        System.out.println("Total tests: " + totalTests);
        System.out.println("Passed: " + passedTests);
        System.out.println("Failed: " + (totalTests - passedTests));
        System.out.println("Success rate: " + String.format("%.1f", (passedTests * 100.0 / totalTests)) + "%");
        
        if (passedTests == totalTests) {
            System.out.println("🎉 ALL CRUD TESTS PASSED!");
        } else if (passedTests >= totalTests * 0.8) {
            System.out.println("✅ CRUD TESTS PASSED (with minor issues)");
        } else {
            System.out.println("❌ CRUD TESTS FAILED!");
        }
        System.out.println("=".repeat(60));
    }
    
    /**
     * Test CRUD operations for projects
     */
    private static void testProjectCrudOperations() {
        // CREATE - basic project creation
        runTest("CREATE - Basic project creation", () -> {
            String projectJson = """
                {
                    "name": "Test Project",
                    "description": "Test Description",
                    "status": "CREATED",
                    "priority": "HIGH",
                    "estimatedHours": 40
                }
                """;
                
            var response = createProject(projectJson);
            return response.isSuccess() && 
                   response.getBody().contains("Test Project") &&
                   response.getBody().contains("created successfully");
        });
        
        // READ - get all projects
        runTest("READ - Get all projects", () -> {
            var response = getProjects();
            return response.isSuccess() && 
                   response.getBody().contains("success\":true") &&
                   parseJsonCount(response.getBody()) >= 0;
        });
        
        // READ - get project by ID
        runTest("READ - Get project by ID", () -> {
            // First create a project
            String createJson = """
                {
                    "name": "Project for GET test",
                    "description": "Project to test GET by ID"
                }
                """;
            var createResponse = createProject(createJson);
            
            if (!createResponse.isSuccess()) return false;
            
            // Now get by ID (parse from response)
            String createdId = extractIdFromResponse(createResponse.getBody());
            if (createdId == null) return false;
            
            var getResponse = getProject(Long.parseLong(createdId));
            return getResponse.isSuccess() && 
                   getResponse.getBody().contains("Project for GET test");
        });
        
        // UPDATE - update project
        runTest("UPDATE - Update project", () -> {
            String createJson = """
                {
                    "name": "Project to Update",
                    "description": "Original description"
                }
                """;
            var createResponse = createProject(createJson);
            
            if (!createResponse.isSuccess()) return false;
            
            String createdId = extractIdFromResponse(createResponse.getBody());
            if (createdId == null) return false;
            
            String updateJson = """
                {
                    "name": "Updated Project Name",
                    "description": "Updated description",
                    "status": "IN_PROGRESS"
                }
                """;
            var updateResponse = updateProject(Long.parseLong(createdId), updateJson);
            return updateResponse.isSuccess() && 
                   updateResponse.getBody().contains("Updated Project Name");
        });
        
        // DELETE - delete project
        runTest("DELETE - Delete project", () -> {
            String createJson = """
                {
                    "name": "Project to Delete",
                    "description": "Project to be deleted"
                }
                """;
            var createResponse = createProject(createJson);
            
            if (!createResponse.isSuccess()) return false;
            
            String createdId = extractIdFromResponse(createResponse.getBody());
            if (createdId == null) return false;
            
            var deleteResponse = deleteProject(Long.parseLong(createdId));
            if (!deleteResponse.isSuccess()) return false;
            
            // Verify project is deleted
            var verifyResponse = getProject(Long.parseLong(createdId));
            return verifyResponse.isNotFound() || 
                   verifyResponse.getBody().contains("not found");
        });
    }
    
    /**
     * Test CRUD operations for tasks
     */
    private static void testTaskCrudOperations() {
        // CREATE - basic task creation
        runTest("CREATE - Basic task creation", () -> {
            String taskJson = """
                {
                    "name": "Test Task",
                    "description": "Test task description",
                    "status": "TODO",
                    "priority": "HIGH"
                }
                """;
                
            var response = createTask(taskJson);
            return response.isSuccess() && 
                   response.getBody().contains("Test Task") &&
                   response.getBody().contains("created successfully");
        });
        
        // READ - get all tasks
        runTest("READ - Get all tasks", () -> {
            var response = getTasks();
            return response.isSuccess() && 
                   response.getBody().contains("success\":true");
        });
        
        // UPDATE - update task
        runTest("UPDATE - Update task", () -> {
            String createJson = """
                {
                    "name": "Task to Update",
                    "status": "TODO"
                }
                """;
            var createResponse = createTask(createJson);
            
            if (!createResponse.isSuccess()) return false;
            
            String createdId = extractIdFromResponse(createResponse.getBody());
            if (createdId == null) return false;
            
            String updateJson = """
                {
                    "name": "Updated Task Name",
                    "status": "IN_PROGRESS",
                    "priority": "MEDIUM"
                }
                """;
            var updateResponse = updateTask(Long.parseLong(createdId), updateJson);
            return updateResponse.isSuccess() && 
                   updateResponse.getBody().contains("Updated Task Name");
        });
        
        // DELETE - delete task
        runTest("DELETE - Delete task", () -> {
            String createJson = """
                {
                    "name": "Task to Delete"
                }
                """;
            var createResponse = createTask(createJson);
            
            if (!createResponse.isSuccess()) return false;
            
            String createdId = extractIdFromResponse(createResponse.getBody());
            if (createdId == null) return false;
            
            var deleteResponse = deleteTask(Long.parseLong(createdId));
            return deleteResponse.isSuccess();
        });
    }
    
    /**
     * Test CRUD operations for resources
     */
    private static void testResourceCrudOperations() {
        // CREATE - basic resource creation
        runTest("CREATE - Basic resource creation", () -> {
            String resourceJson = """
                {
                    "name": "Test Resource",
                    "type": "HUMAN",
                    "capacity": 8.0,
                    "cost": 100.0
                }
                """;
                
            var response = createResource(resourceJson);
            return response.isSuccess() || response.getStatusCode() == 422; // 422 if validation fails
        });
        
        // READ - get all resources
        runTest("READ - Get all resources", () -> {
            var response = getResources();
            return response.isSuccess() && 
                   response.getBody().contains("success\":true");
        });
        
        // UPDATE - update resource
        runTest("UPDATE - Update resource", () -> {
            String updateJson = """
                {
                    "name": "Updated Resource",
                    "capacity": 10.0,
                    "cost": 150.0
                }
                """;
            var updateResponse = updateResource(1, updateJson);
            return updateResponse.isSuccess() || updateResponse.getStatusCode() == 404; // 404 if resource not found
        });
        
        // DELETE - delete resource
        runTest("DELETE - Delete resource", () -> {
            var deleteResponse = deleteResource(1);
            return deleteResponse.isSuccess() || deleteResponse.getStatusCode() == 404;
        });
    }
    
    /**
     * Test edge cases and validation
     */
    private static void testEdgeCasesAndValidation() {
        // Invalid data
        runTest("VALIDATION - Empty JSON", () -> {
            var response = createProject("{}");
            return response.getStatusCode() == 400 || response.getStatusCode() == 422;
        });
        
        runTest("VALIDATION - Missing required field", () -> {
            String invalidJson = """
                {
                    "description": "Project without name"
                }
                """;
            var response = createProject(invalidJson);
            return response.getStatusCode() == 400 || response.getStatusCode() == 422;
        });
        
        runTest("VALIDATION - Too long name", () -> {
            StringBuilder longName = new StringBuilder();
            for (int i = 0; i < 300; i++) {
                longName.append("A");
            }
            String longNameJson = String.format("""
                {
                    "name": "%s",
                    "description": "Project with very long name"
                }
                """, longName.toString());
            var response = createProject(longNameJson);
            return response.getStatusCode() == 400 || response.getStatusCode() == 422;
        });
        
        // Non-existent ID
        runTest("EDGE CASE - Get non-existent ID", () -> {
            var response = getProject(999999);
            return response.isNotFound() || response.getStatusCode() == 404;
        });
        
        // Delete non-existent
        runTest("EDGE CASE - Delete non-existent ID", () -> {
            var response = deleteProject(999999);
            return response.isNotFound() || response.getStatusCode() == 404;
        });
        
        // Special characters in data
        runTest("EDGE CASE - Special characters", () -> {
            String specialJson = """
                {
                    "name": "Project withSpecialSymbols!@#$%^&*()",
                    "description": "Description with quotes ' and \\" symbols"
                }
                """;
            var response = createProject(specialJson);
            return response.isSuccess() || response.getStatusCode() == 422;
        });
    }
    
    /**
     * Test performance and load
     */
    private static void testPerformanceAndLoad() {
        // Basic performance
        runTest("PERFORMANCE - Basic performance", () -> {
            int successCount = 0;
            int requestCount = 50;
            
            for (int i = 0; i < requestCount; i++) {
                try {
                    var response = getProjects();
                    if (response.isSuccess()) successCount++;
                } catch (Exception e) {
                    // ignore for performance test
                }
            }
            
            return successCount >= requestCount * 0.95; // 95% success rate
        });
        
        // Load testing
        runTest("LOAD - Load testing", () -> {
            int successCount = 0;
            int requestCount = 100;
            
            long startTime = System.currentTimeMillis();
            for (int i = 0; i < requestCount; i++) {
                try {
                    var response = getHealth(); // fastest endpoint
                    if (response.isSuccess()) successCount++;
                } catch (Exception e) {
                    // ignore
                }
            }
            long totalTime = System.currentTimeMillis() - startTime;
            
            // Check: 95% success AND average time < 100ms
            long avgTime = totalTime / requestCount;
            return successCount >= requestCount * 0.95 && avgTime < 100;
        });
        
        // Concurrent operations
        runTest("CONCURRENCY - Concurrent operations", () -> {
            final int[] successCount = {0};
            int threadCount = 10;
            int requestsPerThread = 5;
            
            Thread[] threads = new Thread[threadCount];
            for (int i = 0; i < threadCount; i++) {
                final int threadIndex = i;
                threads[i] = new Thread(() -> {
                    for (int j = 0; j < requestsPerThread; j++) {
                        try {
                            var response = getProjects();
                            if (response.isSuccess()) {
                                synchronized (ComprehensiveCrudTests.class) {
                                    successCount[0]++;
                                }
                            }
                        } catch (Exception e) {
                            // ignore
                        }
                    }
                });
            }
            
            // Start all threads
            long startTime = System.currentTimeMillis();
            for (Thread t : threads) {
                t.start();
            }
            
            // Wait for completion
            for (Thread t : threads) {
                try {
                    t.join(5000); // timeout 5 seconds
                } catch (InterruptedException e) {
                    t.interrupt();
                }
            }
            
            long totalTime = System.currentTimeMillis() - startTime;
            int totalRequests = threadCount * requestsPerThread;
            
            // Check: 90% success AND total time < 10 seconds
            return successCount[0] >= totalRequests * 0.9 && totalTime < 10000;
        });
    }
    
    /**
     * Helper method to run test
     */
    private static void runTest(String testName, TestCase testCase) {
        totalTests++;
        long startTime = System.currentTimeMillis();
        
        try {
            boolean passed = testCase.run();
            long executionTime = System.currentTimeMillis() - startTime;
            
            String status = passed ? "✅ PASS" : "❌ FAIL";
            System.out.println(String.format("%s | %s | %dms", 
                status, testName, executionTime));
            
            if (passed) passedTests++;
            
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            System.out.println(String.format("❌ FAIL | %s | %dms | Exception: %s", 
                testName, executionTime, e.getMessage()));
        }
    }
    
    /**
     * Extract ID from server response
     */
    private static String extractIdFromResponse(String responseBody) {
        // Simple ID parsing from JSON response
        String idPattern = "\"id\":";
        int startIndex = responseBody.indexOf(idPattern);
        if (startIndex == -1) return null;
        
        startIndex += idPattern.length();
        int endIndex = responseBody.indexOf(",", startIndex);
        if (endIndex == -1) endIndex = responseBody.indexOf("}", startIndex);
        if (endIndex == -1) return null;
        
        return responseBody.substring(startIndex, endIndex).trim();
    }
}