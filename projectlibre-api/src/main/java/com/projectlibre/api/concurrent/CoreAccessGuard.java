package com.projectlibre.api.concurrent;

import org.springframework.stereotype.Component;

import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;

/**
 * Protection against race conditions for concurrent access to ProjectLibre Core.
 * Ensures sequential execution of operations via ReentrantLock.
 * 
 * Legacy Core is not thread-safe, so all calls must be serialized through this guard.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
@Component
public class CoreAccessGuard {
    
    private final ReentrantLock coreLock = new ReentrantLock(true);
    private volatile long operationCounter = 0;
    
    /**
     * Executes operation with exclusive lock.
     * 
     * @param operation operation to execute
     * @param <T> return type
     * @return operation result
     */
    public <T> T executeWithLock(Supplier<T> operation) {
        long opId = ++operationCounter;
        String threadName = Thread.currentThread().getName();
        
        logAttempt(opId, threadName);
        
        coreLock.lock();
        try {
            logAcquired(opId, threadName);
            T result = operation.get();
            logCompleted(opId, threadName);
            return result;
        } catch (Exception e) {
            logFailed(opId, threadName, e);
            throw e;
        } finally {
            coreLock.unlock();
            logReleased(opId, threadName);
        }
    }
    
    /**
     * Executes operation without return value with exclusive lock.
     * 
     * @param operation operation to execute
     */
    public void executeWithLock(Runnable operation) {
        executeWithLock(() -> {
            operation.run();
            return null;
        });
    }
    
    public boolean isLocked() {
        return coreLock.isLocked();
    }
    
    public int getQueueLength() {
        return coreLock.getQueueLength();
    }
    
    public boolean isHeldByCurrentThread() {
        return coreLock.isHeldByCurrentThread();
    }
    
    private void logAttempt(long opId, String thread) {
        System.out.println("[CoreAccessGuard] Op#" + opId + " attempting lock [" + thread + "]");
        if (coreLock.isLocked()) {
            System.out.println("[CoreAccessGuard]   ⚠ Held by another thread, queue=" + 
                             coreLock.getQueueLength());
        }
    }
    
    private void logAcquired(long opId, String thread) {
        System.out.println("[CoreAccessGuard] Op#" + opId + " ✅ lock acquired [" + thread + "]");
    }
    
    private void logCompleted(long opId, String thread) {
        System.out.println("[CoreAccessGuard] Op#" + opId + " ✅ completed [" + thread + "]");
    }
    
    private void logFailed(long opId, String thread, Exception e) {
        System.err.println("[CoreAccessGuard] Op#" + opId + " ❌ failed [" + thread + "]: " + 
                         e.getMessage());
    }
    
    private void logReleased(long opId, String thread) {
        System.out.println("[CoreAccessGuard] Op#" + opId + " 🔓 lock released [" + thread + "]");
    }
}
