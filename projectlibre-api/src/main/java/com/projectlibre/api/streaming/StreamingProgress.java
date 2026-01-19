package com.projectlibre.api.streaming;

/**
 * Progress information for streaming operations
 * Used for UI feedback during large serialization
 */
public class StreamingProgress {
    
    private final int processedItems;
    private final int totalItems;
    private final long bytesWritten;
    private final long elapsedMillis;
    private final boolean completed;
    
    public StreamingProgress(int processedItems, int totalItems, long bytesWritten, long elapsedMillis) {
        this.processedItems = processedItems;
        this.totalItems = totalItems;
        this.bytesWritten = bytesWritten;
        this.elapsedMillis = elapsedMillis;
        this.completed = processedItems >= totalItems;
    }
    
    public int getProcessedItems() { return processedItems; }
    public int getTotalItems() { return totalItems; }
    public long getBytesWritten() { return bytesWritten; }
    public long getElapsedMillis() { return elapsedMillis; }
    public boolean isCompleted() { return completed; }
    
    public double getPercentComplete() {
        if (totalItems == 0) return 100.0;
        return (processedItems * 100.0) / totalItems;
    }
    
    public double getItemsPerSecond() {
        if (elapsedMillis == 0) return 0;
        return (processedItems * 1000.0) / elapsedMillis;
    }
    
    public long getEstimatedRemainingMillis() {
        if (processedItems == 0) return 0;
        double itemsPerMs = (double) processedItems / elapsedMillis;
        int remaining = totalItems - processedItems;
        return (long) (remaining / itemsPerMs);
    }
    
    @Override
    public String toString() {
        return String.format("Progress: %d/%d (%.1f%%), %.1f items/sec",
                processedItems, totalItems, getPercentComplete(), getItemsPerSecond());
    }
}
