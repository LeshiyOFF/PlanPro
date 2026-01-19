package com.projectlibre.api.test.concurrent;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

import com.projectlibre.api.test.TestScenario;
import com.projectlibre.api.model.Resource;

/**
 * Test scenario for Resource API endpoints
 * Tests CRUD operations concurrently
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ResourceApiTestScenario implements TestScenario {
    
    private static final String BASE_URL = "http://localhost:8080/api/resources";
    private static final int TIMEOUT_MS = 5000;
    
    @Override
    public String getName() {
        return "Resource API Concurrent Test";
    }
    
    @Override
    public void setup() {
        System.out.println("Setting up Resource API test scenario");
    }
    
    @Override
    public boolean executeRequest(int threadId, int requestId) {
        try {
            String operation = determineOperation(requestId);
            
            switch (operation) {
                case "CREATE":
                    return testCreateResource(threadId, requestId);
                case "READ":
                    return testReadResource(threadId, requestId);
                case "UPDATE":
                    return testUpdateResource(threadId, requestId);
                case "DELETE":
                    return testDeleteResource(threadId, requestId);
                default:
                    return testResourceList(threadId, requestId);
            }
        } catch (Exception e) {
            System.err.println("Resource API request failed: " + e.getMessage());
            return false;
        }
    }
    
    @Override
    public void cleanup() {
        System.out.println("Cleaning up Resource API test scenario");
    }
    
    private String determineOperation(int requestId) {
        int operationType = requestId % 5;
        switch (operationType) {
            case 0: return "CREATE";
            case 1: return "READ";
            case 2: return "UPDATE";
            case 3: return "DELETE";
            default: return "LIST";
        }
    }
    
    private boolean testCreateResource(int threadId, int requestId) {
        try {
            URL url = new URL(BASE_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            String resourceJson = createResourceJson(threadId, requestId);
            
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = resourceJson.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }
            
            int responseCode = conn.getResponseCode();
            boolean success = responseCode >= 200 && responseCode < 300;
            
            if (!success) {
                System.err.println("Create resource failed: " + responseCode + " Thread: " + threadId);
            }
            
            conn.disconnect();
            return success;
            
        } catch (Exception e) {
            System.err.println("Create resource exception: " + e.getMessage());
            return false;
        }
    }
    
    private boolean testReadResource(int threadId, int requestId) {
        try {
            long resourceId = (requestId % 15) + 1; // Test reading existing resources
            URL url = new URL(BASE_URL + "/" + resourceId);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            int responseCode = conn.getResponseCode();
            boolean success = responseCode >= 200 && responseCode < 300;
            
            if (!success) {
                System.err.println("Read resource failed: " + responseCode + " Thread: " + threadId);
            }
            
            conn.disconnect();
            return success;
            
        } catch (Exception e) {
            System.err.println("Read resource exception: " + e.getMessage());
            return false;
        }
    }
    
    private boolean testUpdateResource(int threadId, int requestId) {
        try {
            long resourceId = (requestId % 8) + 1; // Test updating existing resources
            URL url = new URL(BASE_URL + "/" + resourceId);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("PUT");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            String resourceJson = createResourceJson(threadId, requestId);
            
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = resourceJson.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }
            
            int responseCode = conn.getResponseCode();
            boolean success = responseCode >= 200 && responseCode < 300;
            
            if (!success) {
                System.err.println("Update resource failed: " + responseCode + " Thread: " + threadId);
            }
            
            conn.disconnect();
            return success;
            
        } catch (Exception e) {
            System.err.println("Update resource exception: " + e.getMessage());
            return false;
        }
    }
    
    private boolean testDeleteResource(int threadId, int requestId) {
        try {
            long resourceId = (requestId % 4) + 100; // Test deleting test resources
            URL url = new URL(BASE_URL + "/" + resourceId);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("DELETE");
            conn.setRequestProperty("Accept", "application/json");
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            int responseCode = conn.getResponseCode();
            boolean success = responseCode >= 200 && responseCode < 300;
            
            if (!success) {
                System.err.println("Delete resource failed: " + responseCode + " Thread: " + threadId);
            }
            
            conn.disconnect();
            return success;
            
        } catch (Exception e) {
            System.err.println("Delete resource exception: " + e.getMessage());
            return false;
        }
    }
    
    private boolean testResourceList(int threadId, int requestId) {
        try {
            URL url = new URL(BASE_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            int responseCode = conn.getResponseCode();
            boolean success = responseCode >= 200 && responseCode < 300;
            
            if (!success) {
                System.err.println("Resource list failed: " + responseCode + " Thread: " + threadId);
            }
            
            conn.disconnect();
            return success;
            
        } catch (Exception e) {
            System.err.println("Resource list exception: " + e.getMessage());
            return false;
        }
    }
    
    private String createResourceJson(int threadId, int requestId) {
        return String.format(
            "{\"name\":\"Test Resource T%dR%d\",\"maxUnits\":100,\"standardRate\":50}",
            threadId, requestId
        );
    }
}