package com.projectlibre1.concurrent;

import com.projectlibre1.job.JobQueue;
import com.projectlibre1.session.Session;

import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.function.Supplier;

/**
 * Thread-Safe Adapter - provides synchronization adapters for existing components
 * Allows easy migration to thread-safe versions
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ThreadSafeAdapter {
    
    private static volatile ThreadSafeAdapter instance;
    private static final Object lock = new Object();
    
    private final ThreadSafeFactory factory;
    private final Map<String, Object> adapters;
    
    private ThreadSafeAdapter() {
        this.factory = ThreadSafeFactory.getInstance();
        this.adapters = new ConcurrentHashMap<>();
    }
    
    public static ThreadSafeAdapter getInstance() {
        ThreadSafeAdapter result = instance;
        if (result == null) {
            synchronized (lock) {
                result = instance;
                if (result == null) {
                    instance = result = new ThreadSafeAdapter();
                }
            }
        }
        return result;
    }
    
    public ThreadSafeJobQueue wrapJobQueue(JobQueue jobQueue) {
        if (jobQueue == null) {
            return null;
        }
        
        String key = "jobqueue_" + System.identityHashCode(jobQueue);
        return (ThreadSafeJobQueue) adapters.computeIfAbsent(key, 
            k -> factory.createJobQueue());
    }
    
    public ThreadSafeSession wrapSession(Session session) {
        if (session == null) {
            return null;
        }
        
        String key = "session_" + session.getId();
        return (ThreadSafeSession) adapters.computeIfAbsent(key, 
            k -> factory.createSession(session));
    }
    
    public <T> T executeSynchronized(Supplier<T> operation) {
        return factory.getSyncManager().executeWithLock("global", operation);
    }
    
    public <T> T executeWithLock(String lockName, Supplier<T> operation) {
        return factory.getSyncManager().executeWithLock(lockName, operation);
    }
    
    public <T> T executeWithReadLock(String lockName, Supplier<T> operation) {
        return factory.getSyncManager().executeWithReadLock(lockName, operation);
    }
    
    public <T> T executeWithWriteLock(String lockName, Supplier<T> operation) {
        return factory.getSyncManager().executeWithWriteLock(lockName, operation);
    }
    
    public java.util.concurrent.locks.ReentrantLock createLock(String lockName) {
        return factory.getSyncManager().getLock(lockName);
    }
    
    public java.util.concurrent.locks.ReentrantReadWriteLock createReadWriteLock(String lockName) {
        return factory.getSyncManager().getReadWriteLock(lockName);
    }
    
    public ThreadSafeFactory getFactory() {
        return factory;
    }
    
    public ThreadSafeManagerInterface getSyncManager() {
        return factory.getSyncManager();
    }
    
    public void clearCache() {
        adapters.clear();
    }
    
    public int getCachedAdaptersCount() {
        return adapters.size();
    }
    
    public Object removeAdapter(String key) {
        if (key == null) {
            return null;
        }
        return adapters.remove(key);
    }
    
    public int cleanupAdapters() {
        int[] cleaned = {0};
        final long threshold = 3600000; // 1 hour
        
        adapters.entrySet().removeIf(entry -> {
            Object adapter = entry.getValue();
            if (adapter instanceof ThreadSafeSession) {
                ThreadSafeSession session = (ThreadSafeSession) adapter;
                long lastAccess = session.getLastAccessTime();
                if (System.currentTimeMillis() - lastAccess > threshold) {
                    cleaned[0]++;
                    return true;
                }
            }
            return false;
        });
        
        return cleaned[0];
    }
}