package com.projectlibre1.concurrent;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Assertions;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

/**
 * Tests for thread-safe manager
 * Tests synchronization and concurrent access
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
class ThreadSafeManagerTest {
    
    private ThreadSafeManagerInterface syncManager;
    
    @BeforeEach
    void setUp() {
        syncManager = ThreadSafeManager.getInstance();
    }
    
    @Test
    @DisplayName("Test manager singleton")
    void testManagerSingleton() {
        ThreadSafeManagerInterface manager1 = ThreadSafeManager.getInstance();
        ThreadSafeManagerInterface manager2 = ThreadSafeManager.getInstance();
        
        Assertions.assertSame(manager1, manager2, "Should return same instance");
    }
    
    @Test
    @DisplayName("Test execute with lock")
    void testExecuteWithLock() throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(2);
        AtomicInteger counter = new AtomicInteger(0);
        List<String> results = Collections.synchronizedList(new ArrayList<>());
        
        // Execute multiple threads with same lock
        ExecutorService executor = Executors.newFixedThreadPool(2);
        
        executor.submit(() -> {
            String result = syncManager.executeWithLock("testLock", () -> {
                counter.incrementAndGet();
                return "Thread1-" + counter.get();
            });
            synchronized (results) {
                results.add(result);
            }
            latch.countDown();
        });
        
        executor.submit(() -> {
            String result = syncManager.executeWithLock("testLock", () -> {
                counter.incrementAndGet();
                return "Thread2-" + counter.get();
            });
            synchronized (results) {
                results.add(result);
            }
            latch.countDown();
        });
        
        Assertions.assertTrue(latch.await(5, TimeUnit.SECONDS), "Both threads should complete");
        Assertions.assertEquals(2, results.size(), "Should have 2 results");
        Assertions.assertNotEquals(results.get(0), results.get(1), "Results should be different");
        
        executor.shutdown();
    }
    
    @Test
    @DisplayName("Test execute with read lock")
    void testExecuteWithReadLock() throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(3);
        AtomicInteger counter = new AtomicInteger(0);
        
        ExecutorService executor = Executors.newFixedThreadPool(3);
        
        // One write thread
        executor.submit(() -> {
            int result = syncManager.executeWithWriteLock("rwLock", () -> {
                counter.incrementAndGet();
                return counter.get();
            });
            latch.countDown();
        });
        
        // Two read threads
        executor.submit(() -> {
            int result = syncManager.executeWithReadLock("rwLock", () -> {
                Thread.sleep(100); // Simulate read operation
                return counter.get();
            });
            latch.countDown();
        });
        
        executor.submit(() -> {
            int result = syncManager.executeWithReadLock("rwLock", () -> {
                Thread.sleep(100); // Simulate read operation
                return counter.get();
            });
            latch.countDown();
        });
        
        Assertions.assertTrue(latch.await(5, TimeUnit.SECONDS), "All threads should complete");
        
        executor.shutdown();
    }
    
    @Test
    @DisplayName("Test execute synchronized")
    void testExecuteSynchronized() throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(2);
        AtomicInteger executionCount = new AtomicInteger(0);
        
        ExecutorService executor = Executors.newFixedThreadPool(2);
        
        executor.submit(() -> {
            syncManager.executeSynchronized("syncTest", () -> {
                executionCount.incrementAndGet();
            });
            latch.countDown();
        });
        
        executor.submit(() -> {
            syncManager.executeSynchronized("syncTest", () -> {
                executionCount.incrementAndGet();
            });
            latch.countDown();
        });
        
        Assertions.assertTrue(latch.await(5, TimeUnit.SECONDS), "Both threads should complete");
        Assertions.assertEquals(2, executionCount.get(), "Both executions should complete");
        
        executor.shutdown();
    }
    
    @Test
    @DisplayName("Test operation counter")
    void testOperationCounter() {
        long initialCount = syncManager.getOperationCount();
        
        syncManager.executeWithLock("counterTest", () -> "test");
        syncManager.executeWithReadLock("counterTest", () -> "test");
        syncManager.executeSynchronized("counterTest", () -> {});
        
        long finalCount = syncManager.getOperationCount();
        Assertions.assertTrue(finalCount > initialCount, "Counter should increment");
        Assertions.assertEquals(initialCount + 3, finalCount, "Should increment by 3");
    }
    
    @Test
    @DisplayName("Test lock management")
    void testLockManagement() {
        // Get locks
        var lock1 = syncManager.getLock("lock1");
        var lock2 = syncManager.getLock("lock2");
        var rwLock = syncManager.getReadWriteLock("rwLock");
        
        Assertions.assertNotNull(lock1, "Should create lock1");
        Assertions.assertNotNull(lock2, "Should create lock2");
        Assertions.assertNotNull(rwLock, "Should create rwLock");
        
        // Check active locks
        int activeLocks = syncManager.getActiveLocksCount();
        Assertions.assertTrue(activeLocks >= 3, "Should have at least 3 active locks");
        
        // Test lock removal
        boolean removed1 = syncManager.removeLock("nonexistent");
        Assertions.assertFalse(removed1, "Should not remove nonexistent lock");
    }
    
    @Test
    @DisplayName("Test lock cleanup")
    void testLockCleanup() {
        // Create some locks
        syncManager.getLock("cleanup1");
        syncManager.getLock("cleanup2");
        syncManager.getReadWriteLock("cleanup3");
        
        int initialActive = syncManager.getActiveLocksCount();
        Assertions.assertTrue(initialActive >= 3, "Should have active locks");
        
        // Cleanup
        int cleaned = syncManager.cleanupUnusedLocks();
        Assertions.assertTrue(cleaned >= 0, "Should clean some locks");
        
        int finalActive = syncManager.getActiveLocksCount();
        Assertions.assertTrue(finalActive <= initialActive, "Should reduce active locks");
    }
    
    @Test
    @DisplayName("Test null safety")
    void testNullSafety() {
        // Test null parameters
        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            syncManager.executeWithLock(null, () -> "test");
        });
        
        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            syncManager.executeWithReadLock(null, () -> "test");
        });
        
        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            syncManager.executeWithWriteLock(null, () -> "test");
        });
        
        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            syncManager.executeSynchronized(null, () -> {});
        });
        
        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            syncManager.getLock(null);
        });
        
        Assertions.assertThrows(IllegalArgumentException.class, () -> {
            syncManager.getReadWriteLock(null);
        });
    }
    
    @Test
    @DisplayName("Test concurrent lock access")
    void testConcurrentLockAccess() throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(5);
        AtomicInteger completed = new AtomicInteger(0);
        
        ExecutorService executor = Executors.newFixedThreadPool(5);
        
        for (int i = 0; i < 5; i++) {
            final int threadId = i;
            executor.submit(() -> {
                String result = syncManager.executeWithLock("concurrentTest", () -> {
                    completed.incrementAndGet();
                    Thread.sleep(50); // Simulate work
                    return "Thread-" + threadId;
                });
                
                synchronized (System.out) {
                    System.out.println("Thread " + threadId + " result: " + result);
                }
                latch.countDown();
            });
        }
        
        Assertions.assertTrue(latch.await(10, TimeUnit.SECONDS), "All threads should complete");
        Assertions.assertEquals(5, completed.get(), "All threads should complete");
        
        executor.shutdown();
    }
}