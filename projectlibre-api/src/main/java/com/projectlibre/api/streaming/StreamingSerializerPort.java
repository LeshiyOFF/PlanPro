package com.projectlibre.api.streaming;

import java.io.OutputStream;
import java.util.Iterator;
import java.util.function.Consumer;

/**
 * Port for streaming serialization operations
 * Enables processing large datasets without loading all into memory
 * Supports 1000+ tasks with instant UI response
 */
public interface StreamingSerializerPort {
    
    /**
     * Serialize items as JSON stream
     * @param items iterator over items
     * @param output output stream
     * @param itemSerializer serializer for single item
     * @param <T> item type
     */
    <T> void serializeStream(Iterator<T> items, OutputStream output, ItemSerializer<T> itemSerializer);
    
    /**
     * Serialize items with progress callback
     * @param items iterator over items
     * @param output output stream
     * @param itemSerializer serializer for single item
     * @param progressCallback callback for progress updates
     * @param <T> item type
     */
    <T> void serializeStreamWithProgress(
            Iterator<T> items,
            OutputStream output,
            ItemSerializer<T> itemSerializer,
            Consumer<StreamingProgress> progressCallback
    );
    
    /**
     * Serialize items in batches for chunked transfer
     * @param items iterator over items
     * @param batchSize items per batch
     * @param batchConsumer consumer for each batch as JSON
     * @param itemSerializer serializer for single item
     * @param <T> item type
     */
    <T> void serializeBatched(
            Iterator<T> items,
            int batchSize,
            Consumer<String> batchConsumer,
            ItemSerializer<T> itemSerializer
    );
    
    /**
     * Estimate serialization size
     * @param itemCount number of items
     * @param avgItemSize average item size in bytes
     * @return estimated total size
     */
    long estimateSize(int itemCount, int avgItemSize);
    
    /**
     * Get recommended batch size for item count
     * @param totalItems total number of items
     * @return optimal batch size
     */
    int getOptimalBatchSize(int totalItems);
    
    /**
     * Functional interface for item serialization
     */
    @FunctionalInterface
    interface ItemSerializer<T> {
        String serialize(T item);
    }
}
