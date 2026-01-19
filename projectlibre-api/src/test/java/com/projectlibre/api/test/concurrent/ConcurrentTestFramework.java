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

import com.projectlibre.api.test.ConcurrentTestResult;
import com.projectlibre.api.test.TestScenario;
import com.projectlibre.api.test.ThreadTestResult;

/**
 * Multi-threaded testing framework for REST API endpoints
 * Provides comprehensive concurrent testing capabilities
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ConcurrentTestFramework {
    
    private final int threadCount;
    private final int requestsPerThread;
    private final ExecutorService executor;
    private final AtomicInteger successCount;
    private final AtomicInteger errorCount;
    private final AtomicLong totalResponseTime;
    
    public ConcurrentTestFramework(int threadCount, int requestsPerThread) {
        this.threadCount = threadCount;
        this.requestsPerThread = requestsPerThread;
        this.executor = Executors.newFixedThreadPool(threadCount);
        this.successCount = new AtomicInteger(0);
        this.errorCount = new AtomicInteger(0);
        this.totalResponseTime = new AtomicLong(0);
    }
    
    public ConcurrentTestResult executeTest(TestScenario scenario) {
        System.out.println("Starting concurrent test: " + scenario.getName());
        System.out.println("Threads: " + threadCount + ", Requests per thread: " + requestsPerThread);
        
        long startTime = System.nanoTime();
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threadCount);
        
        List<Future<ThreadTestResult>> futures = new ArrayList<>();
        
        // Submit threads
        for (int i = 0; i < threadCount; i++) {
            final int threadId = i;
            Future<ThreadTestResult> future = executor.submit(() -> 
                executeThreadTest(threadId, scenario, startLatch, finishLatch)
            );
            futures.add(future);
        }
        
        // Start all threads simultaneously
        startLatch.countDown();
        
        try {
            // Wait for all threads to complete
            boolean completed = finishLatch.await(60, TimeUnit.SECONDS);
            if (!completed) {
                System.err.println("WARNING: Test timed out waiting for threads to complete");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.err.println("Test interrupted: " + e.getMessage());
        }
        
        long endTime = System.nanoTime();
        long totalTimeMs = (endTime - startTime) / 1_000_000;
        
        // Collect results from all threads
        List<ThreadTestResult> threadResults = new ArrayList<>();
        for (Future<ThreadTestResult> future : futures) {
            try {
                ThreadTestResult result = future.get(5, TimeUnit.SECONDS);
                threadResults.add(result);
            } catch (Exception e) {
                System.err.println("Failed to get thread result: " + e.getMessage());
                threadResults.add(new ThreadTestResult(-1, 0, 0, 0, 
                    Collections.singletonList("Failed to collect result: " + e.getMessage())));
            }
        }
        
        return new ConcurrentTestResult(scenario.getName(), totalTimeMs, threadResults);
    }
    
    private ThreadTestResult executeThreadTest(int threadId, TestScenario scenario, 
                                        CountDownLatch startLatch, CountDownLatch finishLatch) {
        
        List<String> errors = new ArrayList<>();
        int threadSuccessCount = 0;
        int threadErrorCount = 0;
        long threadResponseTime = 0;
        
        try {
            // Wait for start signal
            startLatch.await();
            
            long threadStartTime = System.nanoTime();
            
            // Execute requests
            for (int i = 0; i < requestsPerThread; i++) {
                try {
                    long requestStart = System.nanoTime();
                    boolean success = scenario.executeRequest(threadId, i);
                    long requestEnd = System.nanoTime();
                    
                    long responseTimeMs = (requestEnd - requestStart) / 1_000_000;
                    threadResponseTime += responseTimeMs;
                    
                    if (success) {
                        threadSuccessCount++;
                        successCount.incrementAndGet();
                    } else {
                        threadErrorCount++;
                        errorCount.incrementAndGet();
                        errors.add("Thread " + threadId + " Request " + i + " failed");
                    }
                    
                    // Add small delay between requests to simulate realistic usage
                    Thread.sleep(10);
                    
                } catch (Exception e) {
                    threadErrorCount++;
                    errorCount.incrementAndGet();
                    errors.add("Thread " + threadId + " Request " + i + " exception: " + e.getMessage());
                    totalResponseTime.addAndGet(0);
                }
            }
            
            long threadEndTime = System.nanoTime();
            threadResponseTime = (threadEndTime - threadStartTime) / 1_000_000;
            totalResponseTime.addAndGet(threadResponseTime);
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            errors.add("Thread " + threadId + " interrupted");
        }
        
        finishLatch.countDown();
        return new ThreadTestResult(threadId, threadSuccessCount, threadErrorCount, 
                                threadResponseTime, errors);
    }
    
    public void shutdown() {
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
    
    public int getSuccessCount() {
        return successCount.get();
    }
    
    public int getErrorCount() {
        return errorCount.get();
    }
    
    public long getAverageResponseTime() {
        long totalRequests = threadCount * requestsPerThread;
        return totalRequests > 0 ? totalResponseTime.get() / totalRequests : 0;
    }
}