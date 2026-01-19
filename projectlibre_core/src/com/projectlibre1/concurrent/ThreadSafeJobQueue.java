package com.projectlibre1.concurrent;

import com.projectlibre1.job.Job;
import com.projectlibre1.job.JobQueueListener;
import com.projectlibre1.job.JobQueueEvent;

import java.util.List;
import java.util.ArrayList;
import java.util.Collections;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Thread-Safe Job Queue - synchronized version of JobQueue
 * Provides thread-safe job queue operations
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ThreadSafeJobQueue {
    
    private final ThreadSafeManagerInterface syncManager;
    private final List<Job> queuedJobs;
    private final List<JobQueueListener> listeners;
    private final AtomicBoolean running;
    private final AtomicInteger activeCount;
    private final AtomicBoolean criticalSection;
    private Job criticalSectionOwner;
    
    public ThreadSafeJobQueue(ThreadSafeManagerInterface syncManager) {
        this.syncManager = syncManager != null ? syncManager : ThreadSafeManager.getInstance();
        this.queuedJobs = Collections.synchronizedList(new ArrayList<>());
        this.listeners = Collections.synchronizedList(new ArrayList<>());
        this.running = new AtomicBoolean(false);
        this.activeCount = new AtomicInteger(0);
        this.criticalSection = new AtomicBoolean(false);
        this.criticalSectionOwner = null;
    }
    
    public void add(Job job) {
        if (job == null) {
            throw new IllegalArgumentException("Job cannot be null");
        }
        syncManager.executeSynchronized("jobQueue", () -> {
            queuedJobs.add(job);
            notifyListeners(new JobQueueEvent(this, 0.0f));
        });
    }
    
    public boolean remove(Job job) {
        if (job == null) {
            return false;
        }
        return syncManager.executeWithLock("jobQueue", () -> {
            boolean removed = queuedJobs.remove(job);
            if (removed) {
                notifyListeners(new JobQueueEvent(this, 0.0f));
            }
            return removed;
        });
    }
    
    public Job getNext() {
        return syncManager.executeWithLock("jobQueue", () -> {
            if (queuedJobs.isEmpty()) {
                return null;
            }
            Job job = queuedJobs.remove(0);
            activeCount.incrementAndGet();
            notifyListeners(new JobQueueEvent(this, 10.0f));
            return job;
        });
    }
    
    public void complete(Job job) {
        if (job == null) {
            return;
        }
        syncManager.executeSynchronized("jobComplete", () -> {
            activeCount.decrementAndGet();
            notifyListeners(new JobQueueEvent(this, 100.0f));
        });
    }
    
    public int getQueuedCount() {
        return syncManager.executeWithReadLock("jobQueue", () -> queuedJobs.size());
    }
    
    public int getActiveCount() {
        return activeCount.get();
    }
    
    public boolean isRunning() {
        return running.get();
    }
    
    public void start() {
        running.set(true);
        notifyListeners(new JobQueueEvent(this, 0.0f));
    }
    
    public void stop() {
        running.set(false);
        notifyListeners(new JobQueueEvent(this, 0.0f));
    }
    
    public void addListener(JobQueueListener listener) {
        if (listener != null) {
            syncManager.executeSynchronized("listeners", () -> {
                listeners.add(listener);
            });
        }
    }
    
    public void removeListener(JobQueueListener listener) {
        if (listener != null) {
            syncManager.executeSynchronized("listeners", () -> {
                listeners.remove(listener);
            });
        }
    }
    
    public boolean canExecuteInCriticalSection(Job job) {
        return syncManager.executeWithReadLock("criticalSection", () -> {
            return !criticalSection.get() || 
                   (criticalSectionOwner != null && criticalSectionOwner.equals(job));
        });
    }
    
    public boolean enterCriticalSection(Job job) {
        return syncManager.executeWithLock("criticalSection", () -> {
            if (criticalSection.get()) {
                return false;
            }
            criticalSection.set(true);
            criticalSectionOwner = job;
            return true;
        });
    }
    
    public void exitCriticalSection(Job job) {
        syncManager.executeSynchronized("criticalSection", () -> {
            if (criticalSectionOwner != null && criticalSectionOwner.equals(job)) {
                criticalSection.set(false);
                criticalSectionOwner = null;
            }
        });
    }
    
    private void notifyListeners(JobQueueEvent event) {
        List<JobQueueListener> currentListeners;
        synchronized (listeners) {
            currentListeners = new ArrayList<>(listeners);
        }
        
        for (JobQueueListener listener : currentListeners) {
            try {
                // Try to invoke event method via reflection
                listener.getClass().getMethod("jobQueueEventFired", JobQueueEvent.class)
                    .invoke(listener, event);
            } catch (Exception e) {
                System.err.println("Error notifying listener: " + e.getMessage());
            }
        }
    }
    
    public ThreadSafeManagerInterface getSyncManager() {
        return syncManager;
    }
}