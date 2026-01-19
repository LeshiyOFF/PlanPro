package com.projectlibre.api.adapter;

import com.projectlibre.api.model.Project;
import com.projectlibre1.pm.task.ProjectFactory;
import com.projectlibre1.session.Session;
import com.projectlibre1.session.SessionFactory;

import java.util.Date;
import java.time.ZoneId;
import java.util.Objects;
import java.util.Map;

/**
 * Factory for creating Core projects from API DTOs.
 * Single Responsibility: API Project -> Core Project conversion.
 * Requires explicit Session for thread safety.
 * 
 * @author ProjectLibre Team
 * @version 3.0.0
 */
public class CoreProjectFactory {
    
    private static volatile CoreProjectFactory instance;
    private static final Object LOCK = new Object();
    
    private CoreProjectFactory() {
    }
    
    public static CoreProjectFactory getInstance() {
        CoreProjectFactory result = instance;
        if (result == null) {
            synchronized (LOCK) {
                result = instance;
                if (result == null) {
                    instance = result = new CoreProjectFactory();
                }
            }
        }
        return result;
    }
    
    public com.projectlibre1.pm.task.Project createCoreProject(Project apiProject, Session session) {
        Objects.requireNonNull(apiProject, "API Project cannot be null");
        Objects.requireNonNull(session, "Session cannot be null");
        
        if (!session.isInitialized()) {
            throw new IllegalStateException("Session not initialized");
        }
        
        System.out.println("[CoreProjectFactory] Creating Core project: " + apiProject.getName());
        
        try {
            synchronizeSessionFactory(session);
            
            ProjectFactory factory = ProjectFactory.getInstance();
            if (factory == null) {
                throw new IllegalStateException("ProjectFactory not available");
            }
            
            com.projectlibre1.pm.task.Project coreProject = factory.createProject();
            if (coreProject == null) {
                throw new IllegalStateException("ProjectFactory returned null");
            }
            
            if (apiProject.getName() != null && !apiProject.getName().isEmpty()) {
                coreProject.setName(apiProject.getName());
            }
            
            if (apiProject.getId() != null) {
                coreProject.setUniqueId(apiProject.getId());
            }
            
            setProjectStartDate(coreProject, apiProject);
            validateCreatedProject(coreProject);
            
            System.out.println("[CoreProjectFactory] ✅ Created: " + coreProject.getName());
            return coreProject;
            
        } catch (Exception e) {
            System.err.println("[CoreProjectFactory] ❌ " + e.getMessage());
            throw new RuntimeException("Failed to create Core project: " + e.getMessage(), e);
        }
    }
    
    public void updateCoreProject(com.projectlibre1.pm.task.Project coreProject, 
                                   Project apiProject, Session session) {
        Objects.requireNonNull(coreProject, "Core Project cannot be null");
        Objects.requireNonNull(apiProject, "API Project cannot be null");
        Objects.requireNonNull(session, "Session cannot be null");
        
        try {
            synchronizeSessionFactory(session);
            if (apiProject.getName() != null) {
                coreProject.setName(apiProject.getName());
            }
            setProjectStartDate(coreProject, apiProject);
            System.out.println("[CoreProjectFactory] ✓ Updated");
        } catch (Exception e) {
            System.err.println("[CoreProjectFactory] ❌ Update failed: " + e.getMessage());
            throw new RuntimeException("Failed to update Core project", e);
        }
    }
    
    private void synchronizeSessionFactory(Session session) throws Exception {
        SessionFactory factory = SessionFactory.getInstance();
        Session current = factory.getSession(true);
        
        if (current == null || current != session) {
            injectSession(factory, session);
        }
    }

    private void injectSession(SessionFactory factory, Session session) throws Exception {
        java.lang.reflect.Field field = SessionFactory.class.getDeclaredField("sessionImpls");
        field.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, Session> map = (Map<String, Session>) field.get(factory);
        if (map == null) {
            map = java.util.Collections.synchronizedMap(new java.util.HashMap<>());
            field.set(factory, map);
        }
        map.put("local", session);
    }
    
    private void setProjectStartDate(com.projectlibre1.pm.task.Project coreProject, Project apiProject) {
        if (apiProject.getStartDate() != null) {
            Date startDate = Date.from(apiProject.getStartDate()
                .atZone(ZoneId.systemDefault()).toInstant());
            coreProject.setStart(startDate.getTime());
        } else {
            coreProject.setStart(System.currentTimeMillis());
        }
    }
    
    private void validateCreatedProject(com.projectlibre1.pm.task.Project coreProject) {
        if (coreProject.getUniqueId() == 0) {
            System.err.println("[CoreProjectFactory] ⚠ Warning: ID=0");
        }
    }
}
