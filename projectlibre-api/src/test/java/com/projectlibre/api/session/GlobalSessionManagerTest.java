package com.projectlibre.api.session;

import com.projectlibre1.session.Session;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Тесты для GlobalSessionManager.
 * Проверяют единство сессии в многопоточной среде.
 */
@SpringBootTest
public class GlobalSessionManagerTest {

    @Autowired
    private GlobalSessionManager sessionManager;

    @BeforeEach
    public void setUp() {
        if (!sessionManager.isInitialized()) {
            sessionManager.initialize();
        }
    }

    /**
     * Проверяет, что все потоки получают один и тот же экземпляр сессии.
     */
    @Test
    public void testGetSessionReturnsSameInstanceInMultipleThreads() throws InterruptedException {
        int threadCount = 100;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        Set<Session> sessions = Collections.newSetFromMap(new ConcurrentHashMap<>());

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    sessions.add(sessionManager.getSession());
                } finally {
                    latch.countDown();
                }
            });
        }

        assertTrue(latch.await(10, TimeUnit.SECONDS), "Threads did not complete in time");
        assertEquals(1, sessions.size(), "Should have exactly one unique session instance across all threads");
        assertNotNull(sessions.iterator().next(), "Session should not be null");
        assertTrue(sessionManager.isInitialized(), "Manager should be in initialized state");
    }

    /**
     * Проверяет, что сессия остается инициализированной.
     */
    @Test
    public void testSessionRemainsInitializedBetweenRequests() {
        Session session1 = sessionManager.getSession();
        assertNotNull(session1);
        assertTrue(session1.isInitialized());

        Session session2 = sessionManager.getSession();
        assertSame(session1, session2, "Consecutive calls should return same session instance");
        assertTrue(session2.isInitialized(), "Session should remain initialized");
    }
}
