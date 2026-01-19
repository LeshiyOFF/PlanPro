package com.projectlibre.api.test;

import com.projectlibre.api.test.framework.HttpClientTestFramework;
import static com.projectlibre.api.test.framework.HttpClientTestFramework.*;

/**
 * Простой рабочий тест для демонстрации функциональности
 */
public class SimpleWorkingTest {
    
    public static void main(String[] args) {
        System.out.println("=== Простой рабочий тест ===");
        
        try {
            // Тест только GET запроса к health эндпоинту
            HttpResponse response = get("/health");
            
            System.out.println("Status: " + response.getStatusCode());
            System.out.println("Body: " + response.getBody());
            
            if (response.getStatusCode() == 200) {
                System.out.println("✅ Тест пройден!");
            } else {
                System.out.println("❌ Тест не пройден");
            }
            
        } catch (Exception e) {
            System.out.println("Ошибка: " + e.getMessage());
            e.printStackTrace();
        }
    }
}