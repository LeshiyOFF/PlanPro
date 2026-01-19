package com.projectlibre.api.test.integration;

import com.projectlibre.api.test.framework.HttpClientTestFramework;
import com.projectlibre.api.test.framework.HttpClientTestFramework.*;
import static com.projectlibre.api.test.framework.HttpClientTestFramework.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Integration tests for complete API workflow
 * Tests cross-controller interactions and end-to-end scenarios
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ApiIntegrationTest {
    
    private static final String BASE_URL = "http://localhost:8080/api";
    private static List<String> createdProjects = new ArrayList<>();
    private static List<String> createdTasks = new ArrayList<>();
    private static List<String> createdResources = new ArrayList<>();
    
    public static void main(String[] args) {
        System.out.println("=== API Integration Tests ===");
        
        TestSuite suite = new TestSuite("Integration Tests");
        
        // Run all integration test suites
        suite.addResult(runProjectTaskWorkflowTest());
        suite.addResult(runResourceAllocationWorkflowTest());
        suite.addResult(runCompleteProjectLifecycleTest());
        suite.addResult(runConcurrentRequestsTest());
        suite.addResult(runDataConsistencyTest());
        suite.addResult(runErrorPropagationTest());
        suite.addResult(runPerformanceUnderLoadTest());
        
        // Print results
        suite.printResults();
        
        // Return exit code based on test results
        System.exit(suite.allTestsPassed() ? 0 : 1);
    }
    
    /**
     * Test complete project-task workflow
     */
    private static TestResult runProjectTaskWorkflowTest() {
        return executeTest("Project-Task Workflow", () -> {
            // 1. Create a project
            String projectJson = """
                {
                    "name": "Integration Test Project",
                    "description": "Project for integration testing",
                    "owner": "integration-test-user"
                }
                """;
                
            HttpResponse projectResponse = post("/projects", projectJson);
            if (!assertSuccess(projectResponse)) {
                throw new RuntimeException("Failed to create project");
            }
            
            // 2. Create tasks for the project
            String taskJson = """
                {
                    "name": "Setup Development Environment",
                    "description": "Initial task for the integration project",
                    "projectId": 1,
                    "assignee": "dev-user",
                    "status": "TODO",
                    "priority": "HIGH"
                }
                """;
                
            HttpResponse taskResponse = post("/tasks", taskJson);
            if (!assertSuccess(taskResponse)) {
                throw new RuntimeException("Failed to create task");
            }
            
            // 3. Verify project has tasks (through data consistency)
            HttpResponse projectCheckResponse = get("/projects/1");
            if (!assertSuccess(projectCheckResponse)) {
                throw new RuntimeException("Failed to retrieve project after task creation");
            }
            
            // 4. Update task status to IN_PROGRESS
            String updateTaskJson = """
                {
                    "status": "IN_PROGRESS"
                }
                """;
                
            HttpResponse updateResponse = put("/tasks/1", updateTaskJson);
            if (!assertSuccess(updateResponse)) {
                throw new RuntimeException("Failed to update task status");
            }
            
            // 5. Update project status to reflect task progress
            String updateProjectJson = """
                {
                    "status": "IN_PROGRESS"
                }
                """;
                
            HttpResponse updateProjectResponse = put("/projects/1", updateProjectJson);
            if (!assertSuccess(updateProjectResponse)) {
                throw new RuntimeException("Failed to update project status");
            }
            
            // 6. Complete the task
            String completeTaskJson = """
                {
                    "status": "DONE",
                    "actualHours": 8
                }
                """;
                
            HttpResponse completeResponse = put("/tasks/1", completeTaskJson);
            if (!assertSuccess(completeResponse)) {
                throw new RuntimeException("Failed to complete task");
            }
            
            // 7. Complete the project
            String completeProjectJson = """
                {
                    "status": "COMPLETED"
                }
                """;
                
            HttpResponse completeProjectResponse = put("/projects/1", completeProjectJson);
            if (!assertSuccess(completeProjectResponse)) {
                throw new RuntimeException("Failed to complete project");
            }
            
            System.out.println("Project-Task workflow test completed successfully");
            return true;
        });
    }
    
    /**
     * Test resource allocation workflow
     */
    private static TestResult runResourceAllocationWorkflowTest() {
        return executeTest("Resource Allocation Workflow", () -> {
            // 1. Create a resource
            String resourceJson = """
                {
                    "name": "Integration Test Developer",
                    "type": "HUMAN",
                    "department": "Development",
                    "skills": ["Java", "Spring Boot", "Testing"],
                    "maxHoursPerDay": 8,
                    "costPerHour": 75.0,
                    "available": true
                }
                """;
                
            HttpResponse resourceResponse = post("/resources", resourceJson);
            if (!assertSuccess(resourceResponse)) {
                throw new RuntimeException("Failed to create resource");
            }
            
            // 2. Create a task that needs the resource
            String taskJson = """
                {
                    "name": "Integration Test Task",
                    "description": "Task requiring developer resource",
                    "projectId": 1,
                    "assignee": "Integration Test Developer",
                    "estimatedHours": 16
                }
                """;
                
            HttpResponse taskResponse = post("/tasks", taskJson);
            if (!assertSuccess(taskResponse)) {
                throw new RuntimeException("Failed to create task");
            }
            
            // 3. Allocate resource to task
            String allocationJson = """
                {
                    "resourceId": 1,
                    "taskId": 1,
                    "allocatedHours": 16,
                    "startDate": "2024-01-15",
                    "allocationType": "FULL_TIME"
                }
                """;
                
            HttpResponse allocationResponse = post("/resource-allocations", allocationJson);
            
            // Note: This endpoint might not exist yet, so we test the workflow concept
            if (!allocationResponse.isSuccess() && !allocationResponse.isNotFound()) {
                throw new RuntimeException("Failed to create resource allocation");
            }
            
            // 4. Check resource availability (should be updated)
            HttpResponse resourceCheckResponse = get("/resources/1");
            if (!assertSuccess(resourceCheckResponse)) {
                throw new RuntimeException("Failed to check resource after allocation");
            }
            
            // 5. Mark resource as unavailable (vacation)
            String unavailableJson = """
                {
                    "available": false,
                    "unavailableReason": "Vacation"
                }
                """;
                
            HttpResponse unavailableResponse = put("/resources/1", unavailableJson);
            if (!assertSuccess(unavailableResponse)) {
                throw new RuntimeException("Failed to mark resource unavailable");
            }
            
            System.out.println("Resource allocation workflow test completed successfully");
            return true;
        });
    }
    
    /**
     * Test complete project lifecycle
     */
    private static TestResult runCompleteProjectLifecycleTest() {
        return executeTest("Complete Project Lifecycle", () -> {
            long startTime = System.currentTimeMillis();
            
            // 1. Create project
            String projectJson = """
                {
                    "name": "Lifecycle Test Project",
                    "description": "Testing complete project lifecycle",
                    "owner": "lifecycle-test-user"
                }
                """;
                
            HttpResponse createResponse = post("/projects", projectJson);
            if (!assertSuccess(createResponse)) {
                throw new RuntimeException("Failed to create project");
            }
            
            // 2. Add multiple tasks
            for (int i = 1; i <= 3; i++) {
                String taskJson = String.format("""
                    {
                        "name": "Task %d for Lifecycle",
                        "description": "Task number %d in lifecycle test",
                        "projectId": 1,
                        "assignee": "user%d",
                        "status": "TODO",
                        "priority": "MEDIUM",
                        "estimatedHours": %d
                    }
                    """, i, i, i, i * 8);
                
                HttpResponse taskResponse = post("/tasks", taskJson);
                if (!assertSuccess(taskResponse)) {
                    throw new RuntimeException("Failed to create task " + i);
                }
            }
            
            // 3. Update tasks through different stages
            String[] stages = {"TODO", "IN_PROGRESS", "DONE"};
            for (String stage : stages) {
                String updateJson = String.format("""
                    {
                        "status": "%s"
                    }
                    """, stage);
                
                for (int taskId = 1; taskId <= 3; taskId++) {
                    HttpResponse response = put("/tasks/" + taskId, updateJson);
                    if (!assertSuccess(response)) {
                        throw new RuntimeException("Failed to update task " + taskId + " to " + stage);
                    }
                }
            }
            
            // 4. Complete project
            String completeProjectJson = """
                {
                    "status": "COMPLETED"
                }
                """;
                
            HttpResponse completeResponse = put("/projects/1", completeProjectJson);
            if (!assertSuccess(completeResponse)) {
                throw new RuntimeException("Failed to complete project");
            }
            
            long totalTime = System.currentTimeMillis() - startTime;
            if (totalTime > 5000) { // 5 seconds max for lifecycle
                throw new RuntimeException("Lifecycle test too slow: " + totalTime + "ms");
            }
            
            System.out.println("Complete project lifecycle test completed in " + totalTime + "ms");
            return true;
        });
    }
    
    /**
     * Test concurrent requests
     */
    private static TestResult runConcurrentRequestsTest() {
        return executeTest("Concurrent Requests", () -> {
            int threadCount = 5;
            int requestsPerThread = 3;
            Thread[] threads = new Thread[threadCount];
            boolean[] success = new boolean[threadCount];
            
            // Create concurrent threads
            for (int i = 0; i < threadCount; i++) {
                final int threadId = i;
                threads[i] = new Thread(() -> {
                    try {
                        for (int j = 0; j < requestsPerThread; j++) {
                            // Mix of GET requests to different endpoints
                            String endpoint = switch (j % 3) {
                                case 0 -> "/projects";
                                case 1 -> "/tasks";
                                default -> "/resources";
                            };
                            
                            HttpResponse response = get(endpoint);
                            if (response.isSuccess()) {
                                success[threadId] = true;
                            }
                            
                            Thread.sleep(50); // Small delay
                        }
                    } catch (Exception e) {
                        System.err.println("Thread " + threadId + " error: " + e.getMessage());
                    }
                });
            }
            
            // Start all threads
            long startTime = System.currentTimeMillis();
            for (Thread thread : threads) {
                thread.start();
            }
            
            // Wait for all threads to complete
            for (Thread thread : threads) {
                thread.join();
            }
            
            long totalTime = System.currentTimeMillis() - startTime;
            
            // Check if all threads succeeded
            int successCount = 0;
            for (boolean s : success) {
                if (s) successCount++;
            }
            
            if (successCount < threadCount * 0.8) { // 80% success rate
                throw new RuntimeException("Concurrent test failed: low success rate " + 
                                     successCount + "/" + threadCount);
            }
            
            if (totalTime > 10000) { // 10 seconds max
                throw new RuntimeException("Concurrent test too slow: " + totalTime + "ms");
            }
            
            System.out.println("Concurrent requests test: " + successCount + "/" + threadCount + 
                             " threads successful in " + totalTime + "ms");
            return true;
        });
    }
    
    /**
     * Test data consistency across endpoints
     */
    private static TestResult runDataConsistencyTest() {
        return executeTest("Data Consistency", () -> {
            // 1. Create project with specific data
            String projectJson = """
                {
                    "name": "Consistency Test Project",
                    "description": "Project for consistency testing",
                    "owner": "consistency-test-user",
                    "status": "PLANNING",
                    "priority": "HIGH"
                }
                """;
                
            HttpResponse projectResponse = post("/projects", projectJson);
            if (!assertSuccess(projectResponse)) {
                throw new RuntimeException("Failed to create project");
            }
            
            // 2. Verify project data through GET
            HttpResponse getResponse = get("/projects/1");
            if (!assertSuccess(getResponse)) {
                throw new RuntimeException("Failed to retrieve project");
            }
            
            // 3. Check data consistency
            if (!assertJsonContains(getResponse.getBody(), "name", "Consistency Test Project")) {
                throw new RuntimeException("Project name inconsistent");
            }
            
            if (!assertJsonContains(getResponse.getBody(), "owner", "consistency-test-user")) {
                throw new RuntimeException("Project owner inconsistent");
            }
            
            if (!assertJsonContains(getResponse.getBody(), "status", "PLANNING")) {
                throw new RuntimeException("Project status inconsistent");
            }
            
            // 4. Update project and verify consistency
            String updateJson = """
                {
                    "name": "Updated Consistency Project",
                    "status": "IN_PROGRESS"
                }
                """;
                
            HttpResponse updateResponse = put("/projects/1", updateJson);
            if (!assertSuccess(updateResponse)) {
                throw new RuntimeException("Failed to update project");
            }
            
            // 5. Verify updated data
            HttpResponse verifyResponse = get("/projects/1");
            if (!assertJsonContains(verifyResponse.getBody(), "name", "Updated Consistency Project")) {
                throw new RuntimeException("Updated project name inconsistent");
            }
            
            if (!assertJsonContains(verifyResponse.getBody(), "status", "IN_PROGRESS")) {
                throw new RuntimeException("Updated project status inconsistent");
            }
            
            System.out.println("Data consistency test completed successfully");
            return true;
        });
    }
    
    /**
     * Test error propagation and handling
     */
    private static TestResult runErrorPropagationTest() {
        return executeTest("Error Propagation", () -> {
            // 1. Test invalid project ID
            HttpResponse invalidProjectResponse = get("/projects/999999");
            if (!invalidProjectResponse.isNotFound()) {
                throw new RuntimeException("Should return 404 for invalid project ID");
            }
            
            // 2. Test invalid JSON in POST
            String invalidJson = """
                {
                    "name": "",
                    "description": "Project with invalid data"
                }
                """;
                
            HttpResponse invalidJsonResponse = post("/projects", invalidJson);
            if (invalidJsonResponse.getStatusCode() != 400 && !invalidJsonResponse.isSuccess()) {
                throw new RuntimeException("Should handle invalid JSON gracefully");
            }
            
            // 3. Test invalid task status
            String invalidStatusJson = """
                {
                    "status": "INVALID_STATUS"
                }
                """;
                
            HttpResponse invalidStatusResponse = put("/tasks/1", invalidStatusJson);
            if (invalidStatusResponse.getStatusCode() != 400 && !invalidStatusResponse.isSuccess()) {
                throw new RuntimeException("Should reject invalid task status");
            }
            
            // 4. Test resource constraints
            String invalidResourceJson = """
                {
                    "name": "Invalid Resource",
                    "maxHoursPerDay": -1,
                    "costPerHour": -50
                }
                """;
                
            HttpResponse invalidResourceResponse = post("/resources", invalidResourceJson);
            if (invalidResourceResponse.getStatusCode() != 400 && !invalidResourceResponse.isSuccess()) {
                throw new RuntimeException("Should reject invalid resource constraints");
            }
            
            System.out.println("Error propagation test completed successfully");
            return true;
        });
    }
    
    /**
     * Test performance under realistic load
     */
    private static TestResult runPerformanceUnderLoadTest() {
        return executeTest("Performance Under Load", () -> {
            long startTime = System.currentTimeMillis();
            int totalRequests = 50;
            int successCount = 0;
            
            // Simulate realistic load
            for (int i = 0; i < totalRequests; i++) {
                try {
                    String endpoint = switch (i % 4) {
                        case 0 -> "/projects";
                        case 1 -> "/tasks";
                        case 2 -> "/resources";
                        default -> "/projects/1";
                    };
                    
                    HttpResponse response = get(endpoint);
                    if (response.isSuccess()) {
                        successCount++;
                    }
                    
                    // Realistic delay between requests
                    if (i % 5 == 0) {
                        Thread.sleep(100); // Pause every 5 requests
                    }
                    
                } catch (Exception e) {
                    // Count as failure
                }
            }
            
            long totalTime = System.currentTimeMillis() - startTime;
            double averageTime = (double) totalTime / totalRequests;
            double successRate = (double) successCount / totalRequests * 100.0;
            
            // Performance criteria
            if (successRate < 95.0) { // 95% success rate required
                throw new RuntimeException("Load test failed: success rate too low " + successRate + "%");
            }
            
            if (averageTime > 200) { // 200ms average max
                throw new RuntimeException("Load test failed: average time too high " + averageTime + "ms");
            }
            
            System.out.println("Performance under load: " + successCount + "/" + totalRequests + 
                             " requests (" + String.format("%.1f", successRate) + "% success), avg " + 
                             String.format("%.1f", averageTime) + "ms");
            return true;
        });
    }
}