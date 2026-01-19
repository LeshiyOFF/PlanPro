package com.projectlibre.api.streaming;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;
import java.util.function.Consumer;

/**
 * Streaming JSON serializer for large datasets
 * Uses streaming write to avoid memory issues with 1000+ items
 */
public class StreamingJsonSerializer implements StreamingSerializerPort {
    
    private static volatile StreamingJsonSerializer instance;
    private static final Object LOCK = new Object();
    
    private static final int DEFAULT_BATCH_SIZE = 100;
    private static final int MIN_BATCH_SIZE = 10;
    private static final int MAX_BATCH_SIZE = 500;
    private static final int AVG_TASK_JSON_SIZE = 500;
    
    private StreamingJsonSerializer() {}
    
    public static StreamingJsonSerializer getInstance() {
        StreamingJsonSerializer result = instance;
        if (result == null) {
            synchronized (LOCK) {
                result = instance;
                if (result == null) {
                    instance = result = new StreamingJsonSerializer();
                }
            }
        }
        return result;
    }
    
    @Override
    public <T> void serializeStream(Iterator<T> items, OutputStream output, ItemSerializer<T> itemSerializer) {
        serializeStreamWithProgress(items, output, itemSerializer, null);
    }
    
    @Override
    public <T> void serializeStreamWithProgress(
            Iterator<T> items, OutputStream output, 
            ItemSerializer<T> itemSerializer, Consumer<StreamingProgress> progressCallback) {
        
        long startTime = System.currentTimeMillis();
        int processed = 0;
        long bytesWritten = 0;
        
        try (BufferedWriter writer = new BufferedWriter(
                new OutputStreamWriter(output, StandardCharsets.UTF_8), 8192)) {
            
            writer.write("[");
            boolean first = true;
            
            while (items.hasNext()) {
                T item = items.next();
                String json = itemSerializer.serialize(item);
                
                if (!first) writer.write(",");
                first = false;
                
                writer.write(json);
                bytesWritten += json.length() + 1;
                processed++;
                
                if (progressCallback != null && processed % 50 == 0) {
                    long elapsed = System.currentTimeMillis() - startTime;
                    progressCallback.accept(new StreamingProgress(processed, -1, bytesWritten, elapsed));
                }
            }
            
            writer.write("]");
            writer.flush();
            
            if (progressCallback != null) {
                long elapsed = System.currentTimeMillis() - startTime;
                progressCallback.accept(new StreamingProgress(processed, processed, bytesWritten, elapsed));
            }
            
        } catch (IOException e) {
            System.err.println("[StreamingSerializer] Error: " + e.getMessage());
        }
    }
    
    @Override
    public <T> void serializeBatched(Iterator<T> items, int batchSize, 
                                     Consumer<String> batchConsumer, ItemSerializer<T> itemSerializer) {
        
        StringBuilder batch = new StringBuilder(batchSize * AVG_TASK_JSON_SIZE);
        int count = 0;
        int batchNumber = 0;
        
        batch.append("{\"batch\":").append(batchNumber).append(",\"items\":[");
        boolean firstInBatch = true;
        
        while (items.hasNext()) {
            T item = items.next();
            String json = itemSerializer.serialize(item);
            
            if (!firstInBatch) batch.append(",");
            firstInBatch = false;
            batch.append(json);
            count++;
            
            if (count >= batchSize) {
                batch.append("],\"hasMore\":").append(items.hasNext()).append("}");
                batchConsumer.accept(batch.toString());
                
                batch.setLength(0);
                batchNumber++;
                batch.append("{\"batch\":").append(batchNumber).append(",\"items\":[");
                count = 0;
                firstInBatch = true;
            }
        }
        
        if (count > 0) {
            batch.append("],\"hasMore\":false}");
            batchConsumer.accept(batch.toString());
        }
    }
    
    @Override
    public long estimateSize(int itemCount, int avgItemSize) {
        return (long) itemCount * avgItemSize + itemCount + 2;
    }
    
    @Override
    public int getOptimalBatchSize(int totalItems) {
        if (totalItems <= 100) return totalItems;
        if (totalItems <= 500) return MIN_BATCH_SIZE * 5;
        if (totalItems <= 2000) return DEFAULT_BATCH_SIZE;
        return MAX_BATCH_SIZE;
    }
    
    public String serializeToString(Iterator<?> items, ItemSerializer<Object> serializer) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream(8192);
        serializeStream(castIterator(items), baos, serializer);
        return baos.toString(StandardCharsets.UTF_8);
    }
    
    @SuppressWarnings("unchecked")
    private Iterator<Object> castIterator(Iterator<?> items) {
        return (Iterator<Object>) items;
    }
}
