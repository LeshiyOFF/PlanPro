package com.projectlibre.api.observability;

import io.sentry.Sentry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
     * Error tracking component with Sentry integration
     */
    private static class ErrorTracker {
        private static final Logger logger = LoggerFactory.getLogger(ErrorTracker.class);
        private final Map<String, Integer> errorCounts = new ConcurrentHashMap<>();
        
        public void trackError(String errorType, String message, Throwable throwable) {
            errorCounts.merge(errorType, 1, Integer::sum);
            
            String errorMessage = "[" + errorType + "] " + message;
            if (throwable != null) {
                logger.error(errorMessage, throwable);
                Sentry.captureException(throwable);
            } else {
                logger.error(errorMessage);
            }
        }
        
        public void shutdown() {
            errorCounts.clear();
        }
    }
    
    /**
     * Health monitoring component
     */
    private static class HealthMonitor {
        private static final Logger logger = LoggerFactory.getLogger(HealthMonitor.class);
        private static final long PROJECT_START_TIME = 1735540800000L;
        private volatile boolean isHealthy = true;
        private Instant lastCheck = Instant.now();
        
        public Map<String, Object> getStatus() {
            Map<String, Object> status = new HashMap<>();
            status.put("status", isHealthy ? "UP" : "DOWN");
            status.put("lastCheck", lastCheck.toString());
            status.put("uptime", System.currentTimeMillis() - PROJECT_START_TIME);
            return status;
        }
        
        public void markUnhealthy(String reason) {
            isHealthy = false;
            logger.warn("Health check failed: {}", reason);
        }
        
        public void markHealthy() {
            isHealthy = true;
            lastCheck = Instant.now();
        }
        
        public void shutdown() {
            logger.info("HealthMonitor shutdown");
        }
    }
}