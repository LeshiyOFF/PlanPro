package com.projectlibre1.threadsafe;

import com.projectlibre1.session.LocalSession;
import com.projectlibre1.job.Job;
import com.projectlibre1.job.JobQueue;
import com.projectlibre1.session.LoadOptions;
import com.projectlibre1.session.SaveOptions;
import com.projectlibre1.pm.task.Project;

import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.atomic.AtomicReference;
import java.util.Collection;
import java.util.List;

/**
 * Thread-safe wrapper for LocalSession
 * Provides thread-safe access to session operations
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ThreadSafeLocalSession implements ThreadSafeLocalSessionInterface {
    
    private final LocalSession delegate;
    private final ReentrantLock sessionLock;
    private final AtomicReference<Thread> currentOperation;
    private volatile long lastAccessTime;
    
    public ThreadSafeLocalSession(LocalSession delegate) {
        this.delegate = delegate;
        this.sessionLock = new ReentrantLock();
        this.currentOperation = new AtomicReference<>();
        this.lastAccessTime = System.currentTimeMillis();
    }
    
    public long getId() {
        sessionLock.lock();
        try {
            lastAccessTime = System.currentTimeMillis();
            return delegate.getId();
        } finally {
            sessionLock.unlock();
        }
    }
    
    public boolean isInitialized() {
        sessionLock.lock();
        try {
            lastAccessTime = System.currentTimeMillis();
            return delegate.isInitialized();
        } finally {
            sessionLock.unlock();
        }
    }
    
    public void init(Object configuration) {
        sessionLock.lock();
        try {
            currentOperation.set(Thread.currentThread());
            lastAccessTime = System.currentTimeMillis();
            delegate.init(configuration);
        } finally {
            currentOperation.set(null);
            sessionLock.unlock();
        }
    }
    
    public Job getCloseProjectsJob(Collection projects) {
        sessionLock.lock();
        try {
            currentOperation.set(Thread.currentThread());
            lastAccessTime = System.currentTimeMillis();
            return delegate.getCloseProjectsJob(projects);
        } finally {
            currentOperation.set(null);
            sessionLock.unlock();
        }
    }
    
    public Job getLoadProjectJob(Object options) {
        sessionLock.lock();
        try {
            currentOperation.set(Thread.currentThread());
            lastAccessTime = System.currentTimeMillis();
            if (options instanceof LoadOptions) {
                return delegate.getLoadProjectJob((LoadOptions) options);
            }
            return delegate.getLoadProjectJob((LoadOptions) null);
        } finally {
            currentOperation.set(null);
            sessionLock.unlock();
        }
    }
    
    public Job getSaveProjectJob(Object project, Object options) {
        sessionLock.lock();
        try {
            currentOperation.set(Thread.currentThread());
            lastAccessTime = System.currentTimeMillis();
            if (project instanceof Project && options instanceof SaveOptions) {
                return delegate.getSaveProjectJob((Project) project, (SaveOptions) options);
            } else if (project instanceof List && options instanceof SaveOptions) {
                return delegate.getSaveProjectJob((List<Project>) project, (SaveOptions) options);
            }
            return delegate.getSaveProjectJob((Project) null, (SaveOptions) options);
        } finally {
            currentOperation.set(null);
            sessionLock.unlock();
        }
    }
    
    public boolean projectExists(long projectId) {
        sessionLock.lock();
        try {
            lastAccessTime = System.currentTimeMillis();
            return delegate.projectExists(projectId);
        } finally {
            sessionLock.unlock();
        }
    }
    
    public JobQueue getJobQueue() {
        sessionLock.lock();
        try {
            lastAccessTime = System.currentTimeMillis();
            return delegate.getJobQueue();
        } finally {
            sessionLock.unlock();
        }
    }
    
    public void setJobQueue(JobQueue jobQueue) {
        sessionLock.lock();
        try {
            currentOperation.set(Thread.currentThread());
            lastAccessTime = System.currentTimeMillis();
            delegate.setJobQueue(jobQueue);
        } finally {
            currentOperation.set(null);
            sessionLock.unlock();
        }
    }
    
    public void schedule(Job job) {
        sessionLock.lock();
        try {
            currentOperation.set(Thread.currentThread());
            lastAccessTime = System.currentTimeMillis();
            delegate.schedule(job);
        } finally {
            currentOperation.set(null);
            sessionLock.unlock();
        }
    }
    
    public String chooseFileName(boolean isSave, String selectedFileName) {
        sessionLock.lock();
        try {
            lastAccessTime = System.currentTimeMillis();
            return delegate.chooseFileName(isSave, selectedFileName);
        } finally {
            sessionLock.unlock();
        }
    }
    
    public Thread getCurrentOperation() {
        return currentOperation.get();
    }
    
    public long getLastAccessTime() {
        return lastAccessTime;
    }
    
    public boolean isThreadSafe() {
        return true;
    }
    
    public LocalSession getDelegate() {
        return delegate;
    }
}