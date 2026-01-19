package com.projectlibre.api.test.concurrent;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentSkipListSet;
import java.util.Set;
import java.util.Map;
import java.util.HashSet;

/**
 * Specialized thread safety and race condition testing
 * Validates concurrent access patterns and data consistency
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ThreadSafetyTest {
    
    private static final int THREAD_COUNT = 25;
    private static final int OPERATIONS_PER_THREAD = 20;
    private static final AtomicInteger counter = new AtomicInteger(0);
    private static final AtomicLong raceConditionCount = new AtomicLong(0);
    private static final Map<String, String> sharedMap = new ConcurrentHashMap<>();
    private static final Set<String> operationLog = new ConcurrentSkipListSet<>();
    private static final AtomicInteger inconsistentStates = new AtomicInteger(0);
    
    public static void main(String[] args) {
        System.out.println("=== Thread Safety & Race Condition Test ===");
        System.out.println("Threads: " + THREAD_COUNT + ", Operations per thread: " + OPERATIONS_PER_THREAD);
        
        // Test different thread safety scenarios
        testCounterAtomicity();
        testMapConcurrency();
        testDeadlockPrevention();
        testDataConsistency();
        testResourceContention();
        
        System.out.println("\n=== Thread Safety Testing Completed ===");
    }
    
    private static void testCounterAtomicity() {
        System.out.println("\n--- Testing Counter Atomicity ---");
        
        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT);
        CyclicBarrier startBarrier = new CyclicBarrier(THREAD_COUNT);
        CountDownLatch finishLatch = new CountDownLatch(THREAD_COUNT);
        
        for (int i = 0; i < THREAD_COUNT; i++) {
            final int threadId = i;
            executor.submit(() -> {
                try {
                    startBarrier.await(); // Synchronized start
                    
                    for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                        int before = counter.get();
                        int after = counter.incrementAndGet();
                        
                        // Check for potential race condition
                        if (after != before + 1) {
                            raceConditionCount.incrementAndGet();
                            System.out.println("🔍 Race condition in counter: before=" + before + ", after=" + after);
                        }
                        
                        // Small delay to increase contention
                        if (j % 5 == 0) {
                            Thread.sleep(1);
                        }
                    }
                    
                    finishLatch.countDown();
                } catch (Exception e) {
                    System.err.println("Counter test failed: " + e.getMessage());
                }
            });
        }
        
        try {
            finishLatch.await();
            System.out.println("Final counter value: " + counter.get());
            System.out.println("Expected value: " + (THREAD_COUNT * OPERATIONS_PER_THREAD));
            System.out.println("Race conditions detected: " + raceConditionCount.get());
            
            if (counter.get() == THREAD_COUNT * OPERATIONS_PER_THREAD) {
                System.out.println("✅ Counter atomicity: PASSED");
            } else {
                System.out.println("❌ Counter atomicity: FAILED");
            }
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            executor.shutdown();
        }
    }
    
    private static void testMapConcurrency() {
        System.out.println("\n--- Testing Map Concurrency ---");
        
        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT);
        CountDownLatch finishLatch = new CountDownLatch(THREAD_COUNT);
        
        for (int i = 0; i < THREAD_COUNT; i++) {
            final int threadId = i;
            executor.submit(() -> {
                try {
                    for (int j = 0; j < OPERATIONS_PER_THREAD; j++) {
                        String key = "key_" + (threadId * OPERATIONS_PER_THREAD + j);
                        String value = "value_" + threadId + "_" + j;
                        
                        // Test concurrent map operations
                        String existing = sharedMap.put(key, value);
                        
                        if (existing != null && !operationLog.contains(key)) {
                            System.out.println("🔍 Unexpected concurrent access to key: " + key);
                            raceConditionCount.incrementAndGet();
                        }
                        
                        operationLog.add(key);
                        
                        // Test concurrent read
                        String readValue = sharedMap.get(key);
                        if (!value.equals(readValue)) {
                            inconsistentStates.incrementAndGet();
                            System.out.println("🔍 Inconsistent state: key=" + key + 
                                             ", expected=" + value + ", actual=" + readValue);
                        }
                        
                        Thread.sleep(2);
                    }
                    
                    finishLatch.countDown();
                } catch (Exception e) {
                    System.err.println("Map test failed: " + e.getMessage());
                }
            });
        }
        
        try {
            finishLatch.await();
            System.out.println("Map size: " + sharedMap.size());
            System.out.println("Expected size: " + (THREAD_COUNT * OPERATIONS_PER_THREAD));
            System.out.println("Inconsistent states: " + inconsistentStates.get());
            
            if (sharedMap.size() == THREAD_COUNT * OPERATIONS_PER_THREAD && inconsistentStates.get() == 0) {
                System.out.println("✅ Map concurrency: PASSED");
            } else {
                System.out.println("❌ Map concurrency: FAILED");
            }
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            executor.shutdown();
        }
    }
    
    private static void testDeadlockPrevention() {
        System.out.println("\n--- Testing Deadlock Prevention ---");
        
        final Object lock1 = new Object();
        final Object lock2 = new Object();
        final AtomicInteger deadlockCount = new AtomicInteger(0);
        
        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT / 2);
        CountDownLatch finishLatch = new CountDownLatch(THREAD_COUNT / 2);
        
        for (int i = 0; i < THREAD_COUNT / 2; i++) {
            final int threadId = i;
            executor.submit(() -> {
                try {
                    // Thread 1-10: lock1 -> lock2
                    // Thread 11-20: lock2 -> lock1
                    if (threadId % 2 == 0) {
                        synchronized (lock1) {
                            Thread.sleep(10);
                            synchronized (lock2) {
                                // Normal execution
                            }
                        }
                    } else {
                        synchronized (lock2) {
                            Thread.sleep(10);
                            synchronized (lock1) {
                                // Normal execution
                            }
                        }
                    }
                    
                    finishLatch.countDown();
                } catch (Exception e) {
                    deadlockCount.incrementAndGet();
                    System.err.println("Potential deadlock: " + e.getMessage());
                }
            });
        }
        
        try {
            boolean completed = finishLatch.await(30, TimeUnit.SECONDS);
            
            if (completed && deadlockCount.get() == 0) {
                System.out.println("✅ Deadlock prevention: PASSED");
            } else {
                System.out.println("❌ Deadlock prevention: FAILED - deadlocks detected");
            }
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            executor.shutdown();
        }
    }
    
    private static void testDataConsistency() {
        System.out.println("\n--- Testing Data Consistency ---");
        
        class SharedResource {
            private int value1 = 0;
            private int value2 = 0;
            
            public synchronized void updateValues(int v1, int v2) {
                this.value1 = v1;
                try {
                    Thread.sleep(1); // Increase chance of inconsistency
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                this.value2 = v2;
            }
            
            public synchronized boolean isConsistent() {
                return value1 == value2;
            }
            
            public synchronized int getValue1() {
                return value1;
            }
            
            public synchronized int getValue2() {
                return value2;
            }
        }
        
        SharedResource resource = new SharedResource();
        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT);
        CountDownLatch finishLatch = new CountDownLatch(THREAD_COUNT);
        AtomicInteger inconsistencyCount = new AtomicInteger(0);
        
        for (int i = 0; i < THREAD_COUNT; i++) {
            final int threadId = i;
            executor.submit(() -> {
                try {
                    for (int j = 0; j < 10; j++) {
                        resource.updateValues(threadId, threadId);
                        
                        if (!resource.isConsistent()) {
                            inconsistencyCount.incrementAndGet();
                            System.out.println("🔍 Inconsistent state detected: v1=" + 
                                             resource.getValue1() + ", v2=" + resource.getValue2());
                        }
                    }
                    
                    finishLatch.countDown();
                } catch (Exception e) {
                    System.err.println("Consistency test failed: " + e.getMessage());
                }
            });
        }
        
        try {
            finishLatch.await();
            System.out.println("Inconsistencies detected: " + inconsistencyCount.get());
            
            if (inconsistencyCount.get() == 0) {
                System.out.println("✅ Data consistency: PASSED");
            } else {
                System.out.println("❌ Data consistency: FAILED");
            }
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            executor.shutdown();
        }
    }
    
    private static void testResourceContention() {
        System.out.println("\n--- Testing Resource Contention ---");
        
        final AtomicInteger sharedCounter = new AtomicInteger(0);
        final Set<String> contentionLog = new HashSet<>();
        
        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT);
        CountDownLatch finishLatch = new CountDownLatch(THREAD_COUNT);
        
        for (int i = 0; i < THREAD_COUNT; i++) {
            final int threadId = i;
            executor.submit(() -> {
                try {
                    long startTime = System.nanoTime();
                    
                    for (int j = 0; j < 100; j++) {
                        // Simulate resource contention
                        synchronized (contentionLog) {
                            sharedCounter.incrementAndGet();
                            
                            // Simulate resource-intensive operation
                            Thread.sleep(1);
                        }
                    }
                    
                    long endTime = System.nanoTime();
                    long durationMs = (endTime - startTime) / 1_000_000;
                    
                    finishLatch.countDown();
                    
                    // Log contention analysis
                    if (durationMs > 1000) { // More than 1 second
                        System.out.println("🔍 High contention detected in thread " + threadId + 
                                         " (duration: " + durationMs + "ms)");
                    }
                    
                } catch (Exception e) {
                    System.err.println("Contention test failed: " + e.getMessage());
                }
            });
        }
        
        try {
            finishLatch.await();
            System.out.println("Final counter value: " + sharedCounter.get());
            System.out.println("Expected value: " + (THREAD_COUNT * 100));
            
            if (sharedCounter.get() == THREAD_COUNT * 100) {
                System.out.println("✅ Resource contention: MANAGED");
            } else {
                System.out.println("❌ Resource contention: HIGH");
            }
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            executor.shutdown();
        }
    }
}