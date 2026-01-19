package com.projectlibre1.concurrent;

import com.projectlibre1.session.Session;
import com.projectlibre1.job.Job;
import com.projectlibre1.job.JobQueue;
import com.projectlibre1.session.SaveOptions;
import com.projectlibre1.session.LoadOptions;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.company.ApplicationUser;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.Map;
import java.util.function.Supplier;
import java.lang.Exception;

/**
 * Thread-Safe Session - synchronized version of session operations
 * Provides thread-safe session management
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ThreadSafeSession {
    
    private final ThreadSafeManagerInterface syncManager;
    private final Session delegate;
    private final Map<String, Object> sessionData;
    private final AtomicLong operationCounter;
    private final AtomicLong lastAccessTime;
    
    public ThreadSafeSession(Session delegate, ThreadSafeManagerInterface syncManager) {
        this.delegate = delegate != null ? delegate : createMinimalSession();
        this.syncManager = syncManager != null ? syncManager : ThreadSafeManager.getInstance();
        this.sessionData = new ConcurrentHashMap<>();
        this.operationCounter = new AtomicLong(0);
        this.lastAccessTime = new AtomicLong(System.currentTimeMillis());
    }
    
    private Session createMinimalSession() {
        return new MinimalSession();
    }
    
    public long getId() {
        return syncManager.executeWithLock("sessionId", () -> {
            lastAccessTime.set(System.currentTimeMillis());
            return delegate.getId();
        });
    }
    
    public boolean isInitialized() {
        return syncManager.executeWithReadLock("sessionState", () -> {
            return delegate.isInitialized();
        });
    }
    
    public void init(Object configuration) {
        syncManager.executeSynchronized("sessionState", () -> {
            delegate.init(configuration);
            operationCounter.incrementAndGet();
            lastAccessTime.set(System.currentTimeMillis());
        });
    }
    
    public JobQueue getJobQueue() {
        return syncManager.executeWithReadLock("sessionQueue", () -> {
            lastAccessTime.set(System.currentTimeMillis());
            return delegate.getJobQueue();
        });
    }
    
    public void setJobQueue(JobQueue jobQueue) {
        syncManager.executeSynchronized("sessionQueue", () -> {
            delegate.setJobQueue(jobQueue);
            operationCounter.incrementAndGet();
            lastAccessTime.set(System.currentTimeMillis());
        });
    }
    
    public void schedule(Job job) {
        syncManager.executeSynchronized("sessionSchedule", () -> {
            delegate.schedule(job);
            operationCounter.incrementAndGet();
            lastAccessTime.set(System.currentTimeMillis());
        });
    }
    
    public Job getLoadProjectJob(Object options) {
        return syncManager.executeWithLock("sessionLoad", () -> {
            lastAccessTime.set(System.currentTimeMillis());
            return delegate.getLoadProjectJob((LoadOptions) options);
        });
    }
    
    public Object getSessionData(String key) {
        return syncManager.executeWithReadLock("sessionData", () -> {
            lastAccessTime.set(System.currentTimeMillis());
            return sessionData.get(key);
        });
    }
    
    public void setSessionData(String key, Object value) {
        syncManager.executeSynchronized("sessionData", () -> {
            sessionData.put(key, value);
            operationCounter.incrementAndGet();
            lastAccessTime.set(System.currentTimeMillis());
        });
    }
    
    public Object removeSessionData(String key) {
        return syncManager.executeWithLock("sessionData", () -> {
            operationCounter.incrementAndGet();
            lastAccessTime.set(System.currentTimeMillis());
            return sessionData.remove(key);
        });
    }
    
    public long getOperationCount() {
        return operationCounter.get();
    }
    
    public long getLastAccessTime() {
        return lastAccessTime.get();
    }
    
    public Session getDelegate() {
        return delegate;
    }
    
    public ThreadSafeManagerInterface getSyncManager() {
        return syncManager;
    }
    
    private static class MinimalSession implements Session {
        
        public long getId() {
            return 0;
        }
        
        public boolean isInitialized() {
            return false;
        }
        
        public void init(Object configuration) {
            // No operation
        }
        
        public JobQueue getJobQueue() {
            return null;
        }
        
        public void setJobQueue(JobQueue jobQueue) {
            // No operation
        }
        
        public void schedule(Job job) {
            // No operation
        }
        
        public Job getLoadProjectJob(LoadOptions options) {
            return null;
        }
        
        public Job getSaveProjectJob(Project project, SaveOptions options) {
            return null;
        }
        
        public Job getSaveProjectJob(java.util.List<Project> projects, SaveOptions options) {
            return null;
        }
        
        public Job getEmptyJob(String name, Object result) {
            return null;
        }
        
        public Job getCloseProjectsJob(java.util.Collection projects) {
            return null;
        }
        
        public boolean projectExists(long projectId) {
            return false;
        }
        
        public void logString(String message) {
            // No operation
        }
        
        public void logException(Exception exception) {
            // No operation
        }
        
        public ApplicationUser getUser() {
            return null;
        }
        
        public void setUser(ApplicationUser user) {
            // No operation
        }
    }
}