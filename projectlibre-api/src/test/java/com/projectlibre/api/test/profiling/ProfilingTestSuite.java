package com.projectlibre.api.test.profiling;

import com.projectlibre.api.test.framework.HttpClientTestFramework;
import static com.projectlibre.api.test.framework.HttpClientTestFramework.*;

import java.lang.management.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Professional CPU/Memory Profiling Test Suite
 * Analyzes performance bottlenecks and resource utilization
 */
public class ProfilingTestSuite {
    
    private static int totalTests = 0;
    private static int passedTests = 0;
    
    // Performance thresholds
    private static final double MAX_CPU_USAGE = 80.0; // 80%
    private static final long MAX_HEAP_MB = 300; // 300MB
    private static final int MAX_THREAD_COUNT = 50;
    private static final double MAX_GC_TIME_PERCENT = 10.0; // 10%
    
    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("     CPU/MEMORY PROFILING TEST SUITE");
        System.out.println("=================================================");
        
        // Initialize monitoring
        initializeMonitoring();
        
        testCPUProfiling();
        testMemoryProfiling();
        testThreadProfiling();
        testGCProfiling();
        testLoadBasedProfiling();
        
        printFinalResults();
    }
    
    /**
     * Initialize JMX monitoring
     */
    private static void initializeMonitoring() {
        System.out.println("\n=== INITIALIZING MONITORING ===");
        runTest("MONITOR - JMX Setup", () -> {
            try {
                MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
                ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
                RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();
                OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
                
                if (memoryBean == null || threadBean == null || runtimeBean == null || osBean == null) {
                    throw new RuntimeException("JMX beans not available");
                }
                
                System.out.printf("  JVM: %s %s%n", runtimeBean.getVmName(), runtimeBean.getVmVersion());
                System.out.printf("  OS: %s %s%n", osBean.getName(), osBean.getVersion());
                System.out.printf("  CPUs: %d%n", osBean.getAvailableProcessors());
                System.out.printf("  Initial Heap: %d MB%n", getHeapUsageMB());
                return true;
            } catch (Exception e) {
                throw new RuntimeException("Monitoring initialization failed: " + e.getMessage());
            }
        });
    }
    
    /**
     * CPU Profiling Tests
     */
    private static void testCPUProfiling() {
        System.out.println("\n=== CPU PROFILING ===");
        
        runTest("CPU - Baseline measurement", () -> {
            OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
            
            // Baseline CPU measurement
            double baselineCPU = getProcessCpuLoad(osBean);
            System.out.printf("  Baseline CPU: %.1f%%%n", baselineCPU * 100);
            
            // CPU under light load
            long startTime = System.currentTimeMillis();
            int requestCount = 50;
            AtomicInteger successCount = new AtomicInteger(0);
            
            for (int i = 0; i < requestCount; i++) {
                try {
                    var response = getHealth();
                    if (response.isSuccess()) {
                        successCount.incrementAndGet();
                    }
                    Thread.sleep(10); // Small delay to simulate real usage
                } catch (Exception e) {
                    // ignore
                }
            }
            
            long endTime = System.currentTimeMillis();
            double avgCPU = getProcessCpuLoad(osBean);
            double duration = (endTime - startTime) / 1000.0;
            
            System.out.printf("  Requests: %d, Success: %d, Duration: %.1fs%n", 
                requestCount, successCount.get(), duration);
            System.out.printf("  Average CPU: %.1f%%%n", avgCPU * 100);
            
            if (avgCPU > MAX_CPU_USAGE / 100.0) {
                throw new RuntimeException(String.format(
                    "CPU usage too high: %.1f%% > %.1f%%", avgCPU * 100, MAX_CPU_USAGE));
            }
            return true;
        });
        
        runTest("CPU - Intensive load", () -> {
            OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
            
            // CPU intensive load
            int threadCount = 4;
            int requestsPerThread = 100;
            ExecutorService executor = Executors.newFixedThreadPool(threadCount);
            CountDownLatch latch = new CountDownLatch(threadCount);
            AtomicInteger totalRequests = new AtomicInteger(0);
            
            long startTime = System.currentTimeMillis();
            
            for (int i = 0; i < threadCount; i++) {
                executor.submit(() -> {
                    try {
                        for (int j = 0; j < requestsPerThread; j++) {
                            var response = getProjects(); // More complex endpoint
                            totalRequests.incrementAndGet();
                            Thread.sleep(5);
                        }
                    } catch (Exception e) {
                        // ignore
                    } finally {
                        latch.countDown();
                    }
                    return true;
        });
            }
            
            try {
                latch.await(30, TimeUnit.SECONDS);
                executor.shutdown();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            
            long endTime = System.currentTimeMillis();
            double maxCPU = getProcessCpuLoad(osBean);
            double duration = (endTime - startTime) / 1000.0;
            
            System.out.printf("  Intensive load: %d requests in %.1fs%n", totalRequests.get(), duration);
            System.out.printf("  Peak CPU: %.1f%%%n", maxCPU * 100);
            System.out.printf("  Throughput: %.1f RPS%n", totalRequests.get() / duration);
            
            if (maxCPU > MAX_CPU_USAGE / 100.0) {
                System.out.printf("  ⚠️  WARNING: High CPU usage: %.1f%%%n", maxCPU * 100);
            }
            return true;
        });
    }
    
    /**
     * Memory Profiling Tests
     */
    private static void testMemoryProfiling() {
        System.out.println("\n=== MEMORY PROFILING ===");
        
        runTest("MEMORY - Baseline measurement", () -> {
            MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
            
            long baselineHeap = getHeapUsageMB();
            long baselineNonHeap = getNonHeapUsageMB();
            
            System.out.printf("  Baseline Heap: %d MB%n", baselineHeap);
            System.out.printf("  Baseline Non-Heap: %d MB%n", baselineNonHeap);
            
            if (baselineHeap > MAX_HEAP_MB) {
                throw new RuntimeException(String.format(
                    "Baseline heap too high: %d MB > %d MB", baselineHeap, MAX_HEAP_MB));
            }
            return true;
        });
        
        runTest("MEMORY - Under load", () -> {
            MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
            
            long initialHeap = getHeapUsageMB();
            
            // Generate load and measure memory
            int requestCount = 200;
            List<String> responses = new ArrayList<>();
            
            for (int i = 0; i < requestCount; i++) {
                try {
                    var response = getProjects();
                    if (response.isSuccess()) {
                        // Store responses to increase memory pressure
                        responses.add(response.getBody());
                    }
                    
                    if (i % 50 == 0) {
                        // Trigger GC periodically
                        System.gc();
                        Thread.sleep(100);
                    }
                } catch (Exception e) {
                    // ignore
                }
            }
            
            long peakHeap = getHeapUsageMB();
            long finalHeap = getHeapUsageMB();
            
            // Clear memory
            responses.clear();
            System.gc();
            Thread.sleep(500);
            
            long clearedHeap = getHeapUsageMB();
            
            System.out.printf("  Initial Heap: %d MB%n", initialHeap);
            System.out.printf("  Peak Heap: %d MB%n", peakHeap);
            System.out.printf("  Final Heap: %d MB%n", finalHeap);
            System.out.printf("  After GC: %d MB%n", clearedHeap);
            System.out.printf("  Memory increase: %d MB%n", peakHeap - initialHeap);
            
            if (peakHeap > MAX_HEAP_MB) {
                throw new RuntimeException(String.format(
                    "Peak heap usage too high: %d MB > %d MB", peakHeap, MAX_HEAP_MB));
            }
            
            if (clearedHeap > initialHeap * 1.5) {
                System.out.printf("  ⚠️  WARNING: Possible memory leak: %d MB > %d MB (1.5x baseline)%n", 
                    clearedHeap, (long)(initialHeap * 1.5));
            }
            return true;
        });
    }
    
    /**
     * Thread Profiling Tests
     */
    private static void testThreadProfiling() {
        System.out.println("\n=== THREAD PROFILING ===");
        
        runTest("THREADS - Baseline count", () -> {
            ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
            
            int initialThreadCount = threadBean.getThreadCount();
            int peakThreadCount = threadBean.getPeakThreadCount();
            long totalStartedThreads = threadBean.getTotalStartedThreadCount();
            
            System.out.printf("  Current threads: %d%n", initialThreadCount);
            System.out.printf("  Peak threads: %d%n", peakThreadCount);
            System.out.printf("  Total started: %d%n", totalStartedThreads);
            
            if (initialThreadCount > MAX_THREAD_COUNT) {
                throw new RuntimeException(String.format(
                    "Too many threads: %d > %d", initialThreadCount, MAX_THREAD_COUNT));
            }
            return true;
        });
        
        runTest("THREADS - Under concurrent load", () -> {
            ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
            
            int initialThreads = threadBean.getThreadCount();
            
            // Concurrent load test
            int threadCount = 8;
            CountDownLatch latch = new CountDownLatch(threadCount);
            ExecutorService executor = Executors.newFixedThreadPool(threadCount);
            
            for (int i = 0; i < threadCount; i++) {
                executor.submit(() -> {
                    try {
                        for (int j = 0; j < 50; j++) {
                            var response = getHealth();
                            Thread.sleep(20);
                        }
                    } catch (Exception e) {
                        // ignore
                    } finally {
                        latch.countDown();
                    }
                    return true;
        });
            }
            
            try {
                latch.await(30, TimeUnit.SECONDS);
                executor.shutdown();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            
            int peakThreads = threadBean.getPeakThreadCount();
            int finalThreads = threadBean.getThreadCount();
            
            System.out.printf("  Initial threads: %d%n", initialThreads);
            System.out.printf("  Peak threads: %d%n", peakThreads);
            System.out.printf("  Final threads: %d%n", finalThreads);
            System.out.printf("  Thread increase: %d%n", peakThreads - initialThreads);
            
            if (peakThreads > MAX_THREAD_COUNT) {
                System.out.printf("  ⚠️  WARNING: High thread count: %d > %d%n", peakThreads, MAX_THREAD_COUNT);
            }
            return true;
        });
    }
    
    /**
     * Garbage Collection Profiling
     */
    private static void testGCProfiling() {
        System.out.println("\n=== GARBAGE COLLECTION PROFILING ===");
        
        runTest("GC - Baseline analysis", () -> {
            List<GarbageCollectorMXBean> gcBeans = ManagementFactory.getGarbageCollectorMXBeans();
            
            long totalGcCount = 0;
            long totalGcTime = 0;
            
            for (GarbageCollectorMXBean gcBean : gcBeans) {
                long count = gcBean.getCollectionCount();
                long time = gcBean.getCollectionTime();
                
                System.out.printf("  GC %s: %d collections, %d ms%n", 
                    gcBean.getName(), count, time);
                
                totalGcCount += count;
                totalGcTime += time;
            }
            
            System.out.printf("  Total GC collections: %d%n", totalGcCount);
            System.out.printf("  Total GC time: %d ms%n", totalGcTime);
            
            if (totalGcCount > 0) {
                double avgGcTime = (double) totalGcTime / totalGcCount;
                System.out.printf("  Average GC time: %.2f ms%n", avgGcTime);
            }
            return true;
        });
        
        runTest("GC - Under memory pressure", () -> {
            List<GarbageCollectorMXBean> gcBeans = ManagementFactory.getGarbageCollectorMXBeans();
            
            long initialGcTime = getGcTime(gcBeans);
            
            // Generate memory pressure
            List<byte[]> memoryConsumer = new ArrayList<>();
            
            for (int i = 0; i < 100; i++) {
                try {
                    var response = getProjects();
                    
                    // Allocate memory to trigger GC
                    memoryConsumer.add(new byte[1024 * 100]); // 100KB chunks
                    
                    if (memoryConsumer.size() > 50) {
                        memoryConsumer.clear(); // Release memory
                        System.gc();
                    }
                    
                    Thread.sleep(50);
                } catch (Exception e) {
                    // ignore
                }
            }
            
            // Force final GC
            memoryConsumer.clear();
            System.gc();
            Thread.sleep(1000);
            
            long finalGcTime = getGcTime(gcBeans);
            long gcTimeIncrease = finalGcTime - initialGcTime;
            
            System.out.printf("  GC time increase: %d ms%n", gcTimeIncrease);
            
            // Estimate GC overhead (rough calculation)
            long testDuration = 5000; // 5 seconds
            double gcOverheadPercent = (double) gcTimeIncrease / testDuration * 100;
            
            System.out.printf("  GC overhead: %.1f%%%n", gcOverheadPercent);
            
            if (gcOverheadPercent > MAX_GC_TIME_PERCENT) {
                System.out.printf("  ⚠️  WARNING: High GC overhead: %.1f%% > %.1f%%%n", 
                    gcOverheadPercent, MAX_GC_TIME_PERCENT);
            }
            return true;
        });
    }
    
    /**
     * Load-Based Profiling
     */
    private static void testLoadBasedProfiling() {
        System.out.println("\n=== LOAD-BASED PROFILING ===");
        
        runTest("LOAD - Sustained resource profiling", () -> {
            OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
            MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
            ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
            List<GarbageCollectorMXBean> gcBeans = ManagementFactory.getGarbageCollectorMXBeans();
            
            long initialGcTime = getGcTime(gcBeans);
            long startTime = System.currentTimeMillis();
            
            // Sustained load for 10 seconds
            int threadCount = 6;
            AtomicInteger requestCount = new AtomicInteger(0);
            ExecutorService executor = Executors.newFixedThreadPool(threadCount);
            CountDownLatch latch = new CountDownLatch(threadCount);
            
            for (int i = 0; i < threadCount; i++) {
                executor.submit(() -> {
                    try {
                        long endTime = startTime + 10000; // 10 seconds
                        while (System.currentTimeMillis() < endTime) {
                            var response = getHealth();
                            requestCount.incrementAndGet();
                            Thread.sleep(100); // 10 RPS per thread
                        }
                    } catch (Exception e) {
                        // ignore
                    } finally {
                        latch.countDown();
                    }
                    return true;
        });
            }
            
            try {
                latch.await(15, TimeUnit.SECONDS);
                executor.shutdown();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            // Collect final metrics
            long finalGcTime = getGcTime(gcBeans);
            long gcTimeIncrease = finalGcTime - initialGcTime;
            
            System.out.printf("  Test duration: %d ms%n", duration);
            System.out.printf("  Total requests: %d%n", requestCount.get());
            System.out.printf("  Average RPS: %.1f%n", requestCount.get() / (duration / 1000.0));
            System.out.printf("  Peak CPU: %.1f%%%n", getProcessCpuLoad(osBean) * 100);
            System.out.printf("  Final Heap: %d MB%n", getHeapUsageMB());
            System.out.printf("  Final Threads: %d%n", threadBean.getThreadCount());
            System.out.printf("  GC time increase: %d ms%n", gcTimeIncrease);
            System.out.printf("  GC overhead: %.1f%%%n", (double) gcTimeIncrease / duration * 100);
            
            // Performance assessment
            double rps = requestCount.get() / (duration / 1000.0);
            if (rps < 50) {
                throw new RuntimeException(String.format("Low throughput: %.1f < 50 RPS", rps));
            }
            
            long finalHeap = getHeapUsageMB();
            if (finalHeap > MAX_HEAP_MB) {
                throw new RuntimeException(String.format(
                    "High memory usage: %d MB > %d MB", finalHeap, MAX_HEAP_MB));
            }
            return true;
        });
    }
    
    // Helper methods for JMX metrics
    private static double getProcessCpuLoad(OperatingSystemMXBean osBean) {
        if (osBean instanceof com.sun.management.OperatingSystemMXBean) {
            return ((com.sun.management.OperatingSystemMXBean) osBean).getProcessCpuLoad();
        }
        return osBean.getSystemLoadAverage() / osBean.getAvailableProcessors();
    }
    
    private static long getHeapUsageMB() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
        return heapUsage.getUsed() / 1024 / 1024;
    }
    
    private static long getNonHeapUsageMB() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage nonHeapUsage = memoryBean.getNonHeapMemoryUsage();
        return nonHeapUsage.getUsed() / 1024 / 1024;
    }
    
    private static long getGcTime(List<GarbageCollectorMXBean> gcBeans) {
        return gcBeans.stream().mapToLong(GarbageCollectorMXBean::getCollectionTime).sum();
    }
    
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
    
    private static void printFinalResults() {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("CPU/MEMORY PROFILING RESULTS");
        System.out.println("=".repeat(60));
        System.out.printf("Total tests: %d%n", totalTests);
        System.out.printf("Passed: %d%n", passedTests);
        System.out.printf("Failed: %d%n", totalTests - passedTests);
        System.out.printf("Success rate: %.1f%%%n", (passedTests * 100.0 / totalTests));
        
        if (passedTests == totalTests) {
            System.out.println("🎉 ALL PROFILING TESTS PASSED!");
        } else if (passedTests >= totalTests * 0.8) {
            System.out.println("✅ PROFILING TESTS PASSED (with warnings)");
        } else {
            System.out.println("❌ PROFILING TESTS FAILED!");
        }
        
        System.out.println("\nPERFORMANCE THRESHOLDS:");
        System.out.printf("  Max CPU usage: %.1f%%%n", MAX_CPU_USAGE);
        System.out.printf("  Max heap memory: %d MB%n", MAX_HEAP_MB);
        System.out.printf("  Max thread count: %d%n", MAX_THREAD_COUNT);
        System.out.printf("  Max GC overhead: %.1f%%%n", MAX_GC_TIME_PERCENT);
        System.out.println("=".repeat(60));
    }
}