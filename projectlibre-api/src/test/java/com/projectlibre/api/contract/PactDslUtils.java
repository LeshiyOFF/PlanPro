package com.projectlibre.api.contract;

import java.util.Map;
import java.util.HashMap;

/**
 * Утилиты для создания Pact DSL объектов
 * Следует DRY принципу и обеспечивает переиспользование кода
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class PactDslUtils {
    
    /**
     * Создание стандартного успешного ответа с объектом
     */
    public static Map<String, Object> createSuccessObjectResponse(String message, Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }
    
    /**
     * Создание стандартного успешного ответа с массивом
     */
    public static Map<String, Object> createSuccessArrayResponse(String message, Object[] dataArray) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", dataArray);
        return response;
    }
    
    /**
     * Создание Project DTO в формате Map
     */
    public static Map<String, Object> createProjectDtoMap() {
        Map<String, Object> project = new HashMap<>();
        project.put("id", "1");
        project.put("name", "Test Project");
        project.put("description", "Test Description");
        project.put("status", "ACTIVE");
        project.put("priority", "HIGH");
        project.put("progress", 0.0);
        return project;
    }
    
    /**
     * Создание Task DTO в формате Map
     */
    public static Map<String, Object> createTaskDtoMap() {
        Map<String, Object> task = new HashMap<>();
        task.put("id", "1");
        task.put("name", "Test Task");
        task.put("description", "Task Description");
        task.put("status", "TODO");
        task.put("priority", "HIGH");
        task.put("type", "FEATURE");
        task.put("progress", 0.0);
        task.put("estimatedHours", 8);
        task.put("actualHours", 0);
        return task;
    }
    
    /**
     * Создание массива проектов для Pact DSL
     */
    public static Object[] createProjectArray() {
        return new Object[]{createProjectDtoMap()};
    }
    
    /**
     * Создание массива задач для Pact DSL
     */
    public static Object[] createTaskArray() {
        return new Object[]{createTaskDtoMap()};
    }
    
    /**
     * Создание стандартных заголовков
     */
    public static Map<String, String> createStandardHeaders() {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Accept", "application/json");
        return headers;
    }
    
    /**
     * Создание заголовков с CORS
     */
    public static Map<String, String> createCorsHeaders() {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("Accept", "application/json");
        headers.put("Origin", "http://localhost:5173");
        return headers;
    }
    
    /**
     * Создание ответа с ошибкой
     */
    public static Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("errors", new String[]{"Error message"});
        return response;
    }
    
    /**
     * Валидация стандартного ответа
     */
    public static boolean isValidStandardResponse(Map<String, Object> response) {
        return response.containsKey("success") && 
               response.containsKey("message") && 
               response.containsKey("data");
    }
    
    /**
     * Валидация ответа с ошибкой
     */
    public static boolean isValidErrorResponse(Map<String, Object> response) {
        return response.containsKey("success") && 
               response.containsKey("message") && 
               response.containsKey("errors");
    }
    
    /**
     * Создание DSL для запроса создания проекта
     */
    public static Map<String, Object> createProjectRequestMap() {
        Map<String, Object> request = new HashMap<>();
        request.put("name", "New Project");
        request.put("description", "New Description");
        request.put("status", "PLANNED");
        request.put("priority", "MEDIUM");
        return request;
    }
    
    /**
     * Создание DSL для запроса создания ресурса
     */
    public static Map<String, Object> createResourceRequestMap() {
        Map<String, Object> request = new HashMap<>();
        request.put("name", "Jane Smith");
        request.put("type", "HUMAN");
        request.put("email", "jane@example.com");
        request.put("department", "QA");
        request.put("available", true);
        return request;
    }
    
    /**
     * Создание Resource DTO с полными данными
     */
    public static Map<String, Object> createResourceDtoMap() {
        Map<String, Object> resource = new HashMap<>();
        resource.put("id", "1");
        resource.put("name", "Jane Smith");
        resource.put("type", "HUMAN");
        resource.put("email", "jane@example.com");
        resource.put("department", "QA");
        resource.put("available", true);
        resource.put("cost", 50000.0);
        resource.put("efficiency", 0.85);
        return resource;
    }
    
    /**
     * Создание ответа для списка проектов
     */
    public static Map<String, Object> createProjectsResponse() {
        return createSuccessArrayResponse("Projects retrieved", createProjectArray());
    }
    
    /**
     * Создание ответа для одного проекта
     */
    public static Map<String, Object> createProjectResponse() {
        return createSuccessObjectResponse("Project retrieved", createProjectDtoMap());
    }
    
    /**
     * Создание ответа для списка ресурсов
     */
    public static Map<String, Object> createResourcesResponse() {
        return createSuccessArrayResponse("Resources retrieved", new Object[]{createResourceDtoMap()});
    }
    
    /**
     * Создание ответа для одного ресурса
     */
    public static Map<String, Object> createResourceResponse() {
        return createSuccessObjectResponse("Resource retrieved", createResourceDtoMap());
    }
    
    /**
     * Создание ответа для списка задач
     */
    public static Map<String, Object> createTasksResponse() {
        return createSuccessArrayResponse("Tasks retrieved", createTaskArray());
    }
    
    /**
     * Создание ответа для одной задачи
     */
    public static Map<String, Object> createTaskResponse() {
        return createSuccessObjectResponse("Task retrieved", createTaskDtoMap());
    }
    
    /**
     * Создание запроса на создание проекта
     */
    public static Map<String, Object> createProjectRequest() {
        return createProjectRequestMap();
    }
    
    /**
     * Создание запроса на создание ресурса
     */
    public static Map<String, Object> createResourceRequest() {
        return createResourceRequestMap();
    }
    
    /**
     * Создание запроса на создание задачи
     */
    public static Map<String, Object> createTaskRequest() {
        Map<String, Object> request = new HashMap<>();
        request.put("name", "New Task");
        request.put("description", "New Task Description");
        request.put("status", "TODO");
        request.put("priority", "MEDIUM");
        request.put("type", "FEATURE");
        request.put("estimatedHours", 8);
        request.put("actualHours", 0);
        return request;
    }
}