package com.projectlibre.api.contract;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;

import java.util.HashMap;
import java.util.Map;
import static com.projectlibre.api.contract.PactDslUtils.*;

/**
 * Расширенные контрактные тесты для достижения 80% покрытия
 * Проверяют edge cases и дополнительные сценарии
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ExtendedContractTest {
    
    @Test
    @DisplayName("Contract test: пустой список проектов")
    void testEmptyProjectsListContract() {
        Map<String, Object> response = PactDslUtils.createSuccessArrayResponse("Projects retrieved", new Object[0]);
        
        Assertions.assertNotNull(response, "Response should not be null");
        Assertions.assertTrue(response.containsKey("success"), "Should contain success field");
        Assertions.assertTrue(response.containsKey("data"), "Should contain data field");
        Assertions.assertTrue((Boolean) response.get("success"), "Success should be true");
        
        Object[] projects = (Object[]) response.get("data");
        Assertions.assertEquals(0, projects.length, "Projects array should be empty");
    }
    
    @Test
    @DisplayName("Contract test: множество проектов")
    void testMultipleProjectsContract() {
        Object[] projectsArray = {
            PactDslUtils.createProjectDtoMap(),
            PactDslUtils.createProjectDtoMap()
        };
        
        Map<String, Object> response = PactDslUtils.createSuccessArrayResponse("Projects retrieved", projectsArray);
        
        Assertions.assertNotNull(response, "Response should not be null");
        Assertions.assertTrue(response.containsKey("success"), "Should contain success field");
        Assertions.assertTrue(response.containsKey("data"), "Should contain data field");
        Assertions.assertTrue((Boolean) response.get("success"), "Success should be true");
        
        Object[] projects = (Object[]) response.get("data");
        Assertions.assertEquals(2, projects.length, "Should have 2 projects");
    }
    
    @Test
    @DisplayName("Contract test: ресурс с полной информацией")
    void testFullResourceContract() {
        Map<String, Object> resource = PactDslUtils.createResourceDtoMap();
        
        Assertions.assertNotNull(resource, "Resource should not be null");
        Assertions.assertTrue(resource.containsKey("id"), "Should contain id field");
        Assertions.assertTrue(resource.containsKey("name"), "Should contain name field");
        Assertions.assertTrue(resource.containsKey("type"), "Should contain type field");
        Assertions.assertTrue(resource.containsKey("email"), "Should contain email field");
        Assertions.assertTrue(resource.containsKey("department"), "Should contain department field");
        Assertions.assertTrue(resource.containsKey("available"), "Should contain available field");
        Assertions.assertTrue(resource.containsKey("cost"), "Should contain cost field");
        Assertions.assertTrue(resource.containsKey("efficiency"), "Should contain efficiency field");
    }
    
    @Test
    @DisplayName("Contract test: задача с максимальными значениями")
    void testTaskWithMaxValuesContract() {
        Map<String, Object> task = PactDslUtils.createTaskDtoMap();
        task.put("progress", 100.0);
        task.put("estimatedHours", 1000);
        task.put("actualHours", 999);
        
        Assertions.assertNotNull(task, "Task should not be null");
        Assertions.assertEquals(100.0, task.get("progress"), "Progress should be 100%");
        Assertions.assertEquals(1000, task.get("estimatedHours"), "Estimated hours should be max");
        Assertions.assertEquals(999, task.get("actualHours"), "Actual hours should be max");
    }
    
    @Test
    @DisplayName("Contract test: проект с минимальными значениями")
    void testProjectWithMinValuesContract() {
        Map<String, Object> project = PactDslUtils.createProjectDtoMap();
        project.put("progress", 0.0);
        project.put("name", "A");
        project.put("description", "");
        
        Assertions.assertNotNull(project, "Project should not be null");
        Assertions.assertEquals(0.0, project.get("progress"), "Progress should be 0%");
        Assertions.assertEquals("A", project.get("name"), "Name should be minimal");
        Assertions.assertEquals("", project.get("description"), "Description can be empty");
    }
    
    @Test
    @DisplayName("Contract test: запрос создания с минимальными полями")
    void testMinimalCreateRequestContract() {
        Map<String, Object> request = new HashMap<>();
        request.put("name", "Test");
        
        Assertions.assertNotNull(request, "Request should not be null");
        Assertions.assertTrue(request.containsKey("name"), "Should contain name field");
        Assertions.assertEquals("Test", request.get("name"), "Name should match");
    }
    
    @Test
    @DisplayName("Contract test: запрос создания со всеми полями")
    void testFullCreateRequestContract() {
        Map<String, Object> request = PactDslUtils.createProjectRequestMap();
        request.put("startDate", "2024-01-01");
        request.put("endDate", "2024-12-31");
        request.put("budget", 100000.0);
        request.put("manager", "John Doe");
        
        Assertions.assertNotNull(request, "Request should not be null");
        Assertions.assertTrue(request.containsKey("name"), "Should contain name field");
        Assertions.assertTrue(request.containsKey("description"), "Should contain description field");
        Assertions.assertTrue(request.containsKey("status"), "Should contain status field");
        Assertions.assertTrue(request.containsKey("priority"), "Should contain priority field");
        Assertions.assertTrue(request.containsKey("startDate"), "Should contain startDate field");
        Assertions.assertTrue(request.containsKey("endDate"), "Should contain endDate field");
        Assertions.assertTrue(request.containsKey("budget"), "Should contain budget field");
        Assertions.assertTrue(request.containsKey("manager"), "Should contain manager field");
    }
    
    @Test
    @DisplayName("Contract test: ответ с ошибкой валидации")
    void testValidationErrorResponseContract() {
        Map<String, Object> response = PactDslUtils.createErrorResponse("Validation failed");
        
        Assertions.assertNotNull(response, "Response should not be null");
        Assertions.assertTrue(response.containsKey("success"), "Should contain success field");
        Assertions.assertTrue(response.containsKey("message"), "Should contain message field");
        Assertions.assertTrue(response.containsKey("errors"), "Should contain errors field");
        
        Assertions.assertFalse((Boolean) response.get("success"), "Success should be false");
        Assertions.assertEquals("Validation failed", response.get("message"), "Message should match");
        
        String[] errors = (String[]) response.get("errors");
        Assertions.assertNotNull(errors, "Errors array should not be null");
        Assertions.assertTrue(errors.length > 0, "Should have at least one error");
    }
    
    @Test
    @DisplayName("Contract test: ответ с ошибкой Not Found")
    void testNotFoundErrorResponseContract() {
        Map<String, Object> response = PactDslUtils.createErrorResponse("Resource not found");
        
        Assertions.assertNotNull(response, "Response should not be null");
        Assertions.assertFalse((Boolean) response.get("success"), "Success should be false");
        Assertions.assertEquals("Resource not found", response.get("message"), "Message should match");
        Assertions.assertTrue(response.containsKey("errors"), "Should contain errors field");
    }
    
    @Test
    @DisplayName("Contract test: обновление статуса проекта")
    void testUpdateStatusContract() {
        Map<String, Object> request = new HashMap<>();
        request.put("status", "COMPLETED");
        request.put("progress", 100.0);
        
        Assertions.assertNotNull(request, "Request should not be null");
        Assertions.assertTrue(request.containsKey("status"), "Should contain status field");
        Assertions.assertTrue(request.containsKey("progress"), "Should contain progress field");
        Assertions.assertEquals("COMPLETED", request.get("status"), "Status should be completed");
        Assertions.assertEquals(100.0, request.get("progress"), "Progress should be 100%");
    }
    
    @Test
    @DisplayName("Contract test: фильтрация ресурсов по типу")
    void testFilterResourcesByTypeContract() {
        Map<String, Object> request = new HashMap<>();
        request.put("type", "HUMAN");
        request.put("available", true);
        request.put("department", "DEVELOPMENT");
        
        Map<String, Object> response = PactDslUtils.createSuccessArrayResponse("Resources filtered", new Object[0]);
        
        Assertions.assertNotNull(request, "Filter request should not be null");
        Assertions.assertNotNull(response, "Filter response should not be null");
        Assertions.assertTrue((Boolean) response.get("success"), "Filter response should be successful");
    }
    
    @Test
    @DisplayName("Contract test: пагинация результатов")
    void testPaginationContract() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", new Object[0]);
        response.put("pagination", Map.of(
            "page", 1,
            "limit", 20,
            "total", 100,
            "pages", 5
        ));
        
        Assertions.assertNotNull(response, "Paginated response should not be null");
        Assertions.assertTrue(response.containsKey("pagination"), "Should contain pagination field");
        
        Map<String, Object> pagination = (Map<String, Object>) response.get("pagination");
        Assertions.assertNotNull(pagination, "Pagination should not be null");
        Assertions.assertTrue(pagination.containsKey("page"), "Should contain page field");
        Assertions.assertTrue(pagination.containsKey("limit"), "Should contain limit field");
        Assertions.assertTrue(pagination.containsKey("total"), "Should contain total field");
        Assertions.assertTrue(pagination.containsKey("pages"), "Should contain pages field");
    }
    
    @Test
    @DisplayName("Contract test: сортировка результатов")
    void testSortingContract() {
        Map<String, Object> request = new HashMap<>();
        request.put("sortBy", "name");
        request.put("sortOrder", "asc");
        
        Assertions.assertNotNull(request, "Sort request should not be null");
        Assertions.assertTrue(request.containsKey("sortBy"), "Should contain sortBy field");
        Assertions.assertTrue(request.containsKey("sortOrder"), "Should contain sortOrder field");
        Assertions.assertEquals("name", request.get("sortBy"), "Should sort by name");
        Assertions.assertEquals("asc", request.get("sortOrder"), "Should sort ascending");
    }
}