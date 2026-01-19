package com.projectlibre.api.config;

import com.projectlibre.api.session.GlobalSessionManager;
import com.projectlibre1.session.Session;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;

/**
 * Spring Configuration for providing Core Session as a Bean.
 * Ensures GlobalSessionManager is fully initialized before providing Session.
 * 
 * Single Responsibility: Session Bean provisioning for DI.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
@Configuration
@DependsOn("globalSessionManager")
public class SessionConfiguration {
    
    private final GlobalSessionManager sessionManager;
    
    public SessionConfiguration(GlobalSessionManager sessionManager) {
        this.sessionManager = sessionManager;
    }
    
    /**
     * Provides the global Session as a Spring Bean.
     * Enables dependency injection of Session into services and adapters.
     * 
     * @return the initialized global Session instance
     * @throws IllegalStateException if session not initialized
     */
    @Bean
    public Session session() {
        if (!sessionManager.isInitialized()) {
            throw new IllegalStateException(
                "GlobalSessionManager not initialized. Check initialization order."
            );
        }
        
        Session session = sessionManager.getSession();
        System.out.println("[SessionConfiguration] ✓ Providing Session bean (ID: " + 
                         session.getId() + ") to Spring context");
        return session;
    }
}
