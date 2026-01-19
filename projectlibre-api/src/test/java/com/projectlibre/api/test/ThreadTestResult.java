package com.projectlibre.api.test;

import java.util.List;

/**
 * Represents result of a single thread's test execution
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ThreadTestResult {
    
    private final int threadId;
    private final int successCount;
    private final int errorCount;
    private final long responseTimeMs;
    private final List<String> errors;
    
    public ThreadTestResult(int threadId, int successCount, int errorCount, 
                        long responseTimeMs, List<String> errors) {
        this.threadId = threadId;
        this.successCount = successCount;
        this.errorCount = errorCount;
        this.responseTimeMs = responseTimeMs;
        this.errors = errors;
    }
    
    public int getThreadId() {
        return threadId;
    }
    
    public int getSuccessCount() {
        return successCount;
    }
    
    public int getErrorCount() {
        return errorCount;
    }
    
    public long getResponseTime() {
        return responseTimeMs;
    }
    
    public List<String> getErrors() {
        return errors;
    }
    
    public boolean hasErrors() {
        return errorCount > 0 || !errors.isEmpty();
    }
    
    public void printResults() {
        System.out.println("Thread " + threadId + ": " + 
                         successCount + " success, " + errorCount + " errors, " + 
                         responseTimeMs + "ms total");
        if (hasErrors()) {
            for (String error : errors) {
                System.out.println("  Error: " + error);
            }
        }
    }
}