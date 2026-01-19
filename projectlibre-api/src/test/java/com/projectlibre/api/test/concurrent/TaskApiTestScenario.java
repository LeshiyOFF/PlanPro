package com.projectlibre.api.test.concurrent;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

import com.projectlibre.api.test.TestScenario;
import com.projectlibre.api.model.Task;

/**
 * Test scenario for Task API endpoints
 * Tests CRUD operations concurrently
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class TaskApiTestScenario implements TestScenario {
    
    private static final String BASE_URL = "http://localhost:8080/api/tasks";
    private static final int TIMEOUT_MS = 5000;
    
    @Override
    public String getName() {
        return "Task API Concurrent Test";
    }
    
    @Override
    public void setup() {
        System.out.println("Setting up Task API test scenario");
    }
    
    @Override
    public boolean executeRequest(int threadId, int requestId) {
        try {
            String operation = determineOperation(requestId);
            
            switch (operation) {
                case "CREATE":
                    return testCreateTask(threadId, requestId);
                case "READ":
                    return testReadTask(threadId, requestId);
                case "UPDATE":
                    return testUpdateTask(threadId, requestId);
                case "DELETE":
                    return testDeleteTask(threadId, requestId);
                default:
                    return testTaskList(threadId, requestId);
            }
        } catch (Exception e) {
            System.err.println("Task API request failed: " + e.getMessage());
            return false;
        }
    }
    
    @Override
    public void cleanup() {
        System.out.println("Cleaning up Task API test scenario");
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
    
    private boolean testCreateTask(int threadId, int requestId) {
        try {
            URL url = new URL(BASE_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            String taskJson = createTaskJson(threadId, requestId);
            
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = taskJson.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }
            
            int responseCode = conn.getResponseCode();
            boolean success = responseCode >= 200 && responseCode < 300;
            
            if (!success) {
                System.err.println("Create task failed: " + responseCode + " Thread: " + threadId);
            }
            
            conn.disconnect();
            return success;
            
        } catch (Exception e) {
            System.err.println("Create task exception: " + e.getMessage());
            return false;
        }
    }
    
    private boolean testReadTask(int threadId, int requestId) {
        try {
            long taskId = (requestId % 20) + 1; // Test reading existing tasks
            URL url = new URL(BASE_URL + "/" + taskId);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            int responseCode = conn.getResponseCode();
            boolean success = responseCode >= 200 && responseCode < 300;
            
            if (!success) {
                System.err.println("Read task failed: " + responseCode + " Thread: " + threadId);
            }
            
            conn.disconnect();
            return success;
            
        } catch (Exception e) {
            System.err.println("Read task exception: " + e.getMessage());
            return false;
        }
    }
    
    private boolean testUpdateTask(int threadId, int requestId) {
        try {
            long taskId = (requestId % 10) + 1; // Test updating existing tasks
            URL url = new URL(BASE_URL + "/" + taskId);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("PUT");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            String taskJson = createTaskJson(threadId, requestId);
            
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = taskJson.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }
            
            int responseCode = conn.getResponseCode();
            boolean success = responseCode >= 200 && responseCode < 300;
            
            if (!success) {
                System.err.println("Update task failed: " + responseCode + " Thread: " + threadId);
            }
            
            conn.disconnect();
            return success;
            
        } catch (Exception e) {
            System.err.println("Update task exception: " + e.getMessage());
            return false;
        }
    }
    
    private boolean testDeleteTask(int threadId, int requestId) {
        try {
            long taskId = (requestId % 5) + 50; // Test deleting test tasks
            URL url = new URL(BASE_URL + "/" + taskId);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("DELETE");
            conn.setRequestProperty("Accept", "application/json");
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            int responseCode = conn.getResponseCode();
            boolean success = responseCode >= 200 && responseCode < 300;
            
            if (!success) {
                System.err.println("Delete task failed: " + responseCode + " Thread: " + threadId);
            }
            
            conn.disconnect();
            return success;
            
        } catch (Exception e) {
            System.err.println("Delete task exception: " + e.getMessage());
            return false;
        }
    }
    
    private boolean testTaskList(int threadId, int requestId) {
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
                System.err.println("Task list failed: " + responseCode + " Thread: " + threadId);
            }
            
            conn.disconnect();
            return success;
            
        } catch (Exception e) {
            System.err.println("Task list exception: " + e.getMessage());
            return false;
        }
    }
    
    private String createTaskJson(int threadId, int requestId) {
        return String.format(
            "{\"name\":\"Test Task T%dR%d\",\"description\":\"Concurrent test task from thread %d, request %d\",\"duration\":8,\"priority\":5,\"percentComplete\":0}",
            threadId, requestId, threadId, requestId
        );
    }
}