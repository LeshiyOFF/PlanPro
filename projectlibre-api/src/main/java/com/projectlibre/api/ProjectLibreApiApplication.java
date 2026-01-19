package com.projectlibre.api;

import com.projectlibre.api.service.ProjectPreferencesManager;
import com.projectlibre.api.service.ProjectService;
import com.projectlibre.api.service.TaskService;
import com.projectlibre.api.service.ResourceService;
import com.projectlibre.api.service.PreferenceService;
import com.projectlibre.api.ui.ApiUIServiceHandler;
import com.projectlibre1.ui.UIServiceAdapter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import javax.annotation.PostConstruct;

/**
 * Modern Spring Boot application for ProjectLibre REST API
 * Replaces HttpServer-based architecture with Spring Boot
 * Provides injection protection, validation, and better manageability
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.projectlibre.api")
public class ProjectLibreApiApplication {
    
    /**
     * Main application entry point
     */
    public static void main(String[] args) {
        System.out.println("🚀 Starting ProjectLibre API with Spring Boot...");
        SpringApplication.run(ProjectLibreApiApplication.class, args);
    }
    
    /**
     * Post-construct initialization
     */
    @PostConstruct
    public void initialize() {
        System.out.println("✅ ProjectLibre API Application initialized");
        System.out.println("📡 All REST endpoints registered via Spring Boot");
        
        initializeUIServiceAdapter();
        ProjectPreferencesManager.getInstance().initialize();
    }
    
    /**
     * Initialize UI service adapter
     */
    private void initializeUIServiceAdapter() {
        ApiUIServiceHandler apiHandler = ApiUIServiceHandler.getInstance();
        UIServiceAdapter.getInstance().setDelegate(apiHandler);
        System.out.println("✅ UIServiceAdapter initialized with API delegate");
    }
    
    /**
     * Project Service bean
     */
    @Bean
    public ProjectService projectService() {
        return new ProjectService();
    }
    
    /**
     * Task Service bean
     */
    @Bean
    public TaskService taskService() {
        return new TaskService();
    }
    
    /**
     * Resource Service bean
     */
    @Bean
    public ResourceService resourceService() {
        return new ResourceService();
    }
    
    /**
     * Preference Service bean
     */
    @Bean
    public PreferenceService preferenceService() {
        return PreferenceService.getInstance();
    }
}