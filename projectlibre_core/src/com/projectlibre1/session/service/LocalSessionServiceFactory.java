package com.projectlibre1.session.service;

import com.projectlibre1.session.LocalSession;
import com.projectlibre1.session.SessionFactory;

/**
 * Factory for creating service wrappers over LocalSession
 * Implements Factory pattern for creating service instances
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class LocalSessionServiceFactory {
    
    /**
     * Private constructor to prevent instantiation
     */
    private LocalSessionServiceFactory() {
        throw new UnsupportedOperationException("Factory class cannot be instantiated");
    }
    
    /**
     * Create service wrapper over local session
     * 
     * @return service wrapper over LocalSession
     */
    public static LocalSessionServiceInterface createLocalSessionService() {
        LocalSession localSession = SessionFactory.getInstance().getLocalSession();
        return new LocalSessionService(localSession);
    }
    
    /**
     * Create service wrapper over specified local session
     * 
     * @param localSession specific local session
     * @return service wrapper over specified session
     */
    public static LocalSessionServiceInterface createLocalSessionService(LocalSession localSession) {
        return new LocalSessionService(localSession);
    }
}