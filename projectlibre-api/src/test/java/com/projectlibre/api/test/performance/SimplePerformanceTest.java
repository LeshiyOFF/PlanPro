package com.projectlibre.api.test.performance;

import com.projectlibre.api.test.framework.HttpClientTestFramework;
import static com.projectlibre.api.test.framework.HttpClientTestFramework.*;

import java.util.*;

/**
 * Simple Performance Test for REST API
 * Tests basic performance metrics
 */
public class SimplePerformanceTest {
    
    private static int totalTests = 0;
    private static int passedTests = 0;
    
    // Performance thresholds
    private static final long MAX_AVG_LATENCY_MS = 200;
    private static final double MIN_SUCCESS_RATE = 0.90; // 90%
    
    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("     SIMPLE PERFORMANCE TEST");
        System.out.println("=================================================");
        
        testBasicPerformance();
        testLoadPerformance();
        testLatency();
        
        printResults();
    }
    
    /**
     * Test basic performance metrics
     */
    private static void testBasicPerformance() {
        System.out.println("\n=== BASIC PERFORMANCE TESTS ===");
        
        // Health endpoint performance
        runTest("PERF - Health endpoint response time", () -> {
            List<Long> responseTimes = new ArrayList<>();
            int iterations = 20;
            
            for (int i = 0; i < iterations; i++) {
                long start = System.currentTimeMillis();
                try {
                    var response = getHealth();
                    long end = System.currentTimeMillis();
                    
                    if (response.isSuccess()) {
                        responseTimes.add(end - start);
                    }
                } catch (Exception e) {
                    // ignore for performance test
                }
            }
            
            if (responseTimes.isEmpty()) {
                throw new RuntimeException("No successful responses");
            }
            
            double avgTime = responseTimes.stream().mapToLong(Long::longValue).average().orElse(0);
            System.out.printf("  Health: Avg response time: %.1fms (%d/%d successful)%n",
                avgTime, responseTimes.size(), iterations);
            
            if (avgTime > MAX_AVG_LATENCY_MS) {
                throw new RuntimeException(String.format(
                    "Average response time too high: %.1f > %dms", avgTime, MAX_AVG_LATENCY_MS));
            }
            return true;
        });
        
        // Projects endpoint performance
        runTest("PERF - Projects endpoint response time", () -> {
            List<Long> responseTimes = new ArrayList<>();
            int iterations = 15;
            
            for (int i = 0; i < iterations; i++) {
                long start = System.currentTimeMillis();
                try {
                    var response = getProjects();
                    long end = System.currentTimeMillis();
                    
                    if (response.isSuccess()) {
                        responseTimes.add(end - start);
                    }
                } catch (Exception e) {
                    // ignore for performance test
                }
            }
            
            if (responseTimes.isEmpty()) {
                throw new RuntimeException("No successful responses");
            }
            
            double avgTime = responseTimes.stream().mapToLong(Long::longValue).average().orElse(0);
            System.out.printf("  Projects: Avg response time: %.1fms (%d/%d successful)%n",
                avgTime, responseTimes.size(), iterations);
            
            if (avgTime > MAX_AVG_LATENCY_MS * 2) { // Allow 2x for more complex endpoint
                throw new RuntimeException(String.format(
                    "Average response time too high: %.1f > %dms", avgTime, MAX_AVG_LATENCY_MS * 2));
            }
            return true;
        });
    }
    
    /**
     * Test load performance
     */
    private static void testLoadPerformance() {
        System.out.println("\n=== LOAD PERFORMANCE TESTS ===");
        
        // Low load test (10 requests in parallel)
        runTest("LOAD - Low load (10 concurrent requests)", () -> {
            int threadCount = 10;
            Thread[] threads = new Thread[threadCount];
            int[] successCount = {0};
            
            for (int i = 0; i < threadCount; i++) {
                threads[i] = new Thread(() -> {
                    try {
                        var response = getHealth();
                        if (response.isSuccess()) {
                            synchronized (successCount) {
                                successCount[0]++;
                            }
                        }
                    } catch (Exception e) {
                        // ignore
                    }
                });
            }
            
            long startTime = System.currentTimeMillis();
            for (Thread t : threads) {
                t.start();
            }
            
            for (Thread t : threads) {
                try {
                    t.join(5000);
                } catch (InterruptedException e) {
                    t.interrupt();
                }
            }
            
            long totalTime = System.currentTimeMillis() - startTime;
            double successRate = (double) successCount[0] / threadCount;
            
            System.out.printf("  Low load: %d/%d successful (%.1f%%) in %dms%n",
                successCount[0], threadCount, successRate * 100, totalTime);
            
            if (successRate < MIN_SUCCESS_RATE) {
                throw new RuntimeException(String.format(
                    "Success rate too low: %.1f%% < %.1f%%", successRate * 100, MIN_SUCCESS_RATE * 100));
            }
            
            if (totalTime > 5000) { // 5 second timeout
                throw new RuntimeException("Load test took too long: " + totalTime + "ms");
            }
            return true;
        });
        
        // Medium load test (25 requests sequential)
        runTest("LOAD - Medium load (25 sequential requests)", () -> {
            int successCount = 0;
            int requestCount = 25;
            long startTime = System.currentTimeMillis();
            
            for (int i = 0; i < requestCount; i++) {
                try {
                    var response = getHealth();
                    if (response.isSuccess()) {
                        successCount++;
                    }
                } catch (Exception e) {
                    // ignore
                }
            }
            
            long totalTime = System.currentTimeMillis() - startTime;
            double successRate = (double) successCount / requestCount;
            double rps = requestCount / (totalTime / 1000.0);
            
            System.out.printf("  Medium load: %d/%d successful (%.1f%%), %.1f RPS in %dms%n",
                successCount, requestCount, successRate * 100, rps, totalTime);
            
            if (successRate < MIN_SUCCESS_RATE) {
                throw new RuntimeException(String.format(
                    "Success rate too low: %.1f%% < %.1f%%", successRate * 100, MIN_SUCCESS_RATE * 100));
            }
            
            if (rps < 10) { // Should handle at least 10 RPS
                throw new RuntimeException(String.format(
                    "Throughput too low: %.1f < 10 RPS", rps));
            }
            return true;
        });
    }
    
    /**
     * Test latency measurements
     */
    private static void testLatency() {
        System.out.println("\n=== LATENCY TESTS ===");
        
        // Response time distribution
        runTest("LATENCY - Response time distribution", () -> {
            List<Long> latencies = new ArrayList<>();
            int iterations = 50;
            
            for (int i = 0; i < iterations; i++) {
                long start = System.currentTimeMillis();
                try {
                    var response = getHealth();
                    long end = System.currentTimeMillis();
                    
                    if (response.isSuccess()) {
                        latencies.add(end - start);
                    }
                } catch (Exception e) {
                    // ignore
                }
            }
            
            if (latencies.isEmpty()) {
                throw new RuntimeException("No successful responses");
            }
            
            Collections.sort(latencies);
            
            long min = latencies.get(0);
            long max = latencies.get(latencies.size() - 1);
            double avg = latencies.stream().mapToLong(Long::longValue).average().orElse(0);
            
            // Calculate percentiles
            int p50Index = (int) (latencies.size() * 0.5);
            int p95Index = (int) (latencies.size() * 0.95);
            
            long p50 = latencies.get(p50Index);
            long p95 = latencies.get(p95Index);
            
            System.out.printf("  Latency: Min: %dms, Max: %dms, Avg: %.1fms, P50: %dms, P95: %dms%n",
                min, max, avg, p50, p95);
            
            if (avg > MAX_AVG_LATENCY_MS) {
                throw new RuntimeException(String.format(
                    "Average latency too high: %.1f > %dms", avg, MAX_AVG_LATENCY_MS));
            }
            
            if (p95 > MAX_AVG_LATENCY_MS * 3) { // P95 should be within 3x average
                throw new RuntimeException(String.format(
                    "P95 latency too high: %d > %dms", p95, MAX_AVG_LATENCY_MS * 3));
            }
            return true;
        });
    }
    
    /**
     * Run individual test with error handling
     */
    private static void runTest(String testName, TestCase testCase) {
        totalTests++;
        long startTime = System.currentTimeMillis();
        
        try {
            testCase.run();
            long executionTime = System.currentTimeMillis() - startTime;
            
            String status = "✅ PASS";
            System.out.printf("%s | %s | %dms%n", status, testName, executionTime);
            
            passedTests++;
            
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            System.out.printf("❌ FAIL | %s | %dms | %s%n", 
                testName, executionTime, e.getMessage());
        }
    }
    
    /**
     * Print final results summary
     */
    private static void printResults() {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("PERFORMANCE TEST RESULTS");
        System.out.println("=".repeat(60));
        System.out.printf("Total tests: %d%n", totalTests);
        System.out.printf("Passed: %d%n", passedTests);
        System.out.printf("Failed: %d%n", totalTests - passedTests);
        System.out.printf("Success rate: %.1f%%%n", (passedTests * 100.0 / totalTests));
        
        if (passedTests == totalTests) {
            System.out.println("🎉 ALL PERFORMANCE TESTS PASSED!");
        } else if (passedTests >= totalTests * 0.8) {
            System.out.println("✅ PERFORMANCE TESTS PASSED (with minor issues)");
        } else {
            System.out.println("❌ PERFORMANCE TESTS FAILED!");
        }
        
        // Performance summary
        System.out.println("\nPERFORMANCE THRESHOLDS:");
        System.out.printf("  Max average latency: %dms%n", MAX_AVG_LATENCY_MS);
        System.out.printf("  Min success rate: %.1f%%%n", MIN_SUCCESS_RATE * 100);
        System.out.println("=".repeat(60));
    }
}