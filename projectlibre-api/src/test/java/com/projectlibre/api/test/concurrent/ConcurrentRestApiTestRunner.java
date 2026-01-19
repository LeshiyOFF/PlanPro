package com.projectlibre.api.test.concurrent;

import java.util.List;
import java.util.ArrayList;

import com.projectlibre.api.test.concurrent.ConcurrentTestFramework;
import com.projectlibre.api.test.ConcurrentTestResult;
import com.projectlibre.api.test.ThreadTestResult;
import com.projectlibre.api.test.TestScenario;
import com.projectlibre.api.test.concurrent.ProjectApiTestScenario;
import com.projectlibre.api.test.concurrent.TaskApiTestScenario;
import com.projectlibre.api.test.concurrent.ResourceApiTestScenario;

/**
 * Main concurrent test runner
 * Executes comprehensive concurrent testing of REST API endpoints
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ConcurrentRestApiTestRunner {
    
    private static final int DEFAULT_THREAD_COUNT = 20;
    private static final int DEFAULT_REQUESTS_PER_THREAD = 10;
    
    public static void main(String[] args) {
        System.out.println("=== ProjectLibre REST API Concurrent Test Runner ===");
        
        // Parse command line arguments
        int threadCount = args.length > 0 ? Integer.parseInt(args[0]) : DEFAULT_THREAD_COUNT;
        int requestsPerThread = args.length > 1 ? Integer.parseInt(args[1]) : DEFAULT_REQUESTS_PER_THREAD;
        
        System.out.println("Configuration:");
        System.out.println("  Threads: " + threadCount);
        System.out.println("  Requests per thread: " + requestsPerThread);
        System.out.println("  Total requests: " + (threadCount * requestsPerThread));
        
        // Create test scenarios
        List<TestScenario> scenarios = new ArrayList<>();
        scenarios.add(new ProjectApiTestScenario());
        scenarios.add(new TaskApiTestScenario());
        scenarios.add(new ResourceApiTestScenario());
        
        // Execute tests
        ConcurrentTestFramework framework = new ConcurrentTestFramework(threadCount, requestsPerThread);
        
        for (TestScenario scenario : scenarios) {
            try {
                scenario.setup();
                ConcurrentTestResult result = framework.executeTest(scenario);
                result.printResults();
                
                // Analyze results for potential issues
                analyzeResults(result);
                
                scenario.cleanup();
                
                // Brief pause between tests
                Thread.sleep(1000);
                
            } catch (Exception e) {
                System.err.println("Failed to execute test scenario: " + scenario.getName());
                e.printStackTrace();
            }
        }
        
        // Print summary statistics
        printSummary(framework);
        
        // Cleanup
        framework.shutdown();
        
        System.out.println("\n=== Concurrent testing completed ===");
    }
    
    private static void analyzeResults(ConcurrentTestResult result) {
        System.out.println("\n--- Thread Safety Analysis ---");
        
        // Check for high error rates
        double successRate = result.getSuccessRate();
        if (successRate < 95.0) {
            System.err.println("WARNING: Low success rate detected (" + 
                           String.format("%.2f%%", successRate) + ")");
        }
        
        // Check for race conditions
        if (result.hasRaceConditions()) {
            System.err.println("WARNING: Potential race conditions detected!");
        }
        
        // Check response time consistency
        double avgResponseTime = result.getAverageResponseTimeMs();
        if (avgResponseTime > 1000) {
            System.err.println("WARNING: High average response time (" + 
                           String.format("%.2f ms", avgResponseTime) + ")");
        }
        
        // Check for thread-specific issues
        List<ThreadTestResult> threadResults = result.getThreadResults();
        int threadsWithErrors = 0;
        long totalErrors = 0;
        
        for (ThreadTestResult threadResult : threadResults) {
            if (threadResult.hasErrors()) {
                threadsWithErrors++;
                totalErrors += threadResult.getErrorCount();
            }
        }
        
        if (threadsWithErrors > threadResults.size() / 2) {
            System.err.println("WARNING: More than half of threads experienced errors!");
        }
        
        System.out.println("Thread safety analysis completed.");
    }
    
    private static void printSummary(ConcurrentTestFramework framework) {
        System.out.println("\n=== Test Summary ===");
        System.out.println("Total successful requests: " + framework.getSuccessCount());
        System.out.println("Total failed requests: " + framework.getErrorCount());
        System.out.println("Average response time: " + framework.getAverageResponseTime() + " ms");
        
        int totalRequests = framework.getSuccessCount() + framework.getErrorCount();
        if (totalRequests > 0) {
            double overallSuccessRate = (double) framework.getSuccessCount() / totalRequests * 100.0;
            System.out.println("Overall success rate: " + String.format("%.2f%%", overallSuccessRate));
            
            if (overallSuccessRate >= 95.0) {
                System.out.println("✅ EXCELLENT: High concurrency performance");
            } else if (overallSuccessRate >= 85.0) {
                System.out.println("⚠️ GOOD: Acceptable concurrency performance");
            } else {
                System.out.println("❌ POOR: Concurrency issues detected");
            }
        }
    }
}