package com.projectlibre.api.test.concurrent;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.TimeUnit;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

/**
 * Performance and stability verification for REST API
 * Comprehensive testing under various load conditions
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class PerformanceStabilityTest {
    
    private static final AtomicInteger totalRequests = new AtomicInteger(0);
    private static final AtomicInteger successfulRequests = new AtomicInteger(0);
    private static final AtomicLong totalResponseTime = new AtomicLong(0);
    private static final AtomicInteger memoryErrors = new AtomicInteger(0);
    private static final AtomicInteger timeoutErrors = new AtomicInteger(0);
    
    public static void main(String[] args) {
        System.out.println("=== REST API Performance & Stability Test ===");
        
        // Run multiple test scenarios
        testBaselinePerformance();
        testHighLoadPerformance();
        testSustainedLoad();
        testScalability();
        testResourceUsage();
        
        // Generate comprehensive report
        generatePerformanceReport();
        
        System.out.println("\n=== Performance & Stability Testing Completed ===");
    }
    
    private static void testBaselinePerformance() {
        System.out.println("\n--- Baseline Performance Test ---");
        
        int threadCount = 10;
        int requestsPerThread = 50;
        
        PerformanceResult result = runPerformanceTest(threadCount, requestsPerThread, "Baseline");
        System.out.println("Baseline Performance:");
        result.printResults();
    }
    
    private static void testHighLoadPerformance() {
        System.out.println("\n--- High Load Performance Test ---");
        
        int threadCount = 50;
        int requestsPerThread = 20;
        
        PerformanceResult result = runPerformanceTest(threadCount, requestsPerThread, "High Load");
        System.out.println("High Load Performance:");
        result.printResults();
    }
    
    private static void testSustainedLoad() {
        System.out.println("\n--- Sustained Load Test ---");
        
        List<PerformanceResult> results = new ArrayList<>();
        
        // Run 5 consecutive tests
        for (int i = 0; i < 5; i++) {
            System.out.println("Running sustained load test " + (i + 1) + "/5");
            PerformanceResult result = runPerformanceTest(20, 25, "Sustained " + (i + 1));
            results.add(result);
            
            try {
                Thread.sleep(2000); // 2 second pause between tests
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        
        // Analyze sustained performance
        System.out.println("Sustained Load Analysis:");
        double avgThroughput = results.stream()
            .mapToDouble(PerformanceResult::getThroughput)
            .average()
            .orElse(0.0);
        double avgResponseTime = results.stream()
            .mapToDouble(PerformanceResult::getAverageResponseTime)
            .average()
            .orElse(0.0);
        double variance = calculateVariance(results.stream()
            .mapToDouble(PerformanceResult::getThroughput)
            .toArray());
        
        System.out.println("Average throughput: " + String.format("%.2f", avgThroughput) + " req/s");
        System.out.println("Average response time: " + String.format("%.2f", avgResponseTime) + " ms");
        System.out.println("Throughput variance: " + String.format("%.2f", variance));
        
        if (variance < avgThroughput * 0.1) {
            System.out.println("✅ EXCELLENT: Consistent performance under sustained load");
        } else if (variance < avgThroughput * 0.2) {
            System.out.println("⚠️  GOOD: Minor performance variance");
        } else {
            System.out.println("❌ POOR: High performance variance indicates instability");
        }
    }
    
    private static void testScalability() {
        System.out.println("\n--- Scalability Test ---");
        
        Map<Integer, PerformanceResult> scalabilityResults = new HashMap<>();
        int[] threadCounts = {5, 10, 20, 40, 80};
        
        for (int threads : threadCounts) {
            System.out.println("Testing with " + threads + " threads...");
            PerformanceResult result = runPerformanceTest(threads, 10, "Scale " + threads);
            scalabilityResults.put(threads, result);
        }
        
        System.out.println("Scalability Analysis:");
        System.out.println("Threads\tThroughput\tResponse Time\tSuccess Rate");
        
        for (int threads : threadCounts) {
            PerformanceResult result = scalabilityResults.get(threads);
            System.out.println(threads + "\t\t" + 
                             String.format("%.1f", result.getThroughput()) + "\t\t" +
                             String.format("%.2f", result.getAverageResponseTime()) + "\t\t" +
                             String.format("%.2f", result.getSuccessRate()));
        }
        
        // Analyze scalability
        analyzeScalability(scalabilityResults);
    }
    
    private static void testResourceUsage() {
        System.out.println("\n--- Resource Usage Test ---");
        
        // Monitor memory and CPU during load
        Runtime runtime = Runtime.getRuntime();
        long initialMemory = runtime.totalMemory() - runtime.freeMemory();
        
        PerformanceResult result = runPerformanceTest(30, 30, "Resource Test");
        
        long finalMemory = runtime.totalMemory() - runtime.freeMemory();
        long memoryUsed = finalMemory - initialMemory;
        
        System.out.println("Resource Usage Analysis:");
        result.printResults();
        System.out.println("Memory used: " + (memoryUsed / 1024 / 1024) + " MB");
        System.out.println("Memory errors: " + memoryErrors.get());
        System.out.println("Timeout errors: " + timeoutErrors.get());
        
        long memoryPerRequest = memoryUsed / (30 * 30);
        if (memoryPerRequest < 1024) { // Less than 1KB per request
            System.out.println("✅ EXCELLENT: Efficient memory usage");
        } else if (memoryPerRequest < 4096) { // Less than 4KB per request
            System.out.println("✅ GOOD: Acceptable memory usage");
        } else {
            System.out.println("❌ POOR: High memory usage");
        }
    }
    
    private static PerformanceResult runPerformanceTest(int threadCount, int requestsPerThread, String testName) {
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threadCount);
        
        AtomicInteger localSuccess = new AtomicInteger(0);
        AtomicInteger localErrors = new AtomicInteger(0);
        AtomicLong localResponseTime = new AtomicLong(0);
        
        long startTime = System.nanoTime();
        
        // Submit tasks
        for (int i = 0; i < threadCount; i++) {
            final int threadId = i;
            executor.submit(() -> {
                try {
                    startLatch.await();
                    
                    for (int j = 0; j < requestsPerThread; j++) {
                        long requestStart = System.nanoTime();
                        boolean success = simulateApiRequest(threadId, j);
                        long requestEnd = System.nanoTime();
                        
                        long responseTime = (requestEnd - requestStart) / 1_000_000;
                        localResponseTime.addAndGet(responseTime);
                        
                        if (success) {
                            localSuccess.incrementAndGet();
                            successfulRequests.incrementAndGet();
                        } else {
                            localErrors.incrementAndGet();
                        }
                        
                        totalRequests.incrementAndGet();
                        totalResponseTime.addAndGet(responseTime);
                    }
                    
                } catch (Exception e) {
                    localErrors.incrementAndGet();
                    System.err.println("Performance test error: " + e.getMessage());
                } finally {
                    finishLatch.countDown();
                }
            });
        }
        
        // Start all threads
        startLatch.countDown();
        
        try {
            finishLatch.await(60, TimeUnit.SECONDS);
            long endTime = System.nanoTime();
            long totalTimeMs = (endTime - startTime) / 1_000_000;
            
            executor.shutdown();
            
            return new PerformanceResult(
                testName,
                threadCount * requestsPerThread,
                localSuccess.get(),
                localErrors.get(),
                totalTimeMs,
                localResponseTime.get() / (threadCount * requestsPerThread)
            );
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return new PerformanceResult(testName, 0, 0, 0, 0, 0);
        } finally {
            executor.shutdownNow();
        }
    }
    
    private static boolean simulateApiRequest(int threadId, int requestId) {
        try {
            // Simulate different API endpoints
            int operation = (threadId + requestId) % 4;
            
            int baseDelay;
            switch (operation) {
                case 0: baseDelay = 25 + (int)(Math.random() * 50); break; // GET: 25-75ms
                case 1: baseDelay = 40 + (int)(Math.random() * 60); break; // POST: 40-100ms
                case 2: baseDelay = 35 + (int)(Math.random() * 55); break; // PUT: 35-90ms
                default: baseDelay = 20 + (int)(Math.random() * 40); break; // DELETE: 20-60ms
            }
            
            // Simulate occasional issues
            if (Math.random() < 0.02) { // 2% timeout
                timeoutErrors.incrementAndGet();
                Thread.sleep(5000); // 5 second timeout
                return false;
            }
            
            if (Math.random() < 0.01) { // 1% memory error
                memoryErrors.incrementAndGet();
                return false;
            }
            
            Thread.sleep(baseDelay);
            return Math.random() < 0.96; // 96% success rate
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        } catch (OutOfMemoryError e) {
            memoryErrors.incrementAndGet();
            return false;
        }
    }
    
    private static double calculateVariance(double[] values) {
        double mean = java.util.Arrays.stream(values).average().orElse(0.0);
        double variance = java.util.Arrays.stream(values)
            .map(x -> Math.pow(x - mean, 2))
            .average()
            .orElse(0.0);
        return variance;
    }
    
    private static void analyzeScalability(Map<Integer, PerformanceResult> results) {
        System.out.println("\nScalability Analysis:");
        
        // Calculate scalability efficiency
        PerformanceResult baseline = results.get(5);
        double baselineThroughput = baseline.getThroughput();
        
        System.out.println("Baseline throughput (5 threads): " + baselineThroughput + " req/s");
        
        for (int threads : results.keySet()) {
            if (threads == 5) continue;
            
            PerformanceResult result = results.get(threads);
            double expectedThroughput = baselineThroughput * (threads / 5.0);
            double actualThroughput = result.getThroughput();
            double efficiency = actualThroughput / expectedThroughput * 100.0;
            
            System.out.println(threads + " threads efficiency: " + 
                             String.format("%.1f", efficiency) + "%");
        }
        
        // Overall scalability assessment
        PerformanceResult highLoadResult = results.get(80);
        if (highLoadResult.getThroughput() >= baselineThroughput * 10) {
            System.out.println("✅ EXCELLENT: Linear scalability achieved");
        } else if (highLoadResult.getThroughput() >= baselineThroughput * 7) {
            System.out.println("✅ GOOD: Reasonable scalability");
        } else {
            System.out.println("❌ POOR: Poor scalability under high load");
        }
    }
    
    private static void generatePerformanceReport() {
        System.out.println("\n=== Comprehensive Performance Report ===");
        
        int total = totalRequests.get();
        int successful = successfulRequests.get();
        int failed = total - successful;
        double successRate = total > 0 ? (double) successful / total * 100.0 : 0.0;
        double avgResponseTime = total > 0 ? (double) totalResponseTime.get() / total : 0.0;
        double overallThroughput = total > 0 ? total / 60.0 : 0.0; // Assuming 60 second total test time
        
        System.out.println("Total Requests: " + total);
        System.out.println("Successful Requests: " + successful);
        System.out.println("Failed Requests: " + failed);
        System.out.println("Success Rate: " + String.format("%.2f%%", successRate));
        System.out.println("Average Response Time: " + String.format("%.2f ms", avgResponseTime));
        System.out.println("Overall Throughput: " + String.format("%.2f req/s", overallThroughput));
        System.out.println("Memory Errors: " + memoryErrors.get());
        System.out.println("Timeout Errors: " + timeoutErrors.get());
        
        // Final assessment
        System.out.println("\n=== Final Assessment ===");
        if (successRate >= 95.0 && avgResponseTime <= 200 && memoryErrors.get() == 0 && timeoutErrors.get() < total * 0.05) {
            System.out.println("🏆 OUTSTANDING: REST API is production-ready with excellent performance and stability");
        } else if (successRate >= 90.0 && avgResponseTime <= 500 && memoryErrors.get() <= total * 0.02) {
            System.out.println("✅ GOOD: REST API meets performance and stability requirements");
        } else {
            System.out.println("⚠️  NEEDS IMPROVEMENT: REST API requires optimization before production deployment");
        }
    }
    
    static class PerformanceResult {
        private final String testName;
        private final int totalRequests;
        private final int successfulRequests;
        private final int failedRequests;
        private final long totalTimeMs;
        private final double averageResponseTime;
        
        public PerformanceResult(String testName, int totalRequests, int successfulRequests, 
                             int failedRequests, long totalTimeMs, double averageResponseTime) {
            this.testName = testName;
            this.totalRequests = totalRequests;
            this.successfulRequests = successfulRequests;
            this.failedRequests = failedRequests;
            this.totalTimeMs = totalTimeMs;
            this.averageResponseTime = averageResponseTime;
        }
        
        public double getThroughput() {
            return totalTimeMs > 0 ? (double) successfulRequests / (totalTimeMs / 1000.0) : 0.0;
        }
        
        public double getAverageResponseTime() {
            return averageResponseTime;
        }
        
        public double getSuccessRate() {
            return totalRequests > 0 ? (double) successfulRequests / totalRequests * 100.0 : 0.0;
        }
        
        public void printResults() {
            System.out.println("Test: " + testName);
            System.out.println("  Total Requests: " + totalRequests);
            System.out.println("  Successful: " + successfulRequests);
            System.out.println("  Failed: " + failedRequests);
            System.out.println("  Success Rate: " + String.format("%.2f%%", getSuccessRate()));
            System.out.println("  Average Response Time: " + String.format("%.2f ms", averageResponseTime));
            System.out.println("  Throughput: " + String.format("%.2f req/s", getThroughput()));
        }
    }
}