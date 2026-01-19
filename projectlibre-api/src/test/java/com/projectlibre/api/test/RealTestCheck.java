package com.projectlibre.api.test;

import com.projectlibre.api.test.framework.HttpClientTestFramework;

/**
 * Проверка реальных ответов сервера
 */
public class RealTestCheck {
    
    public static void main(String[] args) {
        System.out.println("=== Проверка реальных ответов сервера ===");
        
        try {
            // Проверяем health
            var healthResponse = HttpClientTestFramework.getHealth();
            System.out.println("Health status: " + healthResponse.getStatusCode());
            System.out.println("Health body: " + healthResponse.getBody());
            System.out.println();
            
            // Проверяем проекты
            var projectsResponse = HttpClientTestFramework.getProjects();
            System.out.println("Projects status: " + projectsResponse.getStatusCode());
            System.out.println("Projects body: " + projectsResponse.getBody());
            System.out.println();
            
            // Создаем проект
            String newProject = """
                {
                    "name": "Test Project",
                    "description": "Test Description",
                    "assignee": "test-user"
                }
                """;
                
            var createResponse = HttpClientTestFramework.createProject(newProject);
            System.out.println("Create status: " + createResponse.getStatusCode());
            System.out.println("Create body: " + createResponse.getBody());
            
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}