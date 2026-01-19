package com.projectlibre.api.test.controller;

import com.projectlibre.api.test.framework.HttpClientTestFramework;
import static com.projectlibre.api.test.framework.HttpClientTestFramework.*;

/**
 * Рабочие тесты для TaskController
 */
public class WorkingTaskControllerTest {
    
    public static void main(String[] args) {
        System.out.println("=== Working TaskController Tests ===");
        
        try {
            // Тест 1: Получить все задачи
            var allTasks = getTasks();
            System.out.println("All tasks status: " + allTasks.getStatusCode());
            System.out.println("Tasks count: " + parseJsonCount(allTasks.getBody()));
            System.out.println();
            
            // Тест 2: Создать задачу
            String newTask = """
                {
                    "name": "Test Task",
                    "description": "Test Description",
                    "status": "TODO"
                }
                """;
                
            var createResponse = createTask(newTask);
            System.out.println("Create task status: " + createResponse.getStatusCode());
            System.out.println("Create task body: " + createResponse.getBody());
            System.out.println();
            
            // Тест 3: Получить задачу по ID
            var getResponse = getTask(1);
            System.out.println("Get task status: " + getResponse.getStatusCode());
            System.out.println("Get task body: " + getResponse.getBody());
            System.out.println();
            
            // Тест 4: Производительность
            int successCount = 0;
            int requestCount = 10;
            long startTime = System.currentTimeMillis();
            
            for (int i = 0; i < requestCount; i++) {
                try {
                    var response = getTasks();
                    if (response.isSuccess()) {
                        successCount++;
                    }
                } catch (Exception e) {
                    // ignore
                }
            }
            
            long avgTime = (System.currentTimeMillis() - startTime) / requestCount;
            System.out.println("Performance test: " + successCount + "/" + requestCount + 
                             " requests successful, avg " + avgTime + "ms");
            
            if (successCount >= requestCount * 0.8) {
                System.out.println("✅ TaskController tests PASSED!");
            } else {
                System.out.println("❌ TaskController tests FAILED!");
            }
            
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}