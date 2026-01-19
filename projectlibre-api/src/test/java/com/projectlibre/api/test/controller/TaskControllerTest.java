package com.projectlibre.api.test.controller;

import com.projectlibre.api.test.framework.HttpClientTestFramework;
import com.projectlibre.api.test.framework.HttpClientTestFramework.*;
import static com.projectlibre.api.test.framework.HttpClientTestFramework.*;

import java.io.IOException;

/**
 * Comprehensive unit tests for TaskController REST endpoints
 * Tests all CRUD operations with hierarchical task support
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class TaskControllerTest {
    
    private static final String TASKS_ENDPOINT = "/tasks";
    private static final String TASK_ENDPOINT_PREFIX = "/tasks/";
    
    // Теперь используем удобные методы из HttpClientTestFramework
    
    public static void main(String[] args) {
        System.out.println("=== TaskController Unit Tests ===");
        
        TestSuite suite = new TestSuite("TaskController");
        
        // Initialize test data
        initializeTestData();
        
        // Run all test suites
        suite.addResult(runGetAllTasksTest());
        suite.addResult(runGetTaskByIdTest());
        suite.addResult(runCreateTaskTest());
        suite.addResult(runUpdateTaskTest());
        suite.addResult(runDeleteTaskTest());
        suite.addResult(runHierarchicalTaskTest());
        suite.addResult(runTaskDependenciesTest());
        suite.addResult(runTaskStatusTest());
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
        System.out.println("Initializing test data for tasks...");
        
        try {
            // Create initial test tasks
            String task1 = """
                {
                    "name": "Setup Development Environment",
                    "description": "Configure development tools and environment",
                    "projectId": 1,
                    "assignee": "dev-user",
                    "status": "TODO",
                    "priority": "HIGH",
                    "estimatedHours": 8
                }
                """;
                
            String task2 = """
                {
                    "name": "Design Database Schema",
                    "description": "Create database schema for the application",
                    "projectId": 1,
                    "assignee": "db-user",
                    "status": "IN_PROGRESS",
                    "priority": "MEDIUM",
                    "estimatedHours": 16
                }
                """;
                
            HttpResponse response1 = createTask(task1);
            HttpResponse response2 = createTask(task2);
            
            if (response1.isSuccess() && response2.isSuccess()) {
                System.out.println("Task test data initialized successfully");
            } else {
                System.out.println("Warning: Failed to initialize task test data");
            }
            
        } catch (IOException e) {
            System.err.println("Failed to initialize task test data: " + e.getMessage());
        }
    }
    
    /**
     * Test GET /tasks endpoint
     */
    private static TestResult runGetAllTasksTest() {
        return executeTest("GET /tasks - Success", () -> {
            HttpResponse response = getTasks();
            
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
            
            System.out.println("Retrieved " + count + " tasks");
            return true;
        });
    }
    
    /**
     * Test GET /tasks/{id} endpoint
     */
    private static TestResult runGetTaskByIdTest() {
        return executeTest("GET /tasks/{id} - Success", () -> {
            // First create a task
            String createTask = """
                {
                    "name": "Task for GET test",
                    "description": "Task to test GET by ID functionality",
                    "projectId": 1,
                    "assignee": "test-user",
                    "status": "TODO",
                    "priority": "LOW"
                }
                """;
                
            HttpResponse createResponse = post(TASKS_ENDPOINT, createTask);
            if (!createResponse.isSuccess()) {
                throw new RuntimeException("Failed to create test task");
            }
            
            // Try to get the task
            HttpResponse response = get(TASK_ENDPOINT_PREFIX + "1");
            
            if (!response.isSuccess()) {
                throw new RuntimeException("Expected 200, got " + response.getStatusCode());
            }
            
            if (!assertJsonContains(response.getBody(), "name", "Task for GET test")) {
                throw new RuntimeException("Task name not found in response");
            }
            
            if (!assertJsonContains(response.getBody(), "assignee", "test-user")) {
                throw new RuntimeException("Task assignee not found in response");
            }
            return true;
        });
    }
    
    /**
     * Test POST /tasks endpoint
     */
    private static TestResult runCreateTaskTest() {
        return executeTest("POST /tasks - Success", () -> {
            String newTask = """
                {
                    "name": "New Test Task",
                    "description": "Task created during unit testing",
                    "projectId": 1,
                    "assignee": "test-user",
                    "status": "TODO",
                    "priority": "MEDIUM",
                    "estimatedHours": 12
                }
                """;
                
            HttpResponse response = post(TASKS_ENDPOINT, newTask);
            
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
                throw new RuntimeException("Created task data not found in response");
            }
            
            System.out.println("Created task successfully");
            return true;
        });
    }
    
    /**
     * Test PUT /tasks/{id} endpoint
     */
    private static TestResult runUpdateTaskTest() {
        return executeTest("PUT /tasks/{id} - Success", () -> {
            // First create a task
            String createTask = """
                {
                    "name": "Task to Update",
                    "description": "Original task description",
                    "projectId": 1,
                    "assignee": "test-user",
                    "status": "TODO",
                    "priority": "LOW"
                }
                """;
                
            HttpResponse createResponse = post(TASKS_ENDPOINT, createTask);
            if (!createResponse.isSuccess()) {
                throw new RuntimeException("Failed to create test task");
            }
            
            // Update the task
            String updateTask = """
                {
                    "name": "Updated Task Name",
                    "description": "Updated task description",
                    "status": "IN_PROGRESS",
                    "priority": "HIGH",
                    "actualHours": 8
                }
                """;
                
            HttpResponse response = put(TASK_ENDPOINT_PREFIX + "1", updateTask);
            
            if (!response.isSuccess()) {
                throw new RuntimeException("Expected 200, got " + response.getStatusCode());
            }
            
            if (!response.getBody().contains("updated successfully")) {
                throw new RuntimeException("Success message not found in response");
            }
            
            // Verify the updates
            if (!assertJsonContains(response.getBody(), "name", "Updated Task Name")) {
                throw new RuntimeException("Updated name not found in response");
            }
            
            System.out.println("Updated task successfully");
            return true;
        });
    }
    
    /**
     * Test DELETE /tasks/{id} endpoint
     */
    private static TestResult runDeleteTaskTest() {
        return executeTest("DELETE /tasks/{id} - Success", () -> {
            // First create a task
            String createTask = """
                {
                    "name": "Task to Delete",
                    "description": "Task to be deleted during testing",
                    "projectId": 1,
                    "assignee": "test-user",
                    "status": "TODO",
                    "priority": "LOW"
                }
                """;
                
            HttpResponse createResponse = post(TASKS_ENDPOINT, createTask);
            if (!createResponse.isSuccess()) {
                throw new RuntimeException("Failed to create test task");
            }
            
            // Delete the task
            HttpResponse response = delete(TASK_ENDPOINT_PREFIX + "1");
            
            if (!response.isSuccess()) {
                throw new RuntimeException("Expected 200, got " + response.getStatusCode());
            }
            
            if (!response.getBody().contains("deleted successfully")) {
                throw new RuntimeException("Success message not found in response");
            }
            
            // Verify deletion
            HttpResponse verifyResponse = get(TASK_ENDPOINT_PREFIX + "1");
            if (!verifyResponse.isNotFound()) {
                throw new RuntimeException("Task should be deleted but still exists");
            }
            
            System.out.println("Deleted task successfully");
            return true;
        });
    }
    
    /**
     * Test hierarchical task relationships
     */
    private static TestResult runHierarchicalTaskTest() {
        return executeTest("Hierarchical Tasks - Parent/Child", () -> {
            // Create parent task
            String parentTask = """
                {
                    "name": "Parent Task",
                    "description": "Main task with subtasks",
                    "projectId": 1,
                    "assignee": "test-user",
                    "status": "IN_PROGRESS",
                    "priority": "HIGH"
                }
                """;
                
            HttpResponse parentResponse = post(TASKS_ENDPOINT, parentTask);
            if (!parentResponse.isSuccess()) {
                throw new RuntimeException("Failed to create parent task");
            }
            
            // Create child task
            String childTask = """
                {
                    "name": "Child Subtask",
                    "description": "Subtask of the parent task",
                    "projectId": 1,
                    "assignee": "test-user",
                    "status": "TODO",
                    "priority": "MEDIUM",
                    "parentId": 1
                }
                """;
                
            HttpResponse childResponse = post(TASKS_ENDPOINT, childTask);
            
            if (!childResponse.isSuccess()) {
                throw new RuntimeException("Failed to create child task");
            }
            
            if (!assertJsonContainsField(childResponse.getBody(), "parentId")) {
                throw new RuntimeException("Child task should have parentId");
            }
            
            System.out.println("Hierarchical task test completed successfully");
            return true;
        });
    }
    
    /**
     * Test task dependencies functionality
     */
    private static TestResult runTaskDependenciesTest() {
        return executeTest("Task Dependencies - Prerequisites", () -> {
            // Create task with dependencies
            String taskWithDeps = """
                {
                    "name": "Task with Dependencies",
                    "description": "Task that depends on other tasks",
                    "projectId": 1,
                    "assignee": "test-user",
                    "status": "TODO",
                    "priority": "MEDIUM",
                    "dependencies": [1, 2]
                }
                """;
                
            HttpResponse response = post(TASKS_ENDPOINT, taskWithDeps);
            
            if (!response.isSuccess()) {
                throw new RuntimeException("Failed to create task with dependencies");
            }
            
            if (!assertJsonContainsField(response.getBody(), "dependencies")) {
                throw new RuntimeException("Task should have dependencies array");
            }
            
            System.out.println("Task dependencies test completed successfully");
            return true;
        });
    }
    
    /**
     * Test task status transitions
     */
    private static TestResult runTaskStatusTest() {
        return executeTest("Task Status - Valid Transitions", () -> {
            // Test valid status transitions
            String[] validStatuses = {"TODO", "IN_PROGRESS", "DONE", "BLOCKED"};
            
            for (String status : validStatuses) {
                String statusUpdate = """
                    {
                        "status": "%s"
                    }
                    """.replace("%s", status);
                
                HttpResponse response = put(TASK_ENDPOINT_PREFIX + "1", statusUpdate);
                
                if (!response.isSuccess()) {
                    throw new RuntimeException("Failed to update status to: " + status);
                }
                
                // Verify status update
                if (!assertJsonContains(response.getBody(), "status", status)) {
                    throw new RuntimeException("Status not updated correctly: " + status);
                }
            }
            
            System.out.println("Task status transitions test completed");
            return true;
        });
    }
    
    /**
     * Test performance under load
     */
    private static TestResult runPerformanceTest() {
        return executeTest("Performance - Multiple Requests", () -> {
            long startTime = System.currentTimeMillis();
            int requestCount = 15; // More requests for performance testing
            int successCount = 0;
            
            for (int i = 0; i < requestCount; i++) {
                try {
                    HttpResponse response = get(TASKS_ENDPOINT);
                    if (response.isSuccess()) {
                        successCount++;
                    }
                    
                    // Small delay to simulate real usage
                    Thread.sleep(30);
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
            
            if (averageTime > 800) { // 800ms average max for tasks
                throw new RuntimeException("Performance test failed: average time too high " + averageTime + "ms");
            }
            
            System.out.println("Performance test: " + successCount + "/" + requestCount + 
                             " requests successful, avg " + averageTime + "ms");
            return true;
        });
    }
}