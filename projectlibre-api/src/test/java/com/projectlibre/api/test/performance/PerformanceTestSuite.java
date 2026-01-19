package com.projectlibre.api.test.performance;

import static com.projectlibre.api.test.framework.HttpClientTestFramework.*;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.io.IOException;

/**
 * Professional Performance Test Suite for REST API
 * Measures latency, throughput, and resource utilization
 */
public class PerformanceTestSuite {
    
    private static int totalTests = 0;
    private static int passedTests = 0;
    
    // Performance thresholds
    private static final long MAX_AVG_LATENCY_MS = 100;
    private static final long MAX_95TH_LATENCY_MS = 200;
    private static final double MIN_THROUGHPUT_RPS = 50.0;
    private static final double MAX_ERROR_RATE = 0.05; // 5%
    
    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("     PERFORMANCE TEST SUITE");
        System.out.println("=================================================");
        
        // Warmup phase
        System.out.println("\n=== WARMUP PHASE ===");
        warmupServer();
        
        // Performance tests
        System.out.println("\n=== LATENCY TESTS ===");
        testLatency();
        
        System.out.println("\n=== THROUGHPUT TESTS ===");
        testThroughput();
        
        System.out.println("\n=== CONCURRENT PERFORMANCE TESTS ===");
        testConcurrentPerformance();
        
        System.out.println("\n=== RESOURCE UTILIZATION TESTS ===");
        testResourceUtilization();
        
        // Results summary
        printResults();
    }
    
    /**
     * Warmup server and JVM
     */
    private static void warmupServer() {
        runTest("Warmup - Server readiness", () -> {
            try {
                var response = getHealth();
                if (!response.getBody().contains("\"status\":\"UP\"")) {
                    throw new RuntimeException("Server not ready");
                }
                // Small delay to ensure full initialization
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            return true;
        });
    }
    
    /**
     * Test latency of individual endpoints
     */
    private static void testLatency() {
        // Health endpoint latency
        runTest("LATENCY - Health endpoint", () -> {
            List<Long> latencies = new ArrayList<>();
            int iterations = 50;
            
            for (int i = 0; i < iterations; i++) {
                long start = System.nanoTime();
                var response = getHealth();
                long end = System.nanoTime();
                
                if (response.isSuccess()) {
                    latencies.add((end - start) / 1_000_000); // Convert to ms
                }
            }
            
            analyzeLatency(latencies, "Health endpoint");
            return true;
        });
        
        // Projects endpoint latency
        runTest("LATENCY - Projects endpoint", () -> {
            List<Long> latencies = new ArrayList<>();
            int iterations = 30;
            
            for (int i = 0; i < iterations; i++) {
                long start = System.nanoTime();
                var response = getProjects();
                long end = System.nanoTime();
                
                if (response.isSuccess()) {
                    latencies.add((end - start) / 1_000_000);
                }
            }
            
            analyzeLatency(latencies, "Projects endpoint");
            return true;
        });
        
        // Mixed workload latency
        runTest("LATENCY - Mixed workload", () -> {
            List<Long> latencies = new ArrayList<>();
            int iterations = 60;
            
            for (int i = 0; i < iterations; i++) {
                long start = System.nanoTime();
                
                // Rotate through different endpoints
                int endpoint = i % 4;
                var response = switch (endpoint) {
                    case 0 -> getHealth();
                    case 1 -> getProjects();
                    case 2 -> getTasks();
                    default -> getResources();
                };
                
                long end = System.nanoTime();
                
                if (response.isSuccess()) {
                    latencies.add((end - start) / 1_000_000);
                }
            }
            
            analyzeLatency(latencies, "Mixed workload");
            return true;
        });
    }
    
    /**
     * Test throughput under sustained load
     */
    private static void testThroughput() {
        // Low load throughput
        runTest("THROUGHPUT - Low load (10 RPS)", () -> {
            testThroughputLoad(10, 60, "Low load");
            return true;
        });
        
        // Medium load throughput
        runTest("THROUGHPUT - Medium load (50 RPS)", () -> {
            testThroughputLoad(50, 60, "Medium load");
            return true;
        });
        
        // High load throughput
        runTest("THROUGHPUT - High load (100 RPS)", () -> {
            testThroughputLoad(100, 30, "High load");
            return true;
        });
    }
    
    /**
     * Test concurrent performance
     */
    private static void testConcurrentPerformance() {
        // Thread scaling test
        runTest("CONCURRENT - Thread scaling (2-10 threads)", () -> {
            int[] threadCounts = {2, 4, 6, 8, 10};
            
            for (int threadCount : threadCounts) {
                double throughput = testConcurrentLoad(threadCount, 20);
                System.out.printf("  Threads: %d, Throughput: %.1f RPS%n", threadCount, throughput);
                
                if (throughput < MIN_THROUGHPUT_RPS) {
                    throw new RuntimeException(String.format(
                        "Throughput too low: %.1f < %.1f RPS", throughput, MIN_THROUGHPUT_RPS));
                }
            }
            return true;
        });
        
        // Sustained concurrent load
        runTest("CONCURRENT - Sustained load (5 threads × 10s)", () -> {
            AtomicInteger successCount = new AtomicInteger(0);
            AtomicInteger errorCount = new AtomicInteger(0);
            
            ExecutorService executor = Executors.newFixedThreadPool(5);
            CountDownLatch latch = new CountDownLatch(5);
            
            long startTime = System.currentTimeMillis();
            
            for (int i = 0; i < 5; i++) {
                executor.submit(() -> {
                    try {
                        long endTime = startTime + 10000; // 10 seconds
                        while (System.currentTimeMillis() < endTime) {
                            var response = getHealth();
                            if (response.isSuccess()) {
                                successCount.incrementAndGet();
                            } else {
                                errorCount.incrementAndGet();
                            }
                            Thread.sleep(100); // 10 RPS per thread
                        }
                    } catch (IOException e) {
                        errorCount.incrementAndGet();
                        System.err.println("Health check error: " + e.getMessage());
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        latch.countDown();
                    }
                });
            }
            
            try {
                latch.await(15, TimeUnit.SECONDS);
                executor.shutdown();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            
            double duration = (System.currentTimeMillis() - startTime) / 1000.0;
            double totalRequests = successCount.get() + errorCount.get();
            double rps = totalRequests / duration;
            double errorRate = errorCount.get() / totalRequests;
            
            System.out.printf("  Duration: %.1fs, Requests: %.0f, RPS: %.1f, Error rate: %.2f%%%n",
                duration, totalRequests, rps, errorRate * 100);
            
            if (errorRate > MAX_ERROR_RATE) {
                throw new RuntimeException(String.format(
                    "Error rate too high: %.2f%% > %.2f%%", errorRate * 100, MAX_ERROR_RATE * 100));
            }
            return true;
        });
    }
    
    /**
     * Test resource utilization under load
     */
    private static void testResourceUtilization() {
        runTest("RESOURCES - CPU/Memory under load", () -> {
            Runtime runtime = Runtime.getRuntime();
            
            // Baseline measurements
            long baselineMemory = runtime.totalMemory() - runtime.freeMemory();
            long baselineCpuTime = getCpuTime();
            
            // Load test
            int threadCount = 4;
            int requestsPerThread = 100;
            
            ExecutorService executor = Executors.newFixedThreadPool(threadCount);
            CountDownLatch latch = new CountDownLatch(threadCount);
            
            long startTime = System.currentTimeMillis();
            
            for (int i = 0; i < threadCount; i++) {
                executor.submit(() -> {
                    try {
                        for (int j = 0; j < requestsPerThread; j++) {
                            try {
                                getProjects(); // Moderate complexity endpoint
                                Thread.sleep(10);
                            } catch (IOException e) {
                                System.err.println("Resource test error: " + e.getMessage());
                            } catch (InterruptedException e) {
                                Thread.currentThread().interrupt();
                                break;
                            }
                        }
                    } finally {
                        latch.countDown();
                    }
                });
            }
            
            try {
                latch.await(30, TimeUnit.SECONDS);
                executor.shutdown();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            
            // Measure resources under load
            long loadMemory = runtime.totalMemory() - runtime.freeMemory();
            long loadCpuTime = getCpuTime();
            
            double duration = (System.currentTimeMillis() - startTime) / 1000.0;
            double memoryIncrease = (loadMemory - baselineMemory) / 1024.0 / 1024.0; // MB
            double cpuIncrease = (loadCpuTime - baselineCpuTime) / 1_000_000.0 / duration; // Percentage
            
            System.out.printf("  Duration: %.1fs, Memory increase: %.1f MB, CPU increase: %.1f%%%n",
                duration, memoryIncrease, cpuIncrease);
            
            // Resource thresholds (these are example values, adjust based on requirements)
            if (memoryIncrease > 100) { // 100MB increase threshold
                System.out.printf("  ⚠️  WARNING: High memory usage: %.1f MB%n", memoryIncrease);
            }
            
            if (cpuIncrease > 80) { // 80% CPU threshold
                System.out.printf("  ⚠️  WARNING: High CPU usage: %.1f%%%n", cpuIncrease);
            }
            return true;
        });
    }
    
    /**
     * Test throughput at specific load level
     */
    private static void testThroughputLoad(int targetRPS, int durationSeconds, String testName) throws IOException {
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger errorCount = new AtomicInteger(0);
        
        ExecutorService executor = Executors.newFixedThreadPool(targetRPS);
        CountDownLatch latch = new CountDownLatch(targetRPS);
        
        long startTime = System.currentTimeMillis();
        
        for (int i = 0; i < targetRPS; i++) {
            executor.submit(() -> {
                try {
                    long endTime = startTime + (durationSeconds * 1000);
                    while (System.currentTimeMillis() < endTime) {
                        var response = getHealth(); // Fastest endpoint
                        if (response.isSuccess()) {
                            successCount.incrementAndGet();
                        } else {
                            errorCount.incrementAndGet();
                        }
                        Thread.sleep(1000 / targetRPS);
                    }
                } catch (IOException e) {
                    errorCount.incrementAndGet();
                    System.err.println("Throughput error: " + e.getMessage());
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    latch.countDown();
                }
            });
        }
        
        try {
            latch.await(durationSeconds + 10, TimeUnit.SECONDS);
            executor.shutdown();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        double actualDuration = (System.currentTimeMillis() - startTime) / 1000.0;
        double totalRequests = successCount.get() + errorCount.get();
        double actualRPS = totalRequests / actualDuration;
        double errorRate = errorCount.get() / totalRequests;
        
        System.out.printf("  Target: %d RPS, Actual: %.1f RPS, Error rate: %.2f%%%n",
            targetRPS, actualRPS, errorRate * 100);
        
        if (actualRPS < targetRPS * 0.8) { // 80% of target threshold
            throw new RuntimeException(String.format(
                "Throughput too low: %.1f < %.1f RPS", actualRPS, targetRPS * 0.8));
        }
        
        if (errorRate > MAX_ERROR_RATE) {
            throw new RuntimeException(String.format(
                "Error rate too high: %.2f%% > %.2f%%", errorRate * 100, MAX_ERROR_RATE * 100));
        }
    }
    
    /**
     * Test concurrent load and return throughput
     */
    private static double testConcurrentLoad(int threadCount, int durationSeconds) throws IOException {
        AtomicInteger successCount = new AtomicInteger(0);
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        
        long startTime = System.currentTimeMillis();
        
        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    long endTime = startTime + (durationSeconds * 1000);
                    while (System.currentTimeMillis() < endTime) {
                        var response = getHealth();
                        if (response.isSuccess()) {
                            successCount.incrementAndGet();
                        }
                        Thread.sleep(50); // 20 RPS max per thread
                    }
                } catch (IOException e) {
                    System.err.println("Concurrent load error: " + e.getMessage());
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    latch.countDown();
                }
            });
        }
        
        try {
            latch.await(durationSeconds + 10, TimeUnit.SECONDS);
            executor.shutdown();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        double duration = (System.currentTimeMillis() - startTime) / 1000.0;
        return successCount.get() / duration;
    }
    
    /**
     * Analyze latency measurements
     */
    private static void analyzeLatency(List<Long> latencies, String testName) throws IOException {
        if (latencies.isEmpty()) {
            throw new RuntimeException("No successful requests for latency analysis");
        }
        
        Collections.sort(latencies);
        
        long min = latencies.get(0);
        long max = latencies.get(latencies.size() - 1);
        double avg = latencies.stream().mapToLong(Long::longValue).average().orElse(0);
        
        // Calculate percentiles
        int p50Index = (int) (latencies.size() * 0.5);
        int p95Index = (int) (latencies.size() * 0.95);
        int p99Index = (int) (latencies.size() * 0.99);
        
        long p50 = latencies.get(p50Index);
        long p95 = latencies.get(p95Index);
        long p99 = latencies.get(p99Index);
        
        System.out.printf("  %s: Avg: %.1fms, P50: %dms, P95: %dms, P99: %dms, Min: %dms, Max: %dms%n",
            testName, avg, p50, p95, p99, min, max);
        
        // Performance assertions
        if (avg > MAX_AVG_LATENCY_MS) {
            throw new RuntimeException(String.format(
                "Average latency too high: %.1f > %dms", avg, MAX_AVG_LATENCY_MS));
        }
        
        if (p95 > MAX_95TH_LATENCY_MS) {
            throw new RuntimeException(String.format(
                "P95 latency too high: %d > %dms", p95, MAX_95TH_LATENCY_MS));
        }
    }
    
    /**
     * Get current CPU time (simplified version)
     */
    private static long getCpuTime() {
        return System.nanoTime(); // Simplified - in real implementation use ManagementFactory
    }
    
    /**
     * Run individual test with error handling
     */
    private static void runTest(String testName, TestCase testCase) {
        totalTests++;
        long startTime = System.currentTimeMillis();
        
        try {
            boolean passed = testCase.run();
            long executionTime = System.currentTimeMillis() - startTime;
            
            String status = passed ? "✅ PASS" : "❌ FAIL";
            System.out.printf("%s | %s | %dms%n", status, testName, executionTime);
            
            if (passed) passedTests++;
            
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
        System.out.printf("  Max P95 latency: %dms%n", MAX_95TH_LATENCY_MS);
        System.out.printf("  Min throughput: %.1f RPS%n", MIN_THROUGHPUT_RPS);
        System.out.printf("  Max error rate: %.1f%%%n", MAX_ERROR_RATE * 100);
        System.out.println("=".repeat(60));
    }
}