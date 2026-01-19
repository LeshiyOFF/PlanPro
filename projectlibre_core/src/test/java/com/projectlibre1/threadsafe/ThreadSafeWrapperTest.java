package com.projectlibre1.threadsafe;

import com.projectlibre1.session.SessionFactory;
import com.projectlibre1.session.LocalSession;
import com.projectlibre1.pm.key.uniqueid.UniqueIdPool;
import com.projectlibre1.server.data.CommonDataObject;
import com.projectlibre1.job.Job;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Assertions;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.List;
import java.util.Arrays;
import java.util.ArrayList;

/**
 * Tests for thread-safe wrapper components
 * Tests thread safety and concurrent access
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
class ThreadSafeWrapperTest {
    
    private ThreadSafeSessionFactory safeFactory;
    private ThreadSafeUniqueIdPool safeIdPool;
    private ThreadSafeDataObject<String> safeDataObject;
    private ThreadSafeLocalSession safeSession;
    private ExecutorService executor;
    
    @BeforeEach
    void setUp() {
        safeFactory = ThreadSafeSessionFactory.getInstance();
        safeIdPool = ThreadSafeUniqueIdPool.getInstance();
        safeDataObject = new ThreadSafeDataObject<>(new CommonDataObject());
        safeSession = new ThreadSafeLocalSession(SessionFactory.getInstance().getLocalSession());
        executor = Executors.newFixedThreadPool(10);
    }
    
    @Test
    @DisplayName("Test thread-safe factory singleton")
    void testThreadSafeFactorySingleton() {
        ThreadSafeSessionFactory factory1 = ThreadSafeSessionFactory.getInstance();
        ThreadSafeSessionFactory factory2 = ThreadSafeSessionFactory.getInstance();
        
        Assertions.assertSame(factory1, factory2, "Should return same instance");
        Assertions.assertTrue(factory1.isThreadSafe(), "Factory should be thread-safe");
    }
    
    @Test
    @DisplayName("Test thread-safe unique ID pool singleton")
    void testThreadSafeUniqueIdPoolSingleton() {
        ThreadSafeUniqueIdPool pool1 = ThreadSafeUniqueIdPool.getInstance();
        ThreadSafeUniqueIdPool pool2 = ThreadSafeUniqueIdPool.getInstance();
        
        Assertions.assertSame(pool1, pool2, "Should return same instance");
        Assertions.assertTrue(pool1.isThreadSafe(), "Pool should be thread-safe");
    }
    
    @Test
    @DisplayName("Test thread-safe data object")
    void testThreadSafeDataObject() {
        safeDataObject.setData("testKey", "testValue");
        safeDataObject.setCachedData("cachedValue");
        
        Assertions.assertEquals("testValue", safeDataObject.getData("testKey"));
        Assertions.assertEquals("cachedValue", safeDataObject.getCachedData());
        Assertions.assertTrue(safeDataObject.isThreadSafe(), "Data object should be thread-safe");
        Assertions.assertTrue(safeDataObject.getLastModified() > 0, "Last modified should be set");
    }
    
    @Test
    @DisplayName("Test thread-safe local session")
    void testThreadSafeLocalSession() {
        Assertions.assertTrue(safeSession.isThreadSafe(), "Session should be thread-safe");
        Assertions.assertTrue(safeSession.getId() >= 0, "Should return valid session ID");
        Assertions.assertTrue(safeSession.getLastAccessTime() > 0, "Last access should be set");
        Assertions.assertNull(safeSession.getCurrentOperation(), "Current operation should be null initially");
    }
    
    @Test
    @DisplayName("Test concurrent unique ID generation")
    void testConcurrentUniqueIdGeneration() throws InterruptedException {
        int threadCount = 10;
        int operationsPerThread = 5;
        CountDownLatch latch = new CountDownLatch(threadCount);
        List<Long> generatedIds = new ArrayList<>();
        
        for (int i = 0; i < threadCount; i++) {
            final int threadIndex = i;
            executor.submit(() -> {
                for (int j = 0; j < operationsPerThread; j++) {
                    long id = safeIdPool.getNextUniqueId();
                    synchronized (generatedIds) {
                        generatedIds.add(id);
                    }
                }
                latch.countDown();
            });
        }
        
        Assertions.assertTrue(latch.await(5, TimeUnit.SECONDS), "All threads should complete");
        
        // Verify all IDs are unique
        Assertions.assertEquals(threadCount * operationsPerThread, generatedIds.size());
        Assertions.assertEquals(generatedIds.size(), generatedIds.stream().distinct().count());
    }
    
    @Test
    @DisplayName("Test concurrent data access")
    void testConcurrentDataAccess() throws InterruptedException {
        int threadCount = 5;
        CountDownLatch latch = new CountDownLatch(threadCount);
        
        for (int i = 0; i < threadCount; i++) {
            final int threadIndex = i;
            executor.submit(() -> {
                safeDataObject.setData("key" + threadIndex, "value" + threadIndex);
                safeDataObject.setCachedData("cached" + threadIndex);
                latch.countDown();
            });
        }
        
        Assertions.assertTrue(latch.await(5, TimeUnit.SECONDS), "All threads should complete");
        
        // Verify data was set
        for (int i = 0; i < threadCount; i++) {
            Object value = safeDataObject.getData("key" + i);
            Assertions.assertNotNull(value, "Data should be set for thread " + i);
        }
    }
    
    @Test
    @DisplayName("Test concurrent session operations")
    void testConcurrentSessionOperations() throws InterruptedException {
        int threadCount = 3;
        CountDownLatch latch = new CountDownLatch(threadCount);
        
        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                Job job = safeSession.getLoadProjectJob(null);
                Assertions.assertNotNull(job, "Job should be created");
                latch.countDown();
            });
        }
        
        Assertions.assertTrue(latch.await(5, TimeUnit.SECONDS), "All threads should complete");
        
        // Verify session is still accessible
        long sessionId = safeSession.getId();
        Assertions.assertTrue(sessionId >= 0, "Session should still be accessible");
    }
    
    @Test
    @DisplayName("Test thread-safe factory session creation")
    void testThreadSafeFactorySessionCreation() {
        Session session1 = safeFactory.getDefaultSession();
        Session session2 = safeFactory.getDefaultSession();
        
        Assertions.assertNotNull(session1, "Should create session");
        Assertions.assertNotNull(session2, "Should create session");
    }
}