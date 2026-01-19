package com.projectlibre.api.test.concurrent;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.OutputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

import com.projectlibre.api.test.TestScenario;
import com.projectlibre.api.model.Project;

/**
 * Test scenario for Project API endpoints
 * Tests CRUD operations concurrently
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ProjectApiTestScenario implements TestScenario {
    
    private static final String BASE_URL = "http://localhost:8080/api/projects";
    private static final int TIMEOUT_MS = 5000;
    
    @Override
    public String getName() {
        return "Project API Concurrent Test";
    }
    
    @Override
    public void setup() {
        System.out.println("Setting up Project API test scenario");
    }
    
    @Override
    public boolean executeRequest(int threadId, int requestId) {
        try {
            // Test different operations based on request ID
            String operation = determineOperation(requestId);
            
            switch (operation) {
                case "CREATE":
                    return testCreateProject(threadId, requestId);
                case "READ":
                    return testReadProject(threadId, requestId);
                case "UPDATE":
                    return testUpdateProject(threadId, requestId);
                case "DELETE":
                    return testDeleteProject(threadId, requestId);
                default:
                    return testHealthCheck(threadId, requestId);
            }
        } catch (Exception e) {
            System.err.println("Project API request failed: " + e.getMessage());
            return false;
        }
    }
    
    @Override
    public void cleanup() {
        System.out.println("Cleaning up Project API test scenario");
    }
    
    private String determineOperation(int requestId) {
        int operationType = requestId % 5;
        switch (operationType) {
            case 0: return "CREATE";
            case 1: return "READ";
            case 2: return "UPDATE";
            case 3: return "DELETE";
            default: return "HEALTH";
        }
    }
    
    private boolean testCreateProject(int threadId, int requestId) {
        try {
            URL url = new URL(BASE_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            String projectJson = createProjectJson(threadId, requestId);
            
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = projectJson.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }
            
            int responseCode = conn.getResponseCode();
            boolean success = responseCode >= 200 && responseCode < 300;
            
            if (!success) {
                System.err.println("Create project failed: " + responseCode + " Thread: " + threadId);
            }
            
            conn.disconnect();
            return success;
            
        } catch (Exception e) {
            System.err.println("Create project exception: " + e.getMessage());
            return false;
        }
    }
    
    private boolean testReadProject(int threadId, int requestId) {
        try {
            long projectId = (requestId % 10) + 1; // Test reading existing projects
            URL url = new URL(BASE_URL + "/" + projectId);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            int responseCode = conn.getResponseCode();
            boolean success = responseCode >= 200 && responseCode < 300;
            
            if (!success) {
                System.err.println("Read project failed: " + responseCode + " Thread: " + threadId);
            }
            
            conn.disconnect();
            return success;
            
        } catch (Exception e) {
            System.err.println("Read project exception: " + e.getMessage());
            return false;
        }
    }
    
    private boolean testUpdateProject(int threadId, int requestId) {
        try {
            long projectId = (requestId % 5) + 1; // Test updating existing projects
            URL url = new URL(BASE_URL + "/" + projectId);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("PUT");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            String projectJson = createProjectJson(threadId, requestId);
            
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = projectJson.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }
            
            int responseCode = conn.getResponseCode();
            boolean success = responseCode >= 200 && responseCode < 300;
            
            if (!success) {
                System.err.println("Update project failed: " + responseCode + " Thread: " + threadId);
            }
            
            conn.disconnect();
            return success;
            
        } catch (Exception e) {
            System.err.println("Update project exception: " + e.getMessage());
            return false;
        }
    }
    
    private boolean testDeleteProject(int threadId, int requestId) {
        try {
            long projectId = (requestId % 3) + 10; // Test deleting test projects
            URL url = new URL(BASE_URL + "/" + projectId);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("DELETE");
            conn.setRequestProperty("Accept", "application/json");
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            int responseCode = conn.getResponseCode();
            boolean success = responseCode >= 200 && responseCode < 300;
            
            if (!success) {
                System.err.println("Delete project failed: " + responseCode + " Thread: " + threadId);
            }
            
            conn.disconnect();
            return success;
            
        } catch (Exception e) {
            System.err.println("Delete project exception: " + e.getMessage());
            return false;
        }
    }
    
    private boolean testHealthCheck(int threadId, int requestId) {
        try {
            URL url = new URL(BASE_URL + "/health");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            
            int responseCode = conn.getResponseCode();
            boolean success = responseCode >= 200 && responseCode < 300;
            
            if (!success) {
                System.err.println("Health check failed: " + responseCode + " Thread: " + threadId);
            }
            
            conn.disconnect();
            return success;
            
        } catch (Exception e) {
            System.err.println("Health check exception: " + e.getMessage());
            return false;
        }
    }
    
    private String createProjectJson(int threadId, int requestId) {
        return String.format(
            "{\"name\":\"Test Project T%dR%d\",\"description\":\"Concurrent test project from thread %d, request %d\"}",
            threadId, requestId, threadId, requestId
        );
    }
}