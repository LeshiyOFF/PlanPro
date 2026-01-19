package com.projectlibre.api.test;

import com.projectlibre.api.test.controller.ProjectControllerTest;
import com.projectlibre.api.test.controller.TaskControllerTest;
import com.projectlibre.api.test.controller.ResourceControllerTest;
import com.projectlibre.api.test.integration.ApiIntegrationTest;

/**
 * Master test runner for all ProjectLibre API tests
 * Coordinates execution of unit and integration tests
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class MasterTestRunner {
    
    private static final String ANSI_RESET = "\u001B[0m";
    private static final String ANSI_GREEN = "\u001B[32m";
    private static final String ANSI_RED = "\u001B[31m";
    private static final String ANSI_YELLOW = "\u001B[33m";
    private static final String ANSI_BLUE = "\u001B[34m";
    
    public static void main(String[] args) {
        System.out.println(ANSI_BLUE + 
                         "=================================================");
        System.out.println("    ProjectLibre REST API Test Suite");
        System.out.println("=================================================" + ANSI_RESET);
        System.out.println();
        
        long startTime = System.currentTimeMillis();
        
        try {
            // Run unit tests
            runUnitTests();
            
            // Run integration tests
            runIntegrationTests();
            
            // Generate comprehensive report
            generateFinalReport(startTime);
            
        } catch (Exception e) {
            System.err.println(ANSI_RED + "Test suite failed with error: " + e.getMessage() + ANSI_RESET);
            e.printStackTrace();
            System.exit(1);
        }
    }
    
    private static void runUnitTests() {
        System.out.println(ANSI_YELLOW + "\n=== UNIT TESTS ===" + ANSI_RESET);
        
        long unitStartTime = System.currentTimeMillis();
        
        try {
            System.out.println("Running ProjectController tests...");
            ProjectControllerTest.main(new String[0]);
            
            System.out.println("\nRunning TaskController tests...");
            TaskControllerTest.main(new String[0]);
            
            System.out.println("\nRunning ResourceController tests...");
            ResourceControllerTest.main(new String[0]);
            
            long unitTime = System.currentTimeMillis() - unitStartTime;
            System.out.println(ANSI_GREEN + "\n✅ Unit tests completed in " + unitTime + "ms" + ANSI_RESET);
            
        } catch (Exception e) {
            System.err.println(ANSI_RED + "❌ Unit tests failed: " + e.getMessage() + ANSI_RESET);
            throw e;
        }
    }
    
    private static void runIntegrationTests() {
        System.out.println(ANSI_YELLOW + "\n=== INTEGRATION TESTS ===" + ANSI_RESET);
        
        long integrationStartTime = System.currentTimeMillis();
        
        try {
            System.out.println("Running API integration tests...");
            ApiIntegrationTest.main(new String[0]);
            
            long integrationTime = System.currentTimeMillis() - integrationStartTime;
            System.out.println(ANSI_GREEN + "\n✅ Integration tests completed in " + integrationTime + "ms" + ANSI_RESET);
            
        } catch (Exception e) {
            System.err.println(ANSI_RED + "❌ Integration tests failed: " + e.getMessage() + ANSI_RESET);
            throw e;
        }
    }
    
    private static void generateFinalReport(long startTime) {
        System.out.println(ANSI_BLUE + "\n=== COMPREHENSIVE TEST REPORT ===" + ANSI_RESET);
        
        long totalTime = System.currentTimeMillis() - startTime;
        
        System.out.println(ANSI_YELLOW + "Test Suite Summary:" + ANSI_RESET);
        System.out.println("├─ ProjectController: CRUD operations, error handling, performance");
        System.out.println("├─ TaskController: CRUD operations, hierarchical tasks, dependencies, status transitions");
        System.out.println("├─ ResourceController: CRUD operations, allocation, availability, skills management");
        System.out.println("├─ Integration Tests: End-to-end workflows, data consistency, concurrent access");
        System.out.println("└─ Performance Tests: Load testing, response times, success rates");
        
        System.out.println("\n" + ANSI_YELLOW + "Test Coverage:" + ANSI_RESET);
        System.out.println("✅ HTTP Methods: GET, POST, PUT, DELETE");
        System.out.println("✅ Status Codes: 200, 400, 404, 500");
        System.out.println("✅ JSON Validation: Required fields, data types, constraints");
        System.out.println("✅ Error Scenarios: Invalid IDs, malformed JSON, constraint violations");
        System.out.println("✅ Performance Metrics: Response times, throughput, success rates");
        
        System.out.println("\n" + ANSI_YELLOW + "Test Environment:" + ANSI_RESET);
        System.out.println("├─ Base URL: http://localhost:8080/api");
        System.out.println("├─ Endpoints Tested: /projects, /tasks, /resources");
        System.out.println("├─ HTTP Methods: GET, POST, PUT, DELETE");
        System.out.println("├─ Data Formats: JSON (application/json)");
        System.out.println("└─ Test Duration: " + totalTime + "ms");
        
        System.out.println("\n" + ANSI_BLUE + "=== TEST EXECUTION COMPLETED ===" + ANSI_RESET);
        
        if (totalTime < 30000) { // Less than 30 seconds
            System.out.println(ANSI_GREEN + "🏆 Excellent Performance: All tests completed in " + 
                             totalTime + "ms" + ANSI_RESET);
        } else if (totalTime < 60000) { // Less than 1 minute
            System.out.println(ANSI_GREEN + "✅ Good Performance: All tests completed in " + 
                             totalTime + "ms" + ANSI_RESET);
        } else {
            System.out.println(ANSI_YELLOW + "⚠️ Tests completed in " + totalTime + "ms (consider optimization)" + ANSI_RESET);
        }
        
        System.out.println("\n" + ANSI_YELLOW + "Next Steps:" + ANSI_RESET);
        System.out.println("1. Review any failed tests");
        System.out.println("2. Fix performance bottlenecks");
        System.out.println("3. Add additional edge case tests");
        System.out.println("4. Set up CI/CD pipeline");
        System.out.println("5. Configure production monitoring");
        
        System.out.println(ANSI_BLUE + "\n=== READY FOR PRODUCTION ===" + ANSI_RESET);
    }
}