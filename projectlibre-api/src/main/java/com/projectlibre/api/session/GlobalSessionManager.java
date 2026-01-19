package com.projectlibre.api.session;

import com.projectlibre1.session.Session;
import com.projectlibre1.session.SessionFactory;
import com.projectlibre1.session.LocalSession;
import com.projectlibre1.job.JobQueue;

import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.lang.reflect.Field;

/**
 * Manager for global ProjectLibre Core session.
 * Solves ThreadLocal dependency issue in Spring Boot multi-threading.
 * Single Responsibility: Management of unique shared Core session.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
@Component
public class GlobalSessionManager {
    
    private final AtomicReference<Session> globalSession = new AtomicReference<>();
    private final Object initLock = new Object();
    private volatile boolean initialized = false;
    
    @PostConstruct
    public void initialize() {
        synchronized (initLock) {
            if (initialized) {
                System.out.println("[GlobalSessionManager] Already initialized");
                return;
            }
            
            System.out.println("[GlobalSessionManager] Initializing global session...");
            
            try {
                SessionFactory sessionFactory = SessionFactory.getInstance();
                Session session = extractLocalSessionFromFactory(sessionFactory);
                
                if (session == null) {
                    session = createNewLocalSession(sessionFactory);
                } else {
                    // Ensure existing session has JobQueue
                    ensureJobQueue(session);
                }
                
                ensureSessionInitialized(session);
                globalSession.set(session);
                initialized = true;
                
                System.out.println("[GlobalSessionManager] ✅ Global session initialized");
                System.out.println("[GlobalSessionManager]    Session ID: " + session.getId());
                
            } catch (Exception e) {
                System.err.println("[GlobalSessionManager] ❌ CRITICAL: Failed to initialize");
                e.printStackTrace();
                throw new IllegalStateException("Failed to initialize GlobalSessionManager", e);
            }
        }
    }
    
    /**
     * Ensures the session has a valid JobQueue.
     * Creates headless JobQueue if missing.
     */
    private void ensureJobQueue(Session session) {
        if (session.getJobQueue() == null) {
            JobQueue jobQueue = createHeadlessJobQueue();
            session.setJobQueue(jobQueue);
            System.out.println("[GlobalSessionManager]   ✓ Injected headless JobQueue into existing session");
        }
    }
    
    @PreDestroy
    public void shutdown() {
        synchronized (initLock) {
            System.out.println("[GlobalSessionManager] Shutting down...");
            Session session = globalSession.get();
            if (session != null) {
                System.out.println("[GlobalSessionManager] Closing session ID: " + session.getId());
                globalSession.set(null);
            }
            initialized = false;
            System.out.println("[GlobalSessionManager] ✅ Shutdown complete");
        }
    }
    
    public Session getSession() {
        Session session = globalSession.get();
        if (session == null || !session.isInitialized()) {
            throw new IllegalStateException("Global session not initialized.");
        }
        return session;
    }
    
    public boolean isInitialized() {
        Session session = globalSession.get();
        return initialized && session != null && session.isInitialized();
    }
    
    private Session extractLocalSessionFromFactory(SessionFactory factory) throws Exception {
        Field field = SessionFactory.class.getDeclaredField("sessionImpls");
        field.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, Session> sessionImpls = (Map<String, Session>) field.get(factory);
        
        if (sessionImpls != null && sessionImpls.containsKey("local")) {
            Session session = sessionImpls.get("local");
            if (session != null) {
                System.out.println("[GlobalSessionManager] Found existing session");
                return session;
            }
        }
        return null;
    }
    
    private Session createNewLocalSession(SessionFactory factory) throws Exception {
        System.out.println("[GlobalSessionManager] Creating new LocalSession...");
        LocalSession localSession = new LocalSession();
        
        // Try to get existing JobQueue from factory
        JobQueue jobQueue = factory.getJobQueue();
        
        // In headless mode, factory.getJobQueue() returns null - create our own
        if (jobQueue == null) {
            jobQueue = createHeadlessJobQueue();
            System.out.println("[GlobalSessionManager]   ✓ Created headless JobQueue");
        } else {
            System.out.println("[GlobalSessionManager]   ✓ Using existing JobQueue");
        }
        
        localSession.setJobQueue(jobQueue);
        registerSessionInFactory(factory, localSession);
        return localSession;
    }
    
    /**
     * Creates a JobQueue compatible with headless (non-GUI) environment.
     * This JobQueue can schedule and execute jobs without Swing components.
     * 
     * @return JobQueue instance for headless operation
     */
    private JobQueue createHeadlessJobQueue() {
        return new JobQueue("HeadlessJobQueue", false);
    }
    
    private void registerSessionInFactory(SessionFactory factory, Session session) throws Exception {
        Field field = SessionFactory.class.getDeclaredField("sessionImpls");
        field.setAccessible(true);
        
        // Use smart map that always returns the session for any key
        Map<String, Session> smartMap = new java.util.HashMap<>() {
            @Override
            public Session get(Object key) {
                return session;
            }
            @Override
            public boolean containsKey(Object key) {
                return true;
            }
        };
        
        smartMap.put("local", session);
        field.set(factory, java.util.Collections.synchronizedMap(smartMap));
        System.out.println("[GlobalSessionManager]   ✓ Smart session map installed");
    }
    
    private void ensureSessionInitialized(Session session) {
        if (!session.isInitialized()) {
            try {
                session.init(null);
                System.out.println("[GlobalSessionManager]   ✓ Session initialized");
            } catch (Exception e) {
                System.err.println("[GlobalSessionManager]   ⚠ Init failed: " + e.getMessage());
            }
        }
    }
    
    public void reinitialize() {
        synchronized (initLock) {
            System.out.println("[GlobalSessionManager] Force reinitializing...");
            initialized = false;
            globalSession.set(null);
            initialize();
        }
    }
}
