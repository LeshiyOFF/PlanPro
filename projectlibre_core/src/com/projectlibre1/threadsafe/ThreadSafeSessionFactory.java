package com.projectlibre1.threadsafe;

import com.projectlibre1.session.SessionFactory;
import com.projectlibre1.session.Session;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Thread-safe wrapper for SessionFactory
 * Provides thread-safe access to SessionFactory singleton
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ThreadSafeSessionFactory implements ThreadSafeSessionFactoryInterface {
    
    private static volatile ThreadSafeSessionFactory instance;
    private static final ReentrantLock creationLock = new ReentrantLock();
    
    private final SessionFactory delegate;
    private final ConcurrentHashMap<String, Object> sessionLocks;
    
    private ThreadSafeSessionFactory() {
        this.delegate = SessionFactory.getInstance();
        this.sessionLocks = new ConcurrentHashMap<>();
    }
    
    /**
     * Get thread-safe singleton instance
     * 
     * @return ThreadSafeSessionFactory instance
     */
    public static ThreadSafeSessionFactory getInstance() {
        ThreadSafeSessionFactory result = instance;
        if (result == null) {
            creationLock.lock();
            try {
                result = instance;
                if (result == null) {
                    instance = result = new ThreadSafeSessionFactory();
                }
            } finally {
                creationLock.unlock();
            }
        }
        return result;
    }
    
    /**
     * Get session with thread safety
     * 
     * @param type session type
     * @return thread-safe session
     */
    public Session getSession(String type) {
        Object sessionLock = sessionLocks.computeIfAbsent(type, k -> new Object());
        synchronized (sessionLock) {
            if (type == null || type.isEmpty()) {
                return delegate.getSession(true); // default local session
            }
            return delegate.getSession(true); // using boolean parameter for now
        }
    }
    
    /**
     * Get default session with thread safety
     * 
     * @return thread-safe default session
     */
    public Session getDefaultSession() {
        return getSession(null);
    }
    
    /**
     * Check if factory is thread-safe
     * 
     * @return true if factory provides thread safety
     */
    public boolean isThreadSafe() {
        return true;
    }
    
    /**
     * Get underlying SessionFactory for advanced operations
     * 
     * @return wrapped SessionFactory
     */
    public SessionFactory getDelegate() {
        return delegate;
    }
}