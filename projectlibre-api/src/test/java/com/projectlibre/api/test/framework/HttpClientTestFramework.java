package com.projectlibre.api.test.framework;

import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

/**
 * Base test framework for HTTP API testing
 * Provides comprehensive HTTP client for testing REST endpoints
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class HttpClientTestFramework {
    
    private static final String BASE_URL = "http://localhost:8080/api";
    private static final String PROJECTS_BASE_URL = BASE_URL;
    private static final String TASKS_BASE_URL = BASE_URL;
    private static final String RESOURCES_BASE_URL = BASE_URL;
    private static final String HEALTH_BASE_URL = BASE_URL;
    private static final int TIMEOUT_MS = 10000;
    
    /**
     * HTTP response wrapper
     */
    public static class HttpResponse {
        private final int statusCode;
        private final String body;
        private final Map<String, String> headers;
        
        public HttpResponse(int statusCode, String body, Map<String, String> headers) {
            this.statusCode = statusCode;
            this.body = body;
            this.headers = headers;
        }
        
        public int getStatusCode() { return statusCode; }
        public String getBody() { return body; }
        public Map<String, String> getHeaders() { return headers; }
        
        public boolean isSuccess() { return statusCode >= 200 && statusCode < 300; }
        public boolean isNotFound() { return statusCode == 404; }
        public boolean isBadRequest() { return statusCode == 400; }
        public boolean isServerError() { return statusCode >= 500; }
    }
    
    /**
     * Test case result
     */
    public static class TestResult {
        private final String testName;
        private final boolean passed;
        private final String message;
        private final long executionTime;
        
        public TestResult(String testName, boolean passed, String message, long executionTime) {
            this.testName = testName;
            this.passed = passed;
            this.message = message;
            this.executionTime = executionTime;
        }
        
        public String getTestName() { return testName; }
        public boolean isPassed() { return passed; }
        public String getMessage() { return message; }
        public long getExecutionTime() { return executionTime; }
    }
    
    /**
     * Test suite results
     */
    public static class TestSuite {
        private final String suiteName;
        private final List<TestResult> results;
        
        public TestSuite(String suiteName) {
            this.suiteName = suiteName;
            this.results = new ArrayList<>();
        }
        
        public void addResult(TestResult result) {
            results.add(result);
        }
        
        public void printResults() {
            System.out.println("\n=== " + suiteName + " Test Results ===");
            
            int passed = 0;
            int total = results.size();
            long totalTime = 0;
            
            for (TestResult result : results) {
                String status = result.isPassed() ? "✅ PASS" : "❌ FAIL";
                System.out.println(status + " | " + result.getTestName() + 
                                 " | " + result.getExecutionTime() + "ms | " + result.getMessage());
                
                if (result.isPassed()) passed++;
                totalTime += result.getExecutionTime();
            }
            
            double successRate = total > 0 ? (double) passed / total * 100.0 : 0.0;
            System.out.println("\nSummary:");
            System.out.println("Total tests: " + total);
            System.out.println("Passed: " + passed);
            System.out.println("Failed: " + (total - passed));
            System.out.println("Success rate: " + String.format("%.1f%%", successRate));
            System.out.println("Total execution time: " + totalTime + "ms");
            System.out.println("Average test time: " + (total / total) + "ms");
        }
        
        public boolean allTestsPassed() {
            return results.stream().allMatch(TestResult::isPassed);
        }
    }
    
    /**
     * HTTP GET request
     */
    public static HttpResponse get(String baseUrl, String endpoint) throws IOException {
        return get(baseUrl, endpoint, new HashMap<>());
    }
    
    public static HttpResponse get(String baseUrl, String endpoint, Map<String, String> headers) throws IOException {
        URL url = new URL(baseUrl + endpoint);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(TIMEOUT_MS);
        connection.setReadTimeout(TIMEOUT_MS);
        
        // Set headers
        for (Map.Entry<String, String> header : headers.entrySet()) {
            connection.setRequestProperty(header.getKey(), header.getValue());
        }
        
        connection.setRequestProperty("Accept", "application/json");
        connection.setRequestProperty("Content-Type", "application/json");
        
        int statusCode = connection.getResponseCode();
        String body = readResponseBody(connection);
        
        return new HttpResponse(statusCode, body, new HashMap<>());
    }
    
    /**
     * HTTP POST request
     */
    public static HttpResponse post(String baseUrl, String endpoint, String body) throws IOException {
        return post(baseUrl, endpoint, body, new HashMap<>());
    }
    
    public static HttpResponse post(String baseUrl, String endpoint, String body, Map<String, String> headers) throws IOException {
        URL url = new URL(baseUrl + endpoint);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        
        connection.setRequestMethod("POST");
        connection.setConnectTimeout(TIMEOUT_MS);
        connection.setReadTimeout(TIMEOUT_MS);
        connection.setDoOutput(true);
        
        // Set headers
        for (Map.Entry<String, String> header : headers.entrySet()) {
            connection.setRequestProperty(header.getKey(), header.getValue());
        }
        
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("Accept", "application/json");
        
        // Send request body
        try (OutputStream os = connection.getOutputStream()) {
            byte[] input = body.getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }
        
        int statusCode = connection.getResponseCode();
        String responseBody = readResponseBody(connection);
        
        return new HttpResponse(statusCode, responseBody, new HashMap<>());
    }
    
    /**
     * HTTP PUT request
     */
    public static HttpResponse put(String baseUrl, String endpoint, String body) throws IOException {
        return put(baseUrl, endpoint, body, new HashMap<>());
    }
    
    public static HttpResponse put(String baseUrl, String endpoint, String body, Map<String, String> headers) throws IOException {
        URL url = new URL(baseUrl + endpoint);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        
        connection.setRequestMethod("PUT");
        connection.setConnectTimeout(TIMEOUT_MS);
        connection.setReadTimeout(TIMEOUT_MS);
        connection.setDoOutput(true);
        
        // Set headers
        for (Map.Entry<String, String> header : headers.entrySet()) {
            connection.setRequestProperty(header.getKey(), header.getValue());
        }
        
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("Accept", "application/json");
        
        // Send request body
        try (OutputStream os = connection.getOutputStream()) {
            byte[] input = body.getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }
        
        int statusCode = connection.getResponseCode();
        String responseBody = readResponseBody(connection);
        
        return new HttpResponse(statusCode, responseBody, new HashMap<>());
    }
    
    /**
     * HTTP DELETE request
     */
    public static HttpResponse delete(String baseUrl, String endpoint) throws IOException {
        return delete(baseUrl, endpoint, new HashMap<>());
    }
    
    public static HttpResponse delete(String baseUrl, String endpoint, Map<String, String> headers) throws IOException {
        URL url = new URL(baseUrl + endpoint);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        
        connection.setRequestMethod("DELETE");
        connection.setConnectTimeout(TIMEOUT_MS);
        connection.setReadTimeout(TIMEOUT_MS);
        
        // Set headers
        for (Map.Entry<String, String> header : headers.entrySet()) {
            connection.setRequestProperty(header.getKey(), header.getValue());
        }
        
        connection.setRequestProperty("Accept", "application/json");
        
        int statusCode = connection.getResponseCode();
        String responseBody = readResponseBody(connection);
        
        return new HttpResponse(statusCode, responseBody, new HashMap<>());
    }
    
    /**
     * Read response body from HTTP connection
     */
    private static String readResponseBody(HttpURLConnection connection) throws IOException {
        int statusCode = connection.getResponseCode();
        
        if (statusCode >= 200 && statusCode < 300) {
            return new String(connection.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } else {
            return new String(connection.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
        }
    }
    
    /**
     * Executes a test case and returns a TestResult
     */
    public static TestResult executeTest(String testName, TestCase testCase) {
        long startTime = System.currentTimeMillis();
        try {
            boolean success = testCase.run();
            long executionTime = System.currentTimeMillis() - startTime;
            return new TestResult(testName, success, success ? "Test passed" : "Test failed", executionTime);
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            return new TestResult(testName, false, e.getMessage(), executionTime);
        }
    }
    
    /**
     * Test case functional interface (boolean)
     */
    @FunctionalInterface
    public interface TestCase {
        boolean run() throws Exception;
    }

    // ============ Удобные методы с автоматическим выбором базового URL ============

    /**
     * HTTP GET request with automatic base URL detection
     */
    public static HttpResponse get(String endpoint) throws IOException {
        return get(getBaseUrlForEndpoint(endpoint), endpoint);
    }

    /**
     * HTTP POST request with automatic base URL detection
     */
    public static HttpResponse post(String endpoint, String body) throws IOException {
        return post(getBaseUrlForEndpoint(endpoint), endpoint, body);
    }

    /**
     * HTTP PUT request with automatic base URL detection
     */
    public static HttpResponse put(String endpoint, String body) throws IOException {
        return put(getBaseUrlForEndpoint(endpoint), endpoint, body);
    }

    /**
     * HTTP DELETE request with automatic base URL detection
     */
    public static HttpResponse delete(String endpoint) throws IOException {
        return delete(getBaseUrlForEndpoint(endpoint), endpoint);
    }

    private static String getBaseUrlForEndpoint(String endpoint) {
        if (endpoint.startsWith("/projects")) return PROJECTS_BASE_URL;
        if (endpoint.startsWith("/tasks")) return TASKS_BASE_URL;
        if (endpoint.startsWith("/resources")) return RESOURCES_BASE_URL;
        if (endpoint.startsWith("/health")) return HEALTH_BASE_URL;
        return PROJECTS_BASE_URL; // Default
    }
    
    /**
     * Assert JSON response contains expected data
     */
    public static boolean assertJsonContains(String json, String expectedField, String expectedValue) {
        String searchPattern = "\"" + expectedField + "\":\"" + expectedValue + "\"";
        return json.contains(searchPattern);
    }
    
    /**
     * Assert JSON response contains field
     */
    public static boolean assertJsonContainsField(String json, String expectedField) {
        String searchPattern = "\"" + expectedField + "\":";
        return json.contains(searchPattern);
    }
    
    /**
     * Assert response success
     */
    public static boolean assertSuccess(HttpResponse response) {
        return response.isSuccess() && 
               response.getBody().contains("\"success\":true");
    }
    
    /**
     * Assert response contains error
     */
    public static boolean assertError(HttpResponse response, int expectedStatusCode) {
        return response.getStatusCode() == expectedStatusCode && 
               response.getBody().contains("\"success\":false");
    }
    
    /**
     * Parse simple JSON field value
     */
    public static String parseJsonField(String json, String fieldName) {
        String searchPattern = "\"" + fieldName + "\":\"";
        int startIndex = json.indexOf(searchPattern);
        if (startIndex == -1) return null;
        
        startIndex += searchPattern.length();
        int endIndex = json.indexOf("\"", startIndex);
        if (endIndex == -1) return null;
        
        return json.substring(startIndex, endIndex);
    }
    
    /**
     * Parse count from JSON response
     */
    public static int parseJsonCount(String json) {
        String searchPattern = "\"count\":";
        int startIndex = json.indexOf(searchPattern);
        if (startIndex == -1) return 0;
        
        startIndex += searchPattern.length();
        int endIndex = json.indexOf(",", startIndex);
        if (endIndex == -1) endIndex = json.indexOf("}", startIndex);
        if (endIndex == -1) return 0;
        
        try {
            return Integer.parseInt(json.substring(startIndex, endIndex).trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
    
    // ============ Удобные методы для контроллеров ============
    
    // Projects API методы
    public static HttpResponse getProjects() throws IOException {
        return get(PROJECTS_BASE_URL, "/projects");
    }
    
    public static HttpResponse getProject(long id) throws IOException {
        return get(PROJECTS_BASE_URL, "/projects/" + id);
    }
    
    public static HttpResponse createProject(String json) throws IOException {
        return post(PROJECTS_BASE_URL, "/projects", json);
    }
    
    public static HttpResponse updateProject(long id, String json) throws IOException {
        return put(PROJECTS_BASE_URL, "/projects/" + id, json);
    }
    
    public static HttpResponse deleteProject(long id) throws IOException {
        return delete(PROJECTS_BASE_URL, "/projects/" + id);
    }
    
    // Tasks API методы
    public static HttpResponse getTasks() throws IOException {
        return get(TASKS_BASE_URL, "/tasks");
    }
    
    public static HttpResponse getTask(long id) throws IOException {
        return get(TASKS_BASE_URL, "/tasks/" + id);
    }
    
    public static HttpResponse createTask(String json) throws IOException {
        return post(TASKS_BASE_URL, "/tasks", json);
    }
    
    public static HttpResponse updateTask(long id, String json) throws IOException {
        return put(TASKS_BASE_URL, "/tasks/" + id, json);
    }
    
    public static HttpResponse deleteTask(long id) throws IOException {
        return delete(TASKS_BASE_URL, "/tasks/" + id);
    }
    
    // Resources API методы
    public static HttpResponse getResources() throws IOException {
        return get(RESOURCES_BASE_URL, "/resources");
    }
    
    public static HttpResponse getResource(long id) throws IOException {
        return get(RESOURCES_BASE_URL, "/resources/" + id);
    }
    
    public static HttpResponse createResource(String json) throws IOException {
        return post(RESOURCES_BASE_URL, "/resources", json);
    }
    
    public static HttpResponse updateResource(long id, String json) throws IOException {
        return put(RESOURCES_BASE_URL, "/resources/" + id, json);
    }
    
    public static HttpResponse deleteResource(long id) throws IOException {
        return delete(RESOURCES_BASE_URL, "/resources/" + id);
    }
    
    // Health API метод
    public static HttpResponse getHealth() throws IOException {
        return get(HEALTH_BASE_URL, "/health");
    }
}