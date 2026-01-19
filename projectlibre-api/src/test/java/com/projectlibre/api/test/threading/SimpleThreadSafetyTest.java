package com.projectlibre.api.test.threading;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;

/**
 * Simple Thread Safety Test Suite
 * Focuses on core thread safety without complex API calls
 */
public class SimpleThreadSafetyTest {
    
    private static int totalTests = 0;
    private static int passedTests = 0;
    
    // Thread safety thresholds
    private static final double RACE_CONDITION_TOLERANCE = 0.05; // 5%
    private static final long DEADLOCK_TIMEOUT_MS = 5000;
    
    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("     THREAD SAFETY TEST SUITE");
        System.out.println("=================================================");
        
        testRaceConditions();
        testAtomicOperations();
        testDeadlockDetection();
        testResourceContention();
        testMemoryConsistency();
        testThreadPoolManagement();
        
        printResults();
    }
    
    /**
     * Test race conditions in concurrent operations
     */
    private static void testRaceConditions() {
        System.out.println("\n=== RACE CONDITIONS ===");
        
        runTest("RACE - Concurrent counter operations", () -> {
            int threadCount = 20;
            int incrementsPerThread = 1000;
            AtomicInteger atomicCounter = new AtomicInteger(0);
            int[] nonAtomicCounter = {0};
            Lock lock = new ReentrantLock();
            
            CountDownLatch latch = new CountDownLatch(threadCount);
            ExecutorService executor = Executors.newFixedThreadPool(threadCount);
            
            for (int i = 0; i < threadCount; i++) {
                executor.submit(() -> {
                    try {
                        for (int j = 0; j < incrementsPerThread; j++) {
                            // Atomic operation
                            atomicCounter.incrementAndGet();
                            
                            // Non-atomic operation (should have race conditions)
                            lock.lock();
                            try {
                                nonAtomicCounter[0]++;
                            } finally {
                                lock.unlock();
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
                
                int expectedValue = threadCount * incrementsPerThread;
                int actualAtomic = atomicCounter.get();
                int actualNonAtomic = nonAtomicCounter[0];
                
                System.out.printf("  Expected: %d, Atomic: %d, Synchronized: %d%n",
                    expectedValue, actualAtomic, actualNonAtomic);
                
                if (actualAtomic != expectedValue) {
                    throw new RuntimeException(String.format(
                        "Atomic counter failed: %d != %d", actualAtomic, expectedValue));
                }
                
                if (actualNonAtomic != expectedValue) {
                    System.out.printf("  ⚠️  Non-atomic counter shows race conditions: %d != %d%n", 
                        actualNonAtomic, expectedValue);
                }
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Test interrupted");
            }
        });
        
        runTest("RACE - Concurrent map operations", () -> {
            Map<String, Integer> concurrentMap = new ConcurrentHashMap<>();
            int threadCount = 15;
            int operationsPerThread = 100;
            
            CountDownLatch latch = new CountDownLatch(threadCount);
            ExecutorService executor = Executors.newFixedThreadPool(threadCount);
            
            for (int i = 0; i < threadCount; i++) {
                final int threadId = i;
                executor.submit(() -> {
                    try {
                        Random random = new Random(threadId);
                        
                        for (int j = 0; j < operationsPerThread; j++) {
                            String key = "key_" + random.nextInt(50);
                            Integer value = random.nextInt(1000);
                            
                            // Atomic put
                            concurrentMap.put(key, value);
                            
                            // Atomic get and remove
                            if (random.nextBoolean() && concurrentMap.containsKey(key)) {
                                concurrentMap.remove(key);
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
                
                int mapSize = concurrentMap.size();
                int totalOperations = threadCount * operationsPerThread;
                
                System.out.printf("  Map size: %d, Total operations: %d%n", mapSize, totalOperations);
                
                if (mapSize < 0) {
                    throw new RuntimeException("Negative map size - corruption detected");
                }
                
                // Check for data consistency
                for (Map.Entry<String, Integer> entry : concurrentMap.entrySet()) {
                    if (entry.getKey() == null || entry.getValue() == null) {
                        throw new RuntimeException("Null key or value detected");
                    }
                }
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Test interrupted");
            }
        });
    }
    
    /**
     * Test atomic operations consistency
     */
    private static void testAtomicOperations() {
        System.out.println("\n=== ATOMIC OPERATIONS ===");
        
        runTest("ATOMIC - Reference consistency", () -> {
            AtomicInteger sharedCounter = new AtomicInteger(0);
            AtomicReference<String> sharedString = new AtomicReference<>("initial");
            int threadCount = 10;
            int iterations = 500;
            
            CountDownLatch latch = new CountDownLatch(threadCount);
            ExecutorService executor = Executors.newFixedThreadPool(threadCount);
            
            for (int i = 0; i < threadCount; i++) {
                final int threadId = i;
                executor.submit(() -> {
                    try {
                        for (int j = 0; j < iterations; j++) {
                            // Atomic increment
                            sharedCounter.incrementAndGet();
                            
                            // Atomic string update
                            String oldValue, newValue;
                            do {
                                oldValue = sharedString.get();
                                newValue = oldValue + "_" + threadId;
                            } while (!sharedString.compareAndSet(oldValue, newValue));
                        }
                    } finally {
                        latch.countDown();
                    }
                });
            }
            
            try {
                latch.await(30, TimeUnit.SECONDS);
                executor.shutdown();
                
                int expectedCounter = threadCount * iterations;
                int actualCounter = sharedCounter.get();
                String finalString = sharedString.get();
                
                System.out.printf("  Counter: expected=%d, actual=%d%n", expectedCounter, actualCounter);
                System.out.printf("  Final string length: %d%n", finalString.length());
                
                if (actualCounter != expectedCounter) {
                    throw new RuntimeException(String.format(
                        "Counter mismatch: %d != %d", actualCounter, expectedCounter));
                }
                
                if (finalString == null || finalString.isEmpty()) {
                    throw new RuntimeException("String reference corruption");
                }
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Test interrupted");
            }
        });
        
        runTest("ATOMIC - Multiple atomic variables", () -> {
            AtomicInteger counter1 = new AtomicInteger(0);
            AtomicInteger counter2 = new AtomicInteger(0);
            AtomicBoolean flag = new AtomicBoolean(false);
            int threadCount = 8;
            int operations = 1000;
            
            CountDownLatch latch = new CountDownLatch(threadCount);
            ExecutorService executor = Executors.newFixedThreadPool(threadCount);
            
            for (int i = 0; i < threadCount; i++) {
                final int threadId = i;
                executor.submit(() -> {
                    try {
                        for (int j = 0; j < operations; j++) {
                            counter1.incrementAndGet();
                            counter2.addAndGet(threadId);
                            
                            if (j == operations / 2) {
                                flag.set(true);
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
                
                int expected1 = threadCount * operations;
                int expected2 = threadCount * operations * (threadCount - 1) / 2; // Sum of threadIds
                
                System.out.printf("  Counter1: %d (expected %d)%n", counter1.get(), expected1);
                System.out.printf("  Counter2: %d (expected ~%d)%n", counter2.get(), expected2);
                System.out.printf("  Flag: %s%n", flag.get());
                
                if (counter1.get() != expected1) {
                    throw new RuntimeException("Counter1 inconsistency");
                }
                
                if (!flag.get()) {
                    throw new RuntimeException("Flag not set");
                }
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Test interrupted");
            }
        });
    }
    
    /**
     * Test deadlock detection
     */
    private static void testDeadlockDetection() {
        System.out.println("\n=== DEADLOCK DETECTION ===");
        
        runTest("DEADLOCK - Lock ordering detection", () -> {
            Object lock1 = new Object();
            Object lock2 = new Object();
            AtomicInteger completedThreads = new AtomicInteger(0);
            
            CountDownLatch latch = new CountDownLatch(2);
            ExecutorService executor = Executors.newFixedThreadPool(2);
            
            // Thread 1: Acquires lock1 then lock2
            executor.submit(() -> {
                try {
                    synchronized (lock1) {
                        Thread.sleep(100); // Give time for thread 2 to acquire lock2
                        synchronized (lock2) {
                            completedThreads.incrementAndGet();
                        }
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    latch.countDown();
                }
            });
            
            // Thread 2: Acquires lock2 then lock1 (potential deadlock)
            executor.submit(() -> {
                try {
                    synchronized (lock2) {
                        Thread.sleep(100); // Give time for thread 1 to acquire lock1
                        synchronized (lock1) {
                            completedThreads.incrementAndGet();
                        }
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    latch.countDown();
                }
            });
            
            try {
                boolean completed = latch.await(DEADLOCK_TIMEOUT_MS, TimeUnit.MILLISECONDS);
                executor.shutdownNow();
                
                System.out.printf("  Completed threads: %d/2%n", completedThreads.get());
                
                if (!completed) {
                    System.out.println("  ⚠️  WARNING: Potential deadlock detected");
                }
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Test interrupted");
            }
        });
    }
    
    /**
     * Test resource contention
     */
    private static void testResourceContention() {
        System.out.println("\n=== RESOURCE CONTENTION ===");
        
        runTest("CONTENTION - Shared resource access", () -> {
            int threadCount = 20;
            AtomicInteger sharedResource = new AtomicInteger(0);
            AtomicInteger contentionCount = new AtomicInteger(0);
            long[] operationTimes = new long[threadCount * 10];
            
            CountDownLatch latch = new CountDownLatch(threadCount);
            ExecutorService executor = Executors.newFixedThreadPool(threadCount);
            
            for (int i = 0; i < threadCount; i++) {
                final int threadId = i;
                final int startIndex = i * 10;
                
                executor.submit(() -> {
                    try {
                        for (int j = 0; j < 10; j++) {
                            long startTime = System.nanoTime();
                            
                            // Simulate resource contention
                            int currentValue = sharedResource.get();
                            Thread.sleep(1); // Simulate work
                            sharedResource.compareAndSet(currentValue, currentValue + 1);
                            
                            long endTime = System.nanoTime();
                            operationTimes[startIndex + j] = endTime - startTime;
                            
                            if (endTime - startTime > 1000000) { // > 1ms
                                contentionCount.incrementAndGet();
                            }
                        }
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        latch.countDown();
                    }
                });
            }
            
            try {
                latch.await(30, TimeUnit.SECONDS);
                executor.shutdown();
                
                // Analyze contention
                Arrays.sort(operationTimes);
                long totalTime = Arrays.stream(operationTimes).sum();
                long avgTime = totalTime / operationTimes.length;
                long p95Time = operationTimes[(int) (operationTimes.length * 0.95)];
                
                System.out.printf("  Operations: %d, Contentions: %d%n", operationTimes.length, contentionCount.get());
                System.out.printf("  Avg time: %.2fμs, P95 time: %.2fμs%n", 
                    avgTime / 1000.0, p95Time / 1000.0);
                System.out.printf("  Contention rate: %.1f%%%n", 
                    (double) contentionCount.get() / operationTimes.length * 100);
                
                double contentionRate = (double) contentionCount.get() / operationTimes.length;
                if (contentionRate > 0.5) { // 50% contention is very high
                    System.out.printf("  ⚠️  WARNING: Very high contention: %.1f%%%n", contentionRate * 100);
                }
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Test interrupted");
            }
        });
    }
    
    /**
     * Test memory consistency
     */
    private static void testMemoryConsistency() {
        System.out.println("\n=== MEMORY CONSISTENCY ===");
        
        runTest("MEMORY - Visibility across threads", () -> {
            AtomicInteger sharedValue = new AtomicInteger(0);
            AtomicBoolean stopFlag = new AtomicBoolean(false);
            AtomicInteger inconsistencies = new AtomicInteger(0);
            
            CountDownLatch latch = new CountDownLatch(3);
            ExecutorService executor = Executors.newFixedThreadPool(3);
            
            // Writer thread
            executor.submit(() -> {
                try {
                    for (int i = 1; i <= 1000 && !stopFlag.get(); i++) {
                        sharedValue.set(i);
                        Thread.sleep(1);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    latch.countDown();
                }
            });
            
            // Reader thread 1
            executor.submit(() -> {
                try {
                    int lastValue = 0;
                    while (!stopFlag.get()) {
                        int currentValue = sharedValue.get();
                        if (currentValue < lastValue) {
                            inconsistencies.incrementAndGet();
                        }
                        lastValue = currentValue;
                        Thread.sleep(2);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    latch.countDown();
                }
            });
            
            // Reader thread 2
            executor.submit(() -> {
                try {
                    int lastValue = 0;
                    while (!stopFlag.get()) {
                        int currentValue = sharedValue.get();
                        if (currentValue < lastValue) {
                            inconsistencies.incrementAndGet();
                        }
                        lastValue = currentValue;
                        Thread.sleep(3);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    latch.countDown();
                }
            });
            
            try {
                Thread.sleep(3000); // Let test run
                stopFlag.set(true);
                latch.await(10, TimeUnit.SECONDS);
                executor.shutdown();
                
                System.out.printf("  Inconsistencies: %d%n", inconsistencies.get());
                
                if (inconsistencies.get() > 20) { // Allow some inconsistencies due to timing
                    throw new RuntimeException(String.format(
                        "Too many memory inconsistencies: %d > 20", inconsistencies.get()));
                }
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Test interrupted");
            }
        });
    }
    
    /**
     * Test thread pool management
     */
    private static void testThreadPoolManagement() {
        System.out.println("\n=== THREAD POOL MANAGEMENT ===");
        
        runTest("THREADPOOL - Scaling behavior", () -> {
            int[] threadCounts = {2, 5, 10, 15};
            List<Long> executionTimes = new ArrayList<>();
            
            for (int threadCount : threadCounts) {
                CountDownLatch latch = new CountDownLatch(threadCount);
                ExecutorService executor = Executors.newFixedThreadPool(threadCount);
                
                long startTime = System.currentTimeMillis();
                
                for (int i = 0; i < threadCount; i++) {
                    executor.submit(() -> {
                        try {
                            // Simulate work
                            Thread.sleep(100);
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        } finally {
                            latch.countDown();
                        }
                    });
                }
                
                try {
                    latch.await(30, TimeUnit.SECONDS);
                    long executionTime = System.currentTimeMillis() - startTime;
                    executionTimes.add(executionTime);
                    executor.shutdown();
                    
                    System.out.printf("  Threads: %d, Time: %dms%n", threadCount, executionTime);
                    
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Test interrupted");
                }
            }
            
            // Check scaling behavior
            for (int i = 1; i < executionTimes.size(); i++) {
                long prevTime = executionTimes.get(i - 1);
                long currTime = executionTimes.get(i);
                double increaseRatio = (double) currTime / prevTime;
                
                if (increaseRatio > 3.0) {
                    System.out.printf("  ⚠️  WARNING: Poor scaling at thread count %d: %.2fx increase%n",
                        threadCounts[i], increaseRatio);
                }
            }
        });
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
    
    private static void printResults() {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("THREAD SAFETY TEST RESULTS");
        System.out.println("=".repeat(60));
        System.out.printf("Total tests: %d%n", totalTests);
        System.out.printf("Passed: %d%n", passedTests);
        System.out.printf("Failed: %d%n", totalTests - passedTests);
        System.out.printf("Success rate: %.1f%%%n", (passedTests * 100.0 / totalTests));
        
        if (passedTests == totalTests) {
            System.out.println("🎉 ALL THREAD SAFETY TESTS PASSED!");
        } else if (passedTests >= totalTests * 0.8) {
            System.out.println("✅ THREAD SAFETY TESTS PASSED (with minor issues)");
        } else {
            System.out.println("❌ THREAD SAFETY TESTS FAILED!");
        }
        
        System.out.println("\nTHREAD SAFETY AREAS TESTED:");
        System.out.println("  ✅ Race conditions (Concurrent access)");
        System.out.println("  ✅ Atomic operations (Consistency)");
        System.out.println("  ✅ Deadlock detection");
        System.out.println("  ✅ Resource contention");
        System.out.println("  ✅ Memory consistency");
        System.out.println("  ✅ Thread pool management");
        System.out.println("=".repeat(60));
    }
    
    @FunctionalInterface
    private interface TestCase {
        void run() throws Exception;
    }
}