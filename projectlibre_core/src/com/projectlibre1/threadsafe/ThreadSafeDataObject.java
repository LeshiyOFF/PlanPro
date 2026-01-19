package com.projectlibre1.threadsafe;

import com.projectlibre1.server.data.CommonDataObject;

import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Thread-safe wrapper for data objects
 * Provides thread-safe access to shared data
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ThreadSafeDataObject<T> implements ThreadSafeDataObjectInterface<T> {
    
    private final CommonDataObject delegate;
    private final ReentrantReadWriteLock dataLock;
    private volatile T cachedData;
    private volatile long lastModified;
    
    public ThreadSafeDataObject(CommonDataObject delegate) {
        this.delegate = delegate;
        this.dataLock = new ReentrantReadWriteLock();
        this.lastModified = System.currentTimeMillis();
    }
    
    public long getUniqueId() {
        dataLock.readLock().lock();
        try {
            return delegate.getUniqueId();
        } finally {
            dataLock.readLock().unlock();
        }
    }
    
    public void setUniqueId(long id) {
        dataLock.writeLock().lock();
        try {
            delegate.setUniqueId(id);
            lastModified = System.currentTimeMillis();
        } finally {
            dataLock.writeLock().unlock();
        }
    }
    
    public String getName() {
        dataLock.readLock().lock();
        try {
            return delegate.getName();
        } finally {
            dataLock.readLock().unlock();
        }
    }
    
    public void setName(String name) {
        dataLock.writeLock().lock();
        try {
            delegate.setName(name);
            lastModified = System.currentTimeMillis();
        } finally {
            dataLock.writeLock().unlock();
        }
    }
    
    public boolean isLocal() {
        dataLock.readLock().lock();
        try {
            return delegate.isLocal();
        } finally {
            dataLock.readLock().unlock();
        }
    }
    
    public Object getData(String dataKey) {
        dataLock.readLock().lock();
        try {
            if ("name".equals(dataKey)) {
                return delegate.getName();
            } else if ("uniqueId".equals(dataKey)) {
                return delegate.getUniqueId();
            } else if ("local".equals(dataKey)) {
                return delegate.isLocal();
            }
            return null;
        } finally {
            dataLock.readLock().unlock();
        }
    }
    
    public void setData(String dataKey, Object value) {
        dataLock.writeLock().lock();
        try {
            if ("name".equals(dataKey) && value instanceof String) {
                delegate.setName((String) value);
            } else if ("uniqueId".equals(dataKey) && value instanceof Long) {
                delegate.setUniqueId((Long) value);
            }
            lastModified = System.currentTimeMillis();
        } finally {
            dataLock.writeLock().unlock();
        }
    }
    
    public T getCachedData() {
        dataLock.readLock().lock();
        try {
            return cachedData;
        } finally {
            dataLock.readLock().unlock();
        }
    }
    
    public void setCachedData(T data) {
        dataLock.writeLock().lock();
        try {
            this.cachedData = data;
            lastModified = System.currentTimeMillis();
        } finally {
            dataLock.writeLock().unlock();
        }
    }
    
    public long getLastModified() {
        return lastModified;
    }
    
    public boolean isThreadSafe() {
        return true;
    }
    
    public CommonDataObject getDelegate() {
        return delegate;
    }
}