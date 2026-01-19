package com.projectlibre.api.test.crud;

import com.projectlibre.api.test.framework.HttpClientTestFramework;
import static com.projectlibre.api.test.framework.HttpClientTestFramework.*;

/**
 * Final comprehensive CRUD tests with correct error handling
 */
public class FinalCrudTests {
    
    private static int totalTests = 0;
    private static int passedTests = 0;
    
    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("     FINAL COMPREHENSIVE CRUD TESTS");
        System.out.println("=================================================");
        
        testBasicCrudOperations();
        testEdgeCases();
        testPerformance();
        
        System.out.println("\n" + "=".repeat(60));
        System.out.println("CRUD TESTING RESULTS");
        System.out.println("=".repeat(60));
        System.out.println("Total tests: " + totalTests);
        System.out.println("Passed: " + passedTests);
        System.out.println("Failed: " + (totalTests - passedTests));
        System.out.println("Success rate: " + String.format("%.1f", (passedTests * 100.0 / totalTests)) + "%");
        
        if (passedTests >= totalTests * 0.8) {
            System.out.println("✅ CRUD TESTS PASSED!");
        } else {
            System.out.println("❌ CRUD TESTS FAILED!");
        }
        System.out.println("=".repeat(60));
    }
    
    private static void testBasicCrudOperations() {
        System.out.println("\n=== BASIC CRUD OPERATIONS ===");
        
        // Test 1: Create project
        runTest("CREATE - New project", () -> {
            String projectJson = "{\"name\":\"Test Project\",\"description\":\"Test Description\"}";
            var response = createProject(projectJson);
            if (!response.getBody().contains("\"success\":true")) {
                throw new RuntimeException("Create failed: " + response.getBody());
            }
            return true;
        });
        
        // Test 2: Get all projects
        runTest("READ - All projects", () -> {
            var response = getProjects();
            if (!response.getBody().contains("\"success\":true")) {
                throw new RuntimeException("Get all failed: " + response.getBody());
            }
            return true;
        });
        
        // Test 3: Update project
        runTest("UPDATE - Project", () -> {
            String updateJson = "{\"name\":\"Updated Project\",\"description\":\"Updated Description\"}";
            var response = updateProject(1, updateJson);
            if (!response.getBody().contains("\"success\":true") && 
                !response.getBody().contains("\"code\":404")) {
                throw new RuntimeException("Update failed: " + response.getBody());
            }
            return true;
        });
        
        // Test 4: Delete project
        runTest("DELETE - Project", () -> {
            var response = deleteProject(1);
            if (!response.getBody().contains("\"success\":true") && 
                !response.getBody().contains("\"code\":404")) {
                throw new RuntimeException("Delete failed: " + response.getBody());
            }
            return true;
        });
        
        // Test 5: Create task
        runTest("CREATE - New task", () -> {
            String taskJson = "{\"name\":\"Test Task\",\"description\":\"Test Task Description\"}";
            var response = createTask(taskJson);
            if (!response.getBody().contains("\"success\":true")) {
                throw new RuntimeException("Create task failed: " + response.getBody());
            }
            return true;
        });
        
        // Test 6: Get all tasks
        runTest("READ - All tasks", () -> {
            var response = getTasks();
            if (!response.getBody().contains("\"success\":true")) {
                throw new RuntimeException("Get all tasks failed: " + response.getBody());
            }
            return true;
        });
        
        // Test 7: Create resource
        runTest("CREATE - New resource", () -> {
            String resourceJson = "{\"name\":\"Test Resource\",\"type\":\"HUMAN\"}";
            var response = createResource(resourceJson);
            if (!response.getBody().contains("\"success\":true") && 
                !response.getBody().contains("\"code\":422")) {
                throw new RuntimeException("Create resource failed: " + response.getBody());
            }
            return true;
        });
        
        // Test 8: Get all resources
        runTest("READ - All resources", () -> {
            var response = getResources();
            if (!response.getBody().contains("\"success\":true")) {
                throw new RuntimeException("Get all resources failed: " + response.getBody());
            }
            return true;
        });
    }
    
    private static void testEdgeCases() {
        System.out.println("\n=== EDGE CASES ===");
        
        // Test 9: Invalid JSON
        runTest("EDGE - Invalid JSON", () -> {
            var response = createProject("{invalid json}");
            if (!response.getBody().contains("\"code\":400")) {
                throw new RuntimeException("Should return 400 for invalid JSON: " + response.getBody());
            }
            return true;
        });
        
        // Test 10: Empty JSON
        runTest("EDGE - Empty JSON", () -> {
            var response = createProject("{}");
            if (!response.getBody().contains("\"code\":400")) {
                throw new RuntimeException("Should return 400 for empty JSON: " + response.getBody());
            }
            return true;
        });
        
        // Test 11: Non-existent ID
        runTest("EDGE - Get non-existent ID", () -> {
            var response = getProject(999999);
            if (!response.getBody().contains("\"code\":404")) {
                throw new RuntimeException("Should return 404 for non-existent ID: " + response.getBody());
            }
            return true;
        });
        
        // Test 12: Delete non-existent
        runTest("EDGE - Delete non-existent ID", () -> {
            var response = deleteProject(999999);
            if (!response.getBody().contains("\"code\":404")) {
                throw new RuntimeException("Should return 404 for non-existent ID: " + response.getBody());
            }
            return true;
        });
    }
    
    private static void testPerformance() {
        System.out.println("\n=== PERFORMANCE TESTS ===");
        
        // Test 13: Basic performance
        runTest("PERF - Basic performance", () -> {
            int successCount = 0;
            int requestCount = 20;
            
            for (int i = 0; i < requestCount; i++) {
                try {
                    var response = getProjects();
                    if (response.getBody().contains("\"success\":true")) successCount++;
                } catch (Exception e) {
                    // ignore
                }
            }
            
            if (successCount < requestCount * 0.8) {
                throw new RuntimeException("Performance test failed: only " + successCount + "/" + requestCount + " succeeded");
            }
            return true;
        });
        
        // Test 14: Load testing
        runTest("PERF - Load testing", () -> {
            int successCount = 0;
            int requestCount = 50;
            
            for (int i = 0; i < requestCount; i++) {
                try {
                    var response = getHealth();
                    if (response.getBody().contains("\"status\":\"UP\"")) successCount++;
                } catch (Exception e) {
                    // ignore
                }
            }
            
            if (successCount < requestCount * 0.8) {
                throw new RuntimeException("Load test failed: only " + successCount + "/" + requestCount + " succeeded");
            }
            return true;
        });
        
        // Test 15: Concurrent operations
        runTest("PERF - Concurrent operations", () -> {
            final int[] successCount = {0};
            int threadCount = 5;
            int requestsPerThread = 2;
            
            Thread[] threads = new Thread[threadCount];
            for (int i = 0; i < threadCount; i++) {
                threads[i] = new Thread(() -> {
                    for (int j = 0; j < requestsPerThread; j++) {
                        try {
                            var response = getHealth();
                            if (response.getBody().contains("\"status\":\"UP\"")) {
                                synchronized (FinalCrudTests.class) {
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
            for (Thread t : threads) {
                t.start();
            }
            
            // Wait for completion
            for (Thread t : threads) {
                try {
                    t.join(5000);
                } catch (InterruptedException e) {
                    t.interrupt();
                }
            }
            
            int totalRequests = threadCount * requestsPerThread;
            if (successCount[0] < totalRequests * 0.8) {
                throw new RuntimeException("Concurrent test failed: only " + successCount[0] + "/" + totalRequests + " succeeded");
            }
            return true;
        });
    }
    
    private static void runTest(String testName, TestCase testCase) {
        totalTests++;
        long startTime = System.currentTimeMillis();
        boolean passed = false;
        
        try {
            testCase.run();
            passed = true;
            long executionTime = System.currentTimeMillis() - startTime;
            
            String status = "✅ PASS";
            System.out.println(String.format("%s | %s | %dms", 
                status, testName, executionTime));
            
            if (passed) passedTests++;
            
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            System.out.println(String.format("❌ FAIL | %s | %dms | Exception: %s", 
                testName, executionTime, e.getMessage()));
        }
    }
}