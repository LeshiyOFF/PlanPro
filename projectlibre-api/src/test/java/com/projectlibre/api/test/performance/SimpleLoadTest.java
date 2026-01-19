package com.projectlibre.api.test.performance;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple load testing for health endpoint.
 * Tests basic performance characteristics.
 */
public final class SimpleLoadTest {
    
    private static final String BASE_URL = "http://localhost:8080";
    private static final String HEALTH_ENDPOINT = "/api/health";
    private static final int TIMEOUT = 5000;
    
    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("     SIMPLE LOAD TEST");
        System.out.println("=================================================");
        
        testSingleRequest();
        testConcurrentRequests(10);
        testConcurrentRequests(50);
        testConcurrentRequests(100);
        
        System.out.println("\n✅ Simple Load Test Completed!");
    }
    
    /**
     * Tests single request baseline.
     */
    private static void testSingleRequest() {
        try {
            long startTime = System.currentTimeMillis();
            String response = sendRequest();
            long endTime = System.currentTimeMillis();
            
            System.out.printf("Single request: %dms | Response: %s%n", 
                endTime - startTime, response.length() + " chars");
                
        } catch (Exception e) {
            System.out.printf("Single request failed: %s%n", e.getMessage());
        }
    }
    
    /**
     * Tests concurrent requests.
     */
    private static void testConcurrentRequests(int threads) {
        try {
            System.out.printf("\nTesting %d concurrent requests...%n", threads);
            
            CountDownLatch latch = new CountDownLatch(threads);
            ExecutorService executor = Executors.newFixedThreadPool(threads);
            
            AtomicInteger successCount = new AtomicInteger(0);
            long startTime = System.currentTimeMillis();
            
            for (int i = 0; i < threads; i++) {
                executor.submit(() -> {
                    try {
                        if (sendRequest() != null) {
                            successCount.incrementAndGet();
                        }
                    } catch (Exception e) {
                        // Log error but continue
                    } finally {
                        latch.countDown();
                    }
                });
            }
            
            latch.await(10, TimeUnit.SECONDS);
            long endTime = System.currentTimeMillis();
            
            System.out.printf("%d threads: %dms | Success: %d/%d (%.1f%%)%n",
                threads, endTime - startTime, successCount.get(), threads,
                (successCount.get() * 100.0 / threads));
                
        } catch (Exception e) {
            System.out.printf("Concurrent test failed: %s%n", e.getMessage());
        }
    }
    
    /**
     * Sends HTTP GET request.
     */
    private static String sendRequest() throws IOException {
        URL url = new URL(BASE_URL + HEALTH_ENDPOINT);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(TIMEOUT);
        connection.setReadTimeout(TIMEOUT);
        connection.setRequestProperty("User-Agent", "SimpleLoadTest/1.0");
        
        int responseCode = connection.getResponseCode();
        
        if (responseCode >= 200 && responseCode < 300) {
            try (Scanner scanner = new Scanner(connection.getInputStream(), "UTF-8")) {
                return scanner.useDelimiter("\\A").next();
            }
        } else {
            throw new IOException("HTTP " + responseCode);
        }
    }
}