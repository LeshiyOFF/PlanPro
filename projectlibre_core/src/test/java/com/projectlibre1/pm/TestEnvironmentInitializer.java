/*******************************************************************************
 * Test Environment Initializer
 * Sets up ProjectLibre Core for INTEGRATION testing
 * 
 * NOTE: Most tests should be ISOLATED and not require this initialization.
 * Use this only for tests that need the full ProjectLibre environment.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 *******************************************************************************/
package com.projectlibre1.pm;

import java.util.Locale;

/**
 * Initializes ProjectLibre environment for integration testing.
 * 
 * IMPORTANT: This initialization is OPTIONAL for isolated unit tests.
 * Most tests in this project are designed to work WITHOUT this initialization.
 * 
 * Use this class only when testing components that REQUIRE:
 * - SessionFactory
 * - CalendarService
 * - Messages (localization)
 * - Full Project/Task lifecycle
 */
public final class TestEnvironmentInitializer {
    
    private static volatile boolean initialized = false;
    private static volatile boolean initializationAttempted = false;
    private static volatile Throwable initializationError = null;
    
    private TestEnvironmentInitializer() {
        // Utility class - prevent instantiation
    }
    
    /**
     * Initialize ProjectLibre test environment.
     * 
     * This method attempts to initialize the full ProjectLibre environment.
     * If initialization fails, subsequent calls will return immediately
     * without re-attempting initialization.
     * 
     * @return true if environment is initialized, false otherwise
     */
    public static synchronized boolean initializeEnvironment() {
        if (initialized) {
            return true;
        }
        
        if (initializationAttempted) {
            // Already tried and failed - don't retry
            return false;
        }
        
        initializationAttempted = true;
        
        try {
            // Set headless mode before any UI-related code
            System.setProperty("java.awt.headless", "true");
            
            // Set locale to English to avoid missing resource bundle errors
            Locale.setDefault(Locale.ENGLISH);
            
            // Try to initialize UI adapter (may fail if classes not found)
            tryInitializeUIAdapter();
            
            // Try to initialize session (may fail if classes not found)
            tryInitializeSession();
            
            initialized = true;
            System.out.println("[TestEnvironmentInitializer] Environment initialized successfully");
            return true;
            
        } catch (Throwable e) {
            initializationError = e;
            System.err.println("[TestEnvironmentInitializer] Failed to initialize: " + e.getMessage());
            System.err.println("[TestEnvironmentInitializer] Running in degraded mode - only isolated tests will work");
            return false;
        }
    }
    
    private static void tryInitializeUIAdapter() throws Exception {
        try {
            Class<?> uiAdapterClass = Class.forName("com.projectlibre1.ui.UIAdapterFactory");
            Object factory = uiAdapterClass.getMethod("getInstance").invoke(null);
            uiAdapterClass.getMethod("setHeadless", boolean.class).invoke(factory, true);
        } catch (ClassNotFoundException e) {
            System.out.println("[TestEnvironmentInitializer] UIAdapterFactory not found - skipping");
        }
    }
    
    private static void tryInitializeSession() throws Exception {
        try {
            Class<?> sessionFactoryClass = Class.forName("com.projectlibre1.session.SessionFactory");
            Object factory = sessionFactoryClass.getMethod("getInstance").invoke(null);
            sessionFactoryClass.getMethod("getLocalSession").invoke(factory);
        } catch (ClassNotFoundException e) {
            System.out.println("[TestEnvironmentInitializer] SessionFactory not found - skipping");
        }
    }
    
    /**
     * Check if environment is initialized
     */
    public static boolean isInitialized() {
        return initialized;
    }
    
    /**
     * Check if initialization was attempted
     */
    public static boolean wasInitializationAttempted() {
        return initializationAttempted;
    }
    
    /**
     * Get initialization error (if any)
     */
    public static Throwable getInitializationError() {
        return initializationError;
    }
    
    /**
     * Reset initialization state (for testing purposes only)
     */
    public static synchronized void reset() {
        initialized = false;
        initializationAttempted = false;
        initializationError = null;
    }
}
