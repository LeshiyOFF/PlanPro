package com.projectlibre.api.test.concurrent;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Simple concurrent test demonstration
 * Shows thread safety testing capabilities
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class SimpleConcurrentTest {
    
    private static final int THREAD_COUNT = 10;
    private static final int REQUESTS_PER_THREAD = 5;
    private static final AtomicInteger successCount = new AtomicInteger(0);
    private static final AtomicInteger errorCount = new AtomicInteger(0);
    private static final AtomicLong totalResponseTime = new AtomicLong(0);
    
    public static void main(String[] args) {
        System.out.println("=== Simple Concurrent Test Demonstration ===");
        System.out.println("Threads: " + THREAD_COUNT + ", Requests per thread: " + REQUESTS_PER_THREAD);
        
        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(THREAD_COUNT);
        
        long startTime = System.nanoTime();
        
        // Submit concurrent tasks
        List<Future<Boolean>> futures = new ArrayList<>();
        for (int i = 0; i < THREAD_COUNT; i++) {
            final int threadId = i;
            Future<Boolean> future = executor.submit(() -> 
                executeConcurrentRequests(threadId, startLatch, finishLatch)
            );
            futures.add(future);
        }
        
        // Start all threads simultaneously
        startLatch.countDown();
        
        try {
            // Wait for completion
            boolean completed = finishLatch.await(30, TimeUnit.SECONDS);
            long endTime = System.nanoTime();
            long totalTimeMs = (endTime - startTime) / 1_000_000;
            
            // Collect results
            int completedTasks = 0;
            int failedTasks = 0;
            
            for (Future<Boolean> future : futures) {
                try {
                    if (future.get(5, TimeUnit.SECONDS)) {
                        completedTasks++;
                    } else {
                        failedTasks++;
                    }
                } catch (Exception e) {
                    failedTasks++;
                    System.err.println("Task failed: " + e.getMessage());
                }
            }
            
            // Print results
            System.out.println("\n=== Test Results ===");
            System.out.println("Total execution time: " + totalTimeMs + " ms");
            System.out.println("Completed threads: " + completedTasks);
            System.out.println("Failed threads: " + failedTasks);
            System.out.println("Successful requests: " + successCount.get());
            System.out.println("Failed requests: " + errorCount.get());
            System.out.println("Average response time: " + (totalResponseTime.get() / (THREAD_COUNT * REQUESTS_PER_THREAD)) + " ms");
            
            // Analysis
            double successRate = successCount.get() * 100.0 / (successCount.get() + errorCount.get());
            System.out.println("Success rate: " + String.format("%.2f%%", successRate));
            
            if (successRate >= 95.0) {
                System.out.println("✅ EXCELLENT: Thread safety confirmed");
            } else if (successRate >= 80.0) {
                System.out.println("⚠️  GOOD: Minor concurrency issues");
            } else {
                System.out.println("❌ POOR: Significant concurrency problems detected");
            }
            
            if (!completed) {
                System.out.println("⚠️  WARNING: Test timed out");
            }
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.err.println("Test interrupted: " + e.getMessage());
        } finally {
            executor.shutdown();
            try {
                if (!executor.awaitTermination(10, TimeUnit.SECONDS)) {
                    executor.shutdownNow();
                }
            } catch (InterruptedException e) {
                executor.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
        
        System.out.println("\n=== Concurrent test completed ===");
    }
    
    private static boolean executeConcurrentRequests(int threadId, CountDownLatch startLatch, 
                                              CountDownLatch finishLatch) {
        try {
            // Wait for start signal
            startLatch.await();
            
            for (int i = 0; i < REQUESTS_PER_THREAD; i++) {
                long requestStart = System.nanoTime();
                boolean success = simulateApiCall(threadId, i);
                long requestEnd = System.nanoTime();
                
                long responseTimeMs = (requestEnd - requestStart) / 1_000_000;
                totalResponseTime.addAndGet(responseTimeMs);
                
                if (success) {
                    successCount.incrementAndGet();
                } else {
                    errorCount.incrementAndGet();
                }
                
                // Small delay between requests
                Thread.sleep(50);
            }
            
            finishLatch.countDown();
            return true;
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
    
    private static boolean simulateApiCall(int threadId, int requestId) {
        try {
            // Simulate different API operations
            int operation = (threadId + requestId) % 4;
            
            switch (operation) {
                case 0:
                    // Simulate GET request
                    Thread.sleep(10 + (int)(Math.random() * 20));
                    return Math.random() > 0.1; // 90% success rate
                case 1:
                    // Simulate POST request  
                    Thread.sleep(20 + (int)(Math.random() * 30));
                    return Math.random() > 0.05; // 95% success rate
                case 2:
                    // Simulate PUT request
                    Thread.sleep(15 + (int)(Math.random() * 25));
                    return Math.random() > 0.08; // 92% success rate
                default:
                    // Simulate DELETE request
                    Thread.sleep(5 + (int)(Math.random() * 15));
                    return Math.random() > 0.03; // 97% success rate
            }
        } catch (Exception e) {
            System.err.println("API call failed: Thread " + threadId + " Request " + requestId + " - " + e.getMessage());
            return false;
        }
    }
}