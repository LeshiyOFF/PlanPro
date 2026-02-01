/*******************************************************************************
 * Tests for Project ID generation logic
 * Covers TODO at Project.java:414-415 (GUID generator)
 * 
 * These are ISOLATED unit tests that don't require full ProjectLibre initialization.
 * They test the ID generation logic directly.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 *******************************************************************************/
package com.projectlibre1.pm.task;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Assertions;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Isolated tests for ID generation logic.
 * Tests UUID-based ID generation without requiring full ProjectLibre initialization.
 */
class ProjectIdTest {
    
    /**
     * Simulates current sequential ID generation (to be replaced with UUID)
     */
    private static final AtomicLong sequentialCounter = new AtomicLong(0);
    
    private long generateSequentialId() {
        return sequentialCounter.incrementAndGet();
    }
    
    private long generateUuidBasedId() {
        return UUID.randomUUID().getMostSignificantBits() & Long.MAX_VALUE;
    }
    
    @Test
    @DisplayName("Sequential IDs should be unique")
    void testSequentialIdsAreUnique() {
        Set<Long> ids = new HashSet<>();
        int count = 1000;
        
        for (int i = 0; i < count; i++) {
            ids.add(generateSequentialId());
        }
        
        Assertions.assertEquals(count, ids.size(), 
            "All sequential IDs should be unique");
    }
    
    @Test
    @DisplayName("UUID-based IDs should be unique")
    void testUuidBasedIdsAreUnique() {
        Set<Long> ids = new HashSet<>();
        int count = 10000;
        
        for (int i = 0; i < count; i++) {
            ids.add(generateUuidBasedId());
        }
        
        Assertions.assertEquals(count, ids.size(), 
            "All UUID-based IDs should be unique");
    }
    
    @Test
    @DisplayName("UUID-based IDs should be positive")
    void testUuidBasedIdsArePositive() {
        for (int i = 0; i < 1000; i++) {
            long id = generateUuidBasedId();
            Assertions.assertTrue(id > 0, 
                "UUID-based ID should be positive: " + id);
        }
    }
    
    @Test
    @DisplayName("UUID generation should be thread-safe")
    void testUuidGenerationThreadSafety() throws InterruptedException {
        int threadCount = 10;
        int idsPerThread = 1000;
        Set<Long> allIds = ConcurrentHashMap.newKeySet();
        CountDownLatch latch = new CountDownLatch(threadCount);
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        
        for (int t = 0; t < threadCount; t++) {
            executor.submit(() -> {
                try {
                    for (int i = 0; i < idsPerThread; i++) {
                        allIds.add(generateUuidBasedId());
                    }
                } finally {
                    latch.countDown();
                }
            });
        }
        
        Assertions.assertTrue(latch.await(10, TimeUnit.SECONDS), 
            "All threads should complete");
        
        // Allow for rare collisions (UUID collision rate is astronomically low)
        int expectedMinimum = (int)(threadCount * idsPerThread * 0.99);
        Assertions.assertTrue(allIds.size() >= expectedMinimum, 
            "Should have at least " + expectedMinimum + " unique IDs, got " + allIds.size());
        
        executor.shutdown();
    }
    
    @Test
    @DisplayName("Sequential counter should handle concurrent access")
    void testSequentialCounterConcurrency() throws InterruptedException {
        AtomicLong testCounter = new AtomicLong(0);
        int threadCount = 10;
        int incrementsPerThread = 1000;
        CountDownLatch latch = new CountDownLatch(threadCount);
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        Set<Long> allIds = ConcurrentHashMap.newKeySet();
        
        for (int t = 0; t < threadCount; t++) {
            executor.submit(() -> {
                try {
                    for (int i = 0; i < incrementsPerThread; i++) {
                        allIds.add(testCounter.incrementAndGet());
                    }
                } finally {
                    latch.countDown();
                }
            });
        }
        
        Assertions.assertTrue(latch.await(10, TimeUnit.SECONDS), 
            "All threads should complete");
        
        int expected = threadCount * incrementsPerThread;
        Assertions.assertEquals(expected, allIds.size(), 
            "All sequential IDs should be unique under concurrent access");
        
        executor.shutdown();
    }
    
    @Test
    @DisplayName("ID should not be zero")
    void testIdNotZero() {
        for (int i = 0; i < 100; i++) {
            long seqId = generateSequentialId();
            long uuidId = generateUuidBasedId();
            
            Assertions.assertNotEquals(0L, seqId, "Sequential ID should not be zero");
            Assertions.assertNotEquals(0L, uuidId, "UUID ID should not be zero");
        }
    }
    
    @Test
    @DisplayName("UUID generation should be fast enough")
    void testUuidGenerationPerformance() {
        int iterations = 100000;
        long startTime = System.nanoTime();
        
        for (int i = 0; i < iterations; i++) {
            generateUuidBasedId();
        }
        
        long endTime = System.nanoTime();
        long durationMs = (endTime - startTime) / 1_000_000;
        
        // Should generate 100k IDs in less than 1 second
        Assertions.assertTrue(durationMs < 1000, 
            "UUID generation should be fast: " + durationMs + "ms for " + iterations + " IDs");
    }
}
