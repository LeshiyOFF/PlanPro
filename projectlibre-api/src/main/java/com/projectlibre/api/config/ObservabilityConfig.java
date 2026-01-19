package com.projectlibre.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import org.springframework.context.ApplicationListener;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import com.projectlibre.api.observability.ObservabilityManager;

/**
 * Configuration for observability components
 * Registers interceptors and initializes monitoring
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
@Configuration
public class ObservabilityConfig implements WebMvcConfigurer, ApplicationListener<ApplicationReadyEvent> {
    
    @Bean
    public ObservabilityManager observabilityManager() {
        return ObservabilityManager.getInstance();
    }
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Interceptors will be added when ObservabilityInterceptor is implemented
        // registry.addInterceptor(new ObservabilityInterceptor())
        //         .addPathPatterns("/api/**")
        //         .excludePathPatterns("/api/health/**", "/api/metrics");
    }
    
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        // Initialize observability when application starts
        System.out.println("Initializing ProjectLibre API Observability...");
        
        // Record startup metrics
        System.out.println("Observability initialized successfully");
    }
    

}