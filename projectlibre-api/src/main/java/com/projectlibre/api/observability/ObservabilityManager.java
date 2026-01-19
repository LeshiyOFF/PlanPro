package com.projectlibre.api.observability;

import java.time.Instant;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Centralized observability manager for ProjectLibre API
 * Integrates error tracking, logging, and monitoring capabilities
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ObservabilityManager {
    
    private static ObservabilityManager instance;
    private final Map<String, Object> metrics;
    private final ErrorTracker errorTracker;
    private final HealthMonitor healthMonitor;
    
    private ObservabilityManager() {
        this.metrics = new ConcurrentHashMap<>();
        this.errorTracker = new ErrorTracker();
        this.healthMonitor = new HealthMonitor();
    }
    
    public static synchronized ObservabilityManager getInstance() {
        if (instance == null) {
            instance = new ObservabilityManager();
        }
        return instance;
    }
    
    public void trackError(String errorType, String message, Throwable throwable) {
        errorTracker.trackError(errorType, message, throwable);
    }
    
    public void recordMetric(String name, double value) {
        metrics.put(name + "_" + Instant.now().toEpochMilli(), value);
    }
    
    public Map<String, Object> getHealthStatus() {
        return healthMonitor.getStatus();
    }
    
    public Map<String, Object> getMetrics() {
        return new HashMap<>(metrics);
    }
    
    public void shutdown() {
        errorTracker.shutdown();
        healthMonitor.shutdown();
    }
    
    /**
     * Error tracking component
     */
    private static class ErrorTracker {
        private final Map<String, Integer> errorCounts = new ConcurrentHashMap<>();
        
        public void trackError(String errorType, String message, Throwable throwable) {
            errorCounts.merge(errorType, 1, Integer::sum);
            
            // Integration point for Sentry or other error tracking services
            System.err.println("[" + errorType + "] " + message + 
                             (throwable != null ? " - " + throwable.getMessage() : ""));
            
            // TODO: Replace with Sentry integration
            // Sentry.captureException(throwable);
        }
        
        public void shutdown() {
            errorCounts.clear();
        }
    }
    
    /**
     * Health monitoring component
     */
    private static class HealthMonitor {
        private volatile boolean isHealthy = true;
        private Instant lastCheck = Instant.now();
        
        public Map<String, Object> getStatus() {
            Map<String, Object> status = new HashMap<>();
            status.put("status", isHealthy ? "UP" : "DOWN");
            status.put("lastCheck", lastCheck.toString());
            status.put("uptime", System.currentTimeMillis() - 1735540800000L); // Project start time
            return status;
        }
        
        public void markUnhealthy(String reason) {
            isHealthy = false;
            System.err.println("Health check failed: " + reason);
        }
        
        public void markHealthy() {
            isHealthy = true;
            lastCheck = Instant.now();
        }
        
        public void shutdown() {
            // Cleanup resources
        }
    }
}