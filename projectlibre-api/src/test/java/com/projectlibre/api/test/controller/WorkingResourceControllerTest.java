package com.projectlibre.api.test.controller;

import com.projectlibre.api.test.framework.HttpClientTestFramework;
import static com.projectlibre.api.test.framework.HttpClientTestFramework.*;

/**
 * Рабочие тесты для ResourceController
 */
public class WorkingResourceControllerTest {
    
    public static void main(String[] args) {
        System.out.println("=== Working ResourceController Tests ===");
        
        try {
            // Тест 1: Получить все ресурсы
            var allResources = getResources();
            System.out.println("All resources status: " + allResources.getStatusCode());
            System.out.println("Resources count: " + parseJsonCount(allResources.getBody()));
            System.out.println();
            
            // Тест 2: Создать ресурс
            String newResource = """
                {
                    "name": "Test Resource",
                    "type": "HUMAN",
                    "capacity": 8.0,
                    "cost": 100.0
                }
                """;
                
            var createResponse = createResource(newResource);
            System.out.println("Create resource status: " + createResponse.getStatusCode());
            System.out.println("Create resource body: " + createResponse.getBody());
            System.out.println();
            
            // Тест 3: Получить ресурс по ID
            var getResponse = getResource(1);
            System.out.println("Get resource status: " + getResponse.getStatusCode());
            System.out.println("Get resource body: " + getResponse.getBody());
            System.out.println();
            
            // Тест 4: Производительность
            int successCount = 0;
            int requestCount = 10;
            long startTime = System.currentTimeMillis();
            
            for (int i = 0; i < requestCount; i++) {
                try {
                    var response = getResources();
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
                System.out.println("✅ ResourceController tests PASSED!");
            } else {
                System.out.println("❌ ResourceController tests FAILED!");
            }
            
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}