package com.projectlibre.api.config;

import com.projectlibre.api.session.GlobalSessionManager;
import com.projectlibre1.session.SessionFactory;
import com.projectlibre1.util.Environment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

/**
 * Component for initializing ProjectLibre Core environment.
 * Ensures GlobalSessionManager is initialized first.
 * 
 * Single Responsibility: Orchestration of Core engine startup.
 * 
 * @author ProjectLibre Team
 * @version 3.0.0
 */
@Component
@DependsOn("globalSessionManager")
public class CoreInitializer {
    
    private final GlobalSessionManager sessionManager;
    private volatile boolean coreInitialized = false;
    
    @Autowired
    public CoreInitializer(GlobalSessionManager sessionManager) {
        this.sessionManager = sessionManager;
    }
    
    @PostConstruct
    public void initialize() {
        if (coreInitialized) {
            System.out.println("[CoreInitializer] Core already initialized, skipping...");
            return;
        }
        
        System.out.println("[CoreInitializer] Starting ProjectLibre Core...");
        
        try {
            // Configure Core environment for standalone operation
            if (!Environment.getStandAlone()) {
                Environment.setStandAlone(true);
                System.out.println("[CoreInitializer] ✓ Configured standalone mode");
            }
            
            // Check if global session is ready
            if (sessionManager.isInitialized()) {
                verifyGlobalSession();
                coreInitialized = true;
                System.out.println("[CoreInitializer] ✅ Core initialization complete");
            } else {
                System.err.println("[CoreInitializer] ❌ SessionManager not initialized!");
            }
        } catch (Exception e) {
            System.err.println("[CoreInitializer] ❌ Initialization failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private void verifyGlobalSession() {
        try {
            SessionFactory factory = SessionFactory.getInstance();
            if (factory.getSession(true) != null) {
                System.out.println("[CoreInitializer] ✓ Global session verified in Core");
            }
        } catch (Exception e) {
            System.err.println("[CoreInitializer] ⚠ Verification failed: " + e.getMessage());
        }
    }
    
    public void reinitialize() {
        System.out.println("[CoreInitializer] Re-initializing...");
        coreInitialized = false;
        sessionManager.reinitialize();
        initialize();
    }
    
    public boolean isCoreInitialized() {
        return coreInitialized && sessionManager.isInitialized();
    }
}
