package com.projectlibre.api.test;

import com.projectlibre.api.test.controller.*;
import com.projectlibre.api.test.integration.ApiIntegrationTest;

/**
 * Запуск всех рабочих тестов
 */
public class AllWorkingTests {
    
    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("    ALL WORKING TESTS FOR PROJECTLIBRE API");
        System.out.println("=================================================");
        
        System.out.println("\n=== HEALTH TEST ===");
        try {
            var healthResponse = com.projectlibre.api.test.framework.HttpClientTestFramework.getHealth();
            System.out.println("Health Status: " + healthResponse.getStatusCode());
            if (healthResponse.getStatusCode() == 200) {
                System.out.println("✅ Health API - WORKING");
            } else {
                System.out.println("❌ Health API - FAILED");
            }
        } catch (Exception e) {
            System.out.println("❌ Health API - ERROR: " + e.getMessage());
        }
        
        System.out.println("\n=== PROJECTS TEST ===");
        try {
            var projectsResponse = com.projectlibre.api.test.framework.HttpClientTestFramework.getProjects();
            System.out.println("Projects Status: " + projectsResponse.getStatusCode());
            if (projectsResponse.getStatusCode() == 200) {
                System.out.println("✅ Projects API - WORKING");
            } else {
                System.out.println("❌ Projects API - FAILED");
            }
        } catch (Exception e) {
            System.out.println("❌ Projects API - ERROR: " + e.getMessage());
        }
        
        System.out.println("\n=== TASKS TEST ===");
        try {
            var tasksResponse = com.projectlibre.api.test.framework.HttpClientTestFramework.getTasks();
            System.out.println("Tasks Status: " + tasksResponse.getStatusCode());
            if (tasksResponse.getStatusCode() == 200) {
                System.out.println("✅ Tasks API - WORKING");
            } else {
                System.out.println("❌ Tasks API - FAILED");
            }
        } catch (Exception e) {
            System.out.println("❌ Tasks API - ERROR: " + e.getMessage());
        }
        
        System.out.println("\n=== RESOURCES TEST ===");
        try {
            var resourcesResponse = com.projectlibre.api.test.framework.HttpClientTestFramework.getResources();
            System.out.println("Resources Status: " + resourcesResponse.getStatusCode());
            if (resourcesResponse.getStatusCode() == 200) {
                System.out.println("✅ Resources API - WORKING");
            } else {
                System.out.println("❌ Resources API - FAILED");
            }
        } catch (Exception e) {
            System.out.println("❌ Resources API - ERROR: " + e.getMessage());
        }
        
        System.out.println("\n=== PERFORMANCE TEST ===");
        try {
            int successCount = 0;
            int requestCount = 10;
            long startTime = System.currentTimeMillis();
            
            for (int i = 0; i < requestCount; i++) {
                try {
                    var response = com.projectlibre.api.test.framework.HttpClientTestFramework.getHealth();
                    if (response.isSuccess()) {
                        successCount++;
                    }
                } catch (Exception e) {
                    // ignore
                }
            }
            
            long totalTime = System.currentTimeMillis() - startTime;
            long avgTime = totalTime / requestCount;
            
            System.out.println("Performance: " + successCount + "/" + requestCount + 
                             " requests successful, avg " + avgTime + "ms");
            
            if (successCount >= 8) {
                System.out.println("✅ Performance Test - PASSED");
            } else {
                System.out.println("❌ Performance Test - FAILED");
            }
            
        } catch (Exception e) {
            System.out.println("❌ Performance Test - ERROR: " + e.getMessage());
        }
        
        System.out.println("\n=================================================");
        System.out.println("          ALL TESTS COMPLETED!");
        System.out.println("=================================================");
    }
}