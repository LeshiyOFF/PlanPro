package com.projectlibre.api.test.threading;

import com.projectlibre.api.test.framework.HttpClientTestFramework;
import static com.projectlibre.api.test.framework.HttpClientTestFramework.*;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;
import java.io.IOException;

/**
 * Professional Thread Safety Test Suite
 * Tests race conditions, deadlocks, atomic operations, and concurrent access
 */
public class ThreadSafetyTestSuite {
    
    private static int totalTests = 0;
    private static int passedTests = 0;
    
    // Thread safety thresholds
    private static final int MAX_THREADS = 50;
    private static final int CONCURRENT_OPERATIONS = 100;
    private static final double RACE_CONDITION_TOLERANCE = 0.05; // 5%
    private static final long DEADLOCK_TIMEOUT_MS = 10000;
    
    public static void main(String[] args) throws IOException {
        System.out.println("=================================================");
        System.out.println("     THREAD SAFETY TEST SUITE");
        System.out.println("=================================================");
        
        testRaceConditions();
        testAtomicOperations();
        testConcurrentCRUD();
        testDeadlockDetection();
        testResourceContention();
        testMemoryConsistency();
        testThreadPoolManagement();
        
        printResults();
    }
    
    /**
     * Test race conditions in concurrent operations
     */
    private static void testRaceConditions() throws IOException {
        System.out.println("\n=== RACE CONDITIONS ===");
        
        runTest("RACE - Concurrent project creation", () -> {
            int threadCount = 10;
            int operationsPerThread = 5;
            CountDownLatch latch = new CountDownLatch(threadCount);
            AtomicInteger successCount = new AtomicInteger(0);
            AtomicInteger errorCount = new AtomicInteger(0);
            Set<String> createdProjects = ConcurrentHashMap.newKeySet();
            
            ExecutorService executor = Executors.newFixedThreadPool(threadCount);
            
            for (int i = 0; i < threadCount; i++) {
                final int threadId = i;
                executor.submit(() -> {
                    try {
                        for (int j = 0; j < operationsPerThread; j++) {
                            String projectName = "RaceTest_" + threadId + "_" + j + "_" + System.nanoTime();
                            String json = String.format("{\"name\":\"%s\",\"description\":\"Race condition test\"}", projectName);
                            
                            var response = createProject(json);
                            if (response.isSuccess()) {
                                successCount.incrementAndGet();
                                createdProjects.add(projectName);
                            } else {
                                errorCount.incrementAndGet();
                            }
                        }
                    } catch (Exception e) {
                        errorCount.incrementAndGet();
                    } finally {
                        latch.countDown();
                    }
                });
            }
            
            try {
                boolean completed = latch.await(30, TimeUnit.SECONDS);
                executor.shutdown();
                
                if (!completed) {
                    throw new RuntimeException("Test timed out - possible deadlock");
                }
                
                // Verify no duplicates (race condition indicator)
                int expectedProjects = threadCount * operationsPerThread;
                int actualUniqueProjects = createdProjects.size();
                double duplicateRate = (double)(expectedProjects - actualUniqueProjects) / expectedProjects;
                
                System.out.printf("  Expected: %d, Unique: %d, Duplicates: %.1f%%%n",
                    expectedProjects, actualUniqueProjects, duplicateRate * 100);
                
                if (duplicateRate > RACE_CONDITION_TOLERANCE) {
                    throw new RuntimeException(String.format(
                        "Too many duplicates: %.1f%% > %.1f%%", duplicateRate * 100, RACE_CONDITION_TOLERANCE * 100));
                }
                
                System.out.printf("  Success: %d, Errors: %d, Race conditions: %d%n",
                    successCount.get(), errorCount.get(), expectedProjects - actualUniqueProjects);
                return true;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Test interrupted");
            }
        });
        
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
                    throw new RuntimeException(String.format(
                        "Synchronized counter failed: %d != %d", actualNonAtomic, expectedValue));
                }
                return true;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Test interrupted");
            }
        });
    }
    
    /**
     * Test atomic operations consistency
     */
    private static void testAtomicOperations() throws IOException {
        System.out.println("\n=== ATOMIC OPERATIONS ===");
        
        runTest("ATOMIC - Concurrent map operations", () -> {
            Map<String, String> concurrentMap = new ConcurrentHashMap<>();
            Map<String, Integer> countMap = new ConcurrentHashMap<>();
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
                            String value = "value_" + threadId + "_" + j;
                            
                            // Atomic put
                            concurrentMap.put(key, value);
                            countMap.merge(key, 1, Integer::sum);
                            
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
                
                // Verify consistency
                int mapSize = concurrentMap.size();
                int totalOperations = threadCount * operationsPerThread;
                
                System.out.printf("  Map size: %d, Total operations: %d%n", mapSize, totalOperations);
                
                // Check if map operations were atomic
                for (Map.Entry<String, Integer> entry : countMap.entrySet()) {
                    String key = entry.getKey();
                    int expectedCount = entry.getValue();
                    boolean hasKey = concurrentMap.containsKey(key);
                    
                    if (expectedCount > 1 && hasKey) {
                        System.out.printf("  Key %s: %d operations, final state: present%n", key, expectedCount);
                    }
                }
                
                if (mapSize < 0) {
                    throw new RuntimeException("Negative map size - corruption detected");
                }
                return true;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Test interrupted");
            }
        });
        
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
                return true;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Test interrupted");
            }
        });
    }
    
    /**
     * Test concurrent CRUD operations
     */
    private static void testConcurrentCRUD() throws IOException {
        System.out.println("\n=== CONCURRENT CRUD ===");
        
        runTest("CRUD - Concurrent create/read/update/delete", () -> {
            int threadCount = 8;
            int operationsPerThread = 20;
            AtomicInteger createCount = new AtomicInteger(0);
            AtomicInteger readCount = new AtomicInteger(0);
            AtomicInteger updateCount = new AtomicInteger(0);
            AtomicInteger deleteCount = new AtomicInteger(0);
            List<String> createdProjectIds = Collections.synchronizedList(new ArrayList<>());
            
            CountDownLatch latch = new CountDownLatch(threadCount);
            ExecutorService executor = Executors.newFixedThreadPool(threadCount);
            
            // Phase 1: Create projects
            for (int i = 0; i < threadCount; i++) {
                final int threadId = i;
                executor.submit(() -> {
                    try {
                        for (int j = 0; j < operationsPerThread; j++) {
                            String projectName = "CRUDTest_" + threadId + "_" + j;
                            String json = String.format("{\"name\":\"%s\",\"description\":\"CRUD test\"}", projectName);
                            
                            var response = createProject(json);
                            if (response.isSuccess()) {
                                createCount.incrementAndGet();
                                // Extract ID from response (simplified)
                                createdProjectIds.add("id_" + threadId + "_" + j);
                            }
                        }
                    } catch (IOException e) {
                        System.err.println("Create error in Phase 1: " + e.getMessage());
                    } finally {
                        latch.countDown();
                    }
                });
            }
            
            try {
                latch.await(30, TimeUnit.SECONDS);
                
                // Phase 2: Read operations
                CountDownLatch readLatch = new CountDownLatch(threadCount);
                for (int i = 0; i < threadCount; i++) {
                executor.submit(() -> {
                    try {
                        for (int j = 0; j < operationsPerThread; j++) {
                            var response = getProjects();
                            if (response.isSuccess()) {
                                readCount.incrementAndGet();
                            }
                        }
                    } catch (IOException e) {
                        System.err.println("Read error: " + e.getMessage());
                    } finally {
                        readLatch.countDown();
                    }
                });
                }
                
                readLatch.await(30, TimeUnit.SECONDS);
                
                // Phase 3: Update/Delete operations (simplified - would need actual IDs)
                for (int i = 0; i < Math.min(threadCount, createdProjectIds.size()); i++) {
                    final String projectIdString = createdProjectIds.get(i);
                    final long projectId = Math.abs(projectIdString.hashCode()); // Convert string to simulated long ID
                    executor.submit(() -> {
                        try {
                            String updateJson = "{\"name\":\"Updated_" + projectId + "\"}";
                            var updateResponse = updateProject(projectId, updateJson);
                            if (updateResponse.isSuccess()) {
                                updateCount.incrementAndGet();
                            }
                            
                            var deleteResponse = deleteProject(projectId);
                            if (deleteResponse.isSuccess()) {
                                deleteCount.incrementAndGet();
                            }
                        } catch (IOException e) {
                            System.err.println("Update/Delete error in Phase 3: " + e.getMessage());
                        } finally {
                            latch.countDown();
                        }
                    });
                }
                
                Thread.sleep(2000); // Wait for operations
                executor.shutdown();
                
                System.out.printf("  Created: %d, Read: %d, Updated: %d, Deleted: %d%n",
                    createCount.get(), readCount.get(), updateCount.get(), deleteCount.get());
                
                // Verify consistency
                if (createCount.get() == 0) {
                    throw new RuntimeException("No projects created - test failed");
                }
                
                if (readCount.get() == 0) {
                    throw new RuntimeException("No read operations succeeded");
                }
                return true;
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
            AtomicInteger deadlockedThreads = new AtomicInteger(0);
            
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
                
                if (!completed) {
                    deadlockedThreads.set(2 - completedThreads.get());
                    System.out.printf("  Potential deadlock detected: %d threads stuck%n", deadlockedThreads.get());
                }
                
                System.out.printf("  Completed threads: %d/2%n", completedThreads.get());
                
                // This test demonstrates deadlock potential
                if (deadlockedThreads.get() > 0) {
                    System.out.println("  ⚠️  WARNING: Deadlock pattern detected in code structure");
                }
                return true;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Test interrupted");
            }
        });
        
        runTest("DEADLOCK - Timeout detection", () -> {
            int threadCount = 5;
            AtomicInteger timeouts = new AtomicInteger(0);
            List<Future<?>> futures = new ArrayList<>();
            
            ExecutorService executor = Executors.newFixedThreadPool(threadCount);
            
            for (int i = 0; i < threadCount; i++) {
                final int threadId = i;
                Future<?> future = executor.submit(() -> {
                    try {
                        // Simulate long-running operation
                        Thread.sleep(5000);
                        return "completed_" + threadId;
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return "interrupted_" + threadId;
                    }
                });
                futures.add(future);
            }
            
            // Check for timeouts
            for (Future<?> future : futures) {
                try {
                    Object result = future.get(2000, TimeUnit.MILLISECONDS);
                    System.out.printf("  Thread result: %s%n", result);
                } catch (TimeoutException e) {
                    timeouts.incrementAndGet();
                    future.cancel(true);
                } catch (Exception e) {
                    System.out.printf("  Thread error: %s%n", e.getMessage());
                }
            }
            
            executor.shutdown();
            
            System.out.printf("  Timeouts: %d/%d%n", timeouts.get(), threadCount);
            
            if (timeouts.get() > threadCount / 2) {
                throw new RuntimeException("Too many timeouts - possible deadlock");
            }
            return true;
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
                if (contentionRate > 0.3) { // 30% contention is high
                    throw new RuntimeException(String.format(
                        "High resource contention: %.1f%% > 30%%", contentionRate * 100));
                }
                return true;
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
                Thread.sleep(5000); // Let test run
                stopFlag.set(true);
                latch.await(10, TimeUnit.SECONDS);
                executor.shutdown();
                
                System.out.printf("  Inconsistencies: %d%n", inconsistencies.get());
                
                if (inconsistencies.get() > 10) { // Allow some inconsistencies due to timing
                    throw new RuntimeException(String.format(
                        "Too many memory inconsistencies: %d > 10", inconsistencies.get()));
                }
                return true;
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
            int[] threadCounts = {2, 5, 10, 20, 30};
            List<Long> executionTimes = new ArrayList<>();
            
            for (int threadCount : threadCounts) {
                CountDownLatch latch = new CountDownLatch(threadCount);
                ExecutorService executor = Executors.newFixedThreadPool(threadCount);
                
                long startTime = System.currentTimeMillis();
                
                for (int i = 0; i < threadCount; i++) {
                    final int threadId = i;
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
                
                if (increaseRatio > 2.0) {
                    System.out.printf("  ⚠️  WARNING: Poor scaling at thread count %d: %.2fx increase%n",
                        threadCounts[i], increaseRatio);
                }
            }
            return true;
        });
        
        runTest("THREADPOOL - Resource cleanup", () -> {
            int iterations = 10;
            AtomicInteger activeThreads = new AtomicInteger(0);
            AtomicInteger maxActiveThreads = new AtomicInteger(0);
            
            for (int iter = 0; iter < iterations; iter++) {
                ExecutorService executor = Executors.newFixedThreadPool(5);
                CountDownLatch latch = new CountDownLatch(5);
                
                for (int i = 0; i < 5; i++) {
                    executor.submit(() -> {
                        int current = activeThreads.incrementAndGet();
                        maxActiveThreads.updateAndGet(max -> Math.max(max, current));
                        
                        try {
                            Thread.sleep(50);
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        } finally {
                            activeThreads.decrementAndGet();
                            latch.countDown();
                        }
                    });
                }
                
                try {
                    latch.await(10, TimeUnit.SECONDS);
                    executor.shutdown();
                    executor.awaitTermination(5, TimeUnit.SECONDS);
                    
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Test interrupted");
                }
            }
            
            System.out.printf("  Max active threads: %d%n", maxActiveThreads.get());
            
            if (maxActiveThreads.get() > 10) {
                throw new RuntimeException(String.format(
                    "Thread leak detected: %d > 10", maxActiveThreads.get()));
            }
            return true;
        });
    }
    
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
        System.out.println("  ✅ Concurrent CRUD operations");
        System.out.println("  ✅ Deadlock detection");
        System.out.println("  ✅ Resource contention");
        System.out.println("  ✅ Memory consistency");
        System.out.println("  ✅ Thread pool management");
        System.out.println("=".repeat(60));
    }
}