package com.projectlibre.api.service;

import com.projectlibre.api.model.Resource;
import com.projectlibre.api.repository.ResourceRepository;

/**
 * Сервис для управления операциями с ресурсами
 * Использует репозиторий для потокобезопасного доступа
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
public class ResourceManagementService {
    
    private final ResourceRepository repository;

    public ResourceManagementService(ResourceRepository repository) {
        this.repository = repository;
    }

    public boolean addProjectToResource(Long resourceId, Long projectId) {
        return repository.findById(resourceId).map(resource -> {
            resource.addProject(projectId);
            repository.save(resource);
            return true;
        }).orElse(false);
    }

    public boolean removeProjectFromResource(Long resourceId, Long projectId) {
        return repository.findById(resourceId).map(resource -> {
            resource.removeProject(projectId);
            repository.save(resource);
            return true;
        }).orElse(false);
    }

    public boolean addSkillToResource(Long resourceId, String skill) {
        return repository.findById(resourceId).map(resource -> {
            resource.addSkill(skill);
            repository.save(resource);
            return true;
        }).orElse(false);
    }

    public boolean removeSkillFromResource(Long resourceId, String skill) {
        return repository.findById(resourceId).map(resource -> {
            resource.removeSkill(skill);
            repository.save(resource);
            return true;
        }).orElse(false);
    }

    public boolean changeResourceStatus(Long id, String newStatus) {
        return repository.findById(id).map(resource -> {
            resource.setStatus(newStatus);
            repository.save(resource);
            return true;
        }).orElse(false);
    }

    public boolean changeResourceAvailability(Long id, String newAvailability) {
        return repository.findById(id).map(resource -> {
            resource.setAvailability(newAvailability);
            repository.save(resource);
            return true;
        }).orElse(false);
    }
}
