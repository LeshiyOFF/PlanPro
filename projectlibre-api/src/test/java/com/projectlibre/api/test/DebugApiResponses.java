package com.projectlibre.api.test;

import com.projectlibre.api.test.framework.HttpClientTestFramework;
import static com.projectlibre.api.test.framework.HttpClientTestFramework.*;

/**
 * Debug API responses to understand edge cases
 */
public class DebugApiResponses {
    
    public static void main(String[] args) {
        System.out.println("=== DEBUG API RESPONSES ===");
        
        try {
            // Test 1: Invalid JSON
            System.out.println("\n1. Testing invalid JSON...");
            var invalidJsonResponse = createProject("{invalid json}");
            System.out.println("Status: " + invalidJsonResponse.getStatusCode());
            System.out.println("Body: " + invalidJsonResponse.getBody());
            
            // Test 2: Empty JSON
            System.out.println("\n2. Testing empty JSON...");
            var emptyJsonResponse = createProject("{}");
            System.out.println("Status: " + emptyJsonResponse.getStatusCode());
            System.out.println("Body: " + emptyJsonResponse.getBody());
            
            // Test 3: Non-existent ID
            System.out.println("\n3. Testing non-existent ID...");
            var nonExistentResponse = getProject(999999);
            System.out.println("Status: " + nonExistentResponse.getStatusCode());
            System.out.println("Body: " + nonExistentResponse.getBody());
            
            // Test 4: Delete non-existent
            System.out.println("\n4. Testing delete non-existent...");
            var deleteNonExistent = deleteProject(999999);
            System.out.println("Status: " + deleteNonExistent.getStatusCode());
            System.out.println("Body: " + deleteNonExistent.getBody());
            
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}