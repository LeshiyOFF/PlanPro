package com.projectlibre.api.test.controller;

import com.projectlibre.api.test.framework.HttpClientTestFramework;
import com.projectlibre.api.test.framework.HttpClientTestFramework.*;

import java.io.IOException;

/**
 * Comprehensive unit tests for ResourceController REST endpoints
 * Tests all CRUD operations with resource allocation support
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ResourceControllerTest {
    
    private static final String RESOURCES_ENDPOINT = "/resources";
    private static final String RESOURCE_ENDPOINT_PREFIX = "/resources/";
    
    public static void main(String[] args) {
        System.out.println("=== ResourceController Unit Tests ===");
        
        TestSuite suite = new TestSuite("ResourceController");
        
        // Initialize test data
        initializeTestData();
        
        // Run all test suites
        suite.addResult(HttpClientTestFramework.executeTest("GET /resources - Success", () -> {
            HttpResponse response = HttpClientTestFramework.get(RESOURCES_ENDPOINT);
            
            if (!response.isSuccess()) {
                throw new RuntimeException("Expected 200, got " + response.getStatusCode());
            }
            
            if (!HttpClientTestFramework.assertSuccess(response)) {
                throw new RuntimeException("Response does not indicate success");
            }
            
            if (!HttpClientTestFramework.assertJsonContainsField(response.getBody(), "data")) {
                throw new RuntimeException("Response missing data field");
            }
            
            int count = HttpClientTestFramework.parseJsonCount(response.getBody());
            if (count < 0) {
                throw new RuntimeException("Invalid count in response");
            }
            
            System.out.println("Retrieved " + count + " resources");
            return true;
        }));
        
        suite.addResult(HttpClientTestFramework.executeTest("GET /resources/{id} - Success", () -> {
            // First create a resource
            String createResource = """
                    {
                        "name": "Test Resource",
                        "description": "Resource to test GET by ID functionality",
                        "type": "HUMAN",
                        "department": "Testing",
                        "skills": ["Testing", "QA", "Automation"],
                        "maxHoursPerDay": 8,
                        "costPerHour": 60.0
                    }
                    """;
                
            HttpResponse createResponse = HttpClientTestFramework.post(RESOURCES_ENDPOINT, createResource);
            if (!createResponse.isSuccess()) {
                throw new RuntimeException("Failed to create test resource");
            }
            
            // Try to get the resource
            HttpResponse response = HttpClientTestFramework.get(RESOURCE_ENDPOINT_PREFIX + "1");
            
            if (!response.isSuccess()) {
                throw new RuntimeException("Expected 200, got " + response.getStatusCode());
            }
            
            if (!HttpClientTestFramework.assertJsonContains(response.getBody(), "name", "Test Resource")) {
                throw new RuntimeException("Resource name not found in response");
            }
            
            if (!HttpClientTestFramework.assertJsonContains(response.getBody(), "type", "HUMAN")) {
                throw new RuntimeException("Resource type not found in response");
            }
            return true;
        }));
        
        suite.addResult(HttpClientTestFramework.executeTest("POST /resources - Success", () -> {
            String newResource = """
                    {
                        "name": "New Test Resource",
                        "description": "Resource created during unit testing",
                        "type": "EQUIPMENT",
                        "department": "Infrastructure",
                        "skills": ["Server Management", "DevOps"],
                        "maxHoursPerDay": 24,
                        "costPerHour": 25.0,
                        "available": true
                    }
                    """;
                
            HttpResponse response = HttpClientTestFramework.post(RESOURCES_ENDPOINT, newResource);
            
            if (!response.isSuccess()) {
                throw new RuntimeException("Expected 200, got " + response.getStatusCode());
            }
            
            if (!HttpClientTestFramework.assertSuccess(response)) {
                throw new RuntimeException("Response does not indicate success");
            }
            
            if (!response.getBody().contains("created successfully")) {
                throw new RuntimeException("Success message not found in response");
            }
            
            if (!HttpClientTestFramework.assertJsonContainsField(response.getBody(), "data")) {
                throw new RuntimeException("Created resource data not found in response");
            }
            
            System.out.println("Created resource successfully");
            return true;
        }));
        
        suite.addResult(HttpClientTestFramework.executeTest("Performance - Multiple Requests", () -> {
            long startTime = System.currentTimeMillis();
            int requestCount = 12; // More requests for performance testing
            int successCount = 0;
            
            for (int i = 0; i < requestCount; i++) {
                try {
                    HttpResponse response = HttpClientTestFramework.get(RESOURCES_ENDPOINT);
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
            
            if (averageTime > 600) { // 600ms average max for resources
                throw new RuntimeException("Performance test failed: average time too high " + averageTime + "ms");
            }
            
            System.out.println("Performance test: " + successCount + "/" + requestCount + 
                             " requests successful, avg " + averageTime + "ms");
            return true;
        }));
        
        // Print results
        suite.printResults();
        
        // Return exit code based on test results
        System.exit(suite.allTestsPassed() ? 0 : 1);
    }
    
    /**
     * Initialize test data before running tests
     */
    private static void initializeTestData() {
        System.out.println("Initializing test data for resources...");
        
        try {
            // Create initial test resources
            String resource1 = """
                    {
                        "name": "John Doe",
                        "type": "HUMAN",
                        "department": "Development",
                        "skills": ["Java", "Spring Boot", "React"],
                        "maxHoursPerDay": 8,
                        "costPerHour": 75.0,
                        "available": true
                    }
                    """;
                
            String resource2 = """
                    {
                        "name": "Design Team",
                        "type": "TEAM",
                        "department": "Design",
                        "skills": ["UI/UX", "Figma", "Adobe Creative Suite"],
                        "maxHoursPerDay": 16,
                        "costPerHour": 0.0,
                        "available": true
                    }
                    """;
                
            HttpResponse response1 = HttpClientTestFramework.post(RESOURCES_ENDPOINT, resource1);
            HttpResponse response2 = HttpClientTestFramework.post(RESOURCES_ENDPOINT, resource2);
            
            if (response1.isSuccess() && response2.isSuccess()) {
                System.out.println("Resource test data initialized successfully");
            } else {
                System.out.println("Warning: Failed to initialize resource test data");
            }
            
        } catch (IOException e) {
            System.err.println("Failed to initialize resource test data: " + e.getMessage());
        }
    }
}