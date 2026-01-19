package com.projectlibre.api.test;

import java.util.List;

/**
 * Represents the result of a concurrent test execution
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ConcurrentTestResult {
    
    private final String testName;
    private final long totalExecutionTimeMs;
    private final List<ThreadTestResult> threadResults;
    private final int totalSuccessCount;
    private final int totalErrorCount;
    private final double averageResponseTimeMs;
    private final boolean hasRaceConditions;
    
    public ConcurrentTestResult(String testName, long totalExecutionTimeMs, 
                           List<ThreadTestResult> threadResults) {
        this.testName = testName;
        this.totalExecutionTimeMs = totalExecutionTimeMs;
        this.threadResults = threadResults;
        this.totalSuccessCount = threadResults.stream()
            .mapToInt(ThreadTestResult::getSuccessCount)
            .sum();
        this.totalErrorCount = threadResults.stream()
            .mapToInt(ThreadTestResult::getErrorCount)
            .sum();
        this.averageResponseTimeMs = threadResults.stream()
            .mapToLong(ThreadTestResult::getResponseTime)
            .average()
            .orElse(0.0);
        this.hasRaceConditions = detectRaceConditions();
    }
    
    private boolean detectRaceConditions() {
        // Check for inconsistent results that might indicate race conditions
        return threadResults.stream()
            .anyMatch(result -> result.hasErrors() && 
                result.getErrors().stream()
                    .anyMatch(error -> error.contains("concurrent") || 
                                         error.contains("inconsistent") ||
                                         error.contains("race")));
    }
    
    public String getTestName() {
        return testName;
    }
    
    public long getTotalExecutionTimeMs() {
        return totalExecutionTimeMs;
    }
    
    public List<ThreadTestResult> getThreadResults() {
        return threadResults;
    }
    
    public int getTotalSuccessCount() {
        return totalSuccessCount;
    }
    
    public int getTotalErrorCount() {
        return totalErrorCount;
    }
    
    public double getAverageResponseTimeMs() {
        return averageResponseTimeMs;
    }
    
    public boolean hasRaceConditions() {
        return hasRaceConditions;
    }
    
    public double getSuccessRate() {
        int totalRequests = totalSuccessCount + totalErrorCount;
        return totalRequests > 0 ? (double) totalSuccessCount / totalRequests * 100.0 : 0.0;
    }
    
    public void printResults() {
        System.out.println("\n=== Concurrent Test Results: " + testName + " ===");
        System.out.println("Total execution time: " + totalExecutionTimeMs + " ms");
        System.out.println("Total successful requests: " + totalSuccessCount);
        System.out.println("Total failed requests: " + totalErrorCount);
        System.out.println("Success rate: " + String.format("%.2f%%", getSuccessRate()));
        System.out.println("Average response time: " + String.format("%.2f ms", averageResponseTimeMs));
        System.out.println("Race conditions detected: " + hasRaceConditions);
        
        System.out.println("\nThread Details:");
        for (ThreadTestResult result : threadResults) {
            result.printResults();
        }
    }
}