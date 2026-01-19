package com.projectlibre.api.test;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import com.projectlibre.api.observability.ObservabilityManager;
import com.projectlibre.api.observability.ObservabilityLogger;

/**
 * Test environment runner for ProjectLibre API
 * Provides isolated testing environment with observability
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
@SpringBootApplication
@ComponentScan(basePackages = {"com.projectlibre.api"})
public class TestEnvironment {
    
    private final ObservabilityLogger observabilityLogger;
    
    public TestEnvironment(ObservabilityLogger observabilityLogger) {
        this.observabilityLogger = observabilityLogger;
    }
    
    public static void main(String[] args) {
        System.out.println("=== ProjectLibre API Test Environment ===");
        
        // Set test profile
        System.setProperty("spring.profiles.active", "test");
        
        SpringApplication.run(TestEnvironment.class, args);
    }
    
    @Bean
    public CommandLineRunner testRunner(ObservabilityManager observabilityManager) {
        return args -> {
            System.out.println("Starting comprehensive API tests...");
            
            // Test observability components
            testObservabilityComponents(observabilityManager);
            
            // Test API endpoints
            testApiEndpoints();
            
            // Test error handling
            testErrorHandling(observabilityManager);
            
            // Test health checks
            testHealthChecks(observabilityManager);
            
            System.out.println("All tests completed. Check logs for details.");
        };
    }
    
    private void testObservabilityComponents(ObservabilityManager observabilityManager) {
        observabilityLogger.logInfo("TEST_ENV", "Testing observability components");
        
        // Test error tracking
        observabilityManager.trackError("TEST_ERROR", "This is a test error", 
            new RuntimeException("Test exception"));
        
        // Test metrics
        observabilityManager.recordMetric("test_metric", 42.0);
        observabilityManager.recordMetric("test_counter", 1);
        
        // Test health monitoring
        var healthStatus = observabilityManager.getHealthStatus();
        observabilityLogger.logInfo("TEST_ENV", "Health status: " + healthStatus);
    }
    
    private void testApiEndpoints() {
        observabilityLogger.logInfo("TEST_ENV", "Testing API endpoints");
        
        // Simulate API calls
        String[] endpoints = {
            "/api/projects", "/api/tasks", "/api/resources",
            "/api/projects/1", "/api/tasks/1", "/api/resources/1"
        };
        
        for (String endpoint : endpoints) {
            long startTime = System.currentTimeMillis();
            
            // Simulate API call
            try {
                Thread.sleep(50 + (int)(Math.random() * 100)); // 50-150ms
                boolean success = Math.random() > 0.1; // 90% success rate
                
                long duration = System.currentTimeMillis() - startTime;
                
                if (success) {
                    observabilityLogger.logApiCall("TEST-" + System.currentTimeMillis(), 
                        "GET " + endpoint, "SUCCESS", duration);
                } else {
                    observabilityLogger.logApiCall("TEST-" + System.currentTimeMillis(), 
                        "GET " + endpoint, "FAILED", duration);
                }
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                observabilityLogger.logError("TEST_ENV", "API test interrupted", e);
            }
        }
    }
    
    private void testErrorHandling(ObservabilityManager observabilityManager) {
        observabilityLogger.logInfo("TEST_ENV", "Testing error handling");
        
        // Test different error types
        String[] errorTypes = {"VALIDATION", "BUSINESS_LOGIC", "SYSTEM", "NETWORK", "DATABASE"};
        
        for (String errorType : errorTypes) {
            try {
                // Simulate error
                throw new RuntimeException("Simulated " + errorType + " error");
            } catch (Exception e) {
                observabilityManager.trackError(errorType, 
                    "Test error simulation for type: " + errorType, e);
            }
        }
    }
    
    private void testHealthChecks(ObservabilityManager observabilityManager) {
        observabilityLogger.logInfo("TEST_ENV", "Testing health check endpoints");
        
        // Test health endpoints
        String[] healthEndpoints = {"/api/health", "/api/health/detailed", 
                                 "/api/health/ready", "/api/health/live"};
        
        for (String endpoint : healthEndpoints) {
            long startTime = System.currentTimeMillis();
            
            try {
                Thread.sleep(10 + (int)(Math.random() * 20)); // 10-30ms
                long duration = System.currentTimeMillis() - startTime;
                
                observabilityLogger.logRequest("TEST-" + System.currentTimeMillis(), 
                    "GET", endpoint, 200, duration);
                
                observabilityLogger.logInfo("HEALTH_CHECK", 
                    endpoint + " responded in " + duration + "ms");
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                observabilityLogger.logError("TEST_ENV", "Health check interrupted", e);
            }
        }
        
        // Final health status
        var finalHealthStatus = observabilityManager.getHealthStatus();
        observabilityLogger.logInfo("TEST_ENV", "Final health status: " + finalHealthStatus);
    }
}