package com.projectlibre.api.service;

import com.projectlibre.api.model.Resource;
import com.projectlibre.api.repository.ResourceRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Сервис для запросов и фильтрации ресурсов
 * Использует репозиторий для потокобезопасного доступа
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
public class ResourceQueryService {
    
    private final ResourceRepository repository;

    public ResourceQueryService(ResourceRepository repository) {
        this.repository = repository;
    }

    public List<Resource> getAllResources() {
        return repository.findAll();
    }

    public Optional<Resource> getResourceById(Long id) {
        return repository.findById(id);
    }

    public List<Resource> getResourcesByType(String type) {
        return repository.findByType(type);
    }

    public List<Resource> getResourcesByStatus(String status) {
        return repository.findByStatus(status);
    }

    public List<Resource> getResourcesByDepartment(String department) {
        return repository.findAll().stream()
            .filter(r -> department.equals(r.getDepartment()))
            .collect(Collectors.toList());
    }

    public List<Resource> getActiveResources() {
        return repository.findAll().stream()
            .filter(Resource::isActive)
            .collect(Collectors.toList());
    }

    public List<Resource> getAvailableResources() {
        return repository.findAvailableResources();
    }

    public List<Resource> getResourcesByProject(Long projectId) {
        return repository.findByProjectId(projectId);
    }

    public List<Resource> getResourcesBySkill(String skill) {
        return repository.findAll().stream()
            .filter(r -> r.getSkills().contains(skill))
            .collect(Collectors.toList());
    }

    public List<Resource> getHumanResources() {
        return repository.findByType("HUMAN");
    }

    public List<Resource> getMaterialResources() {
        return repository.findByType("MATERIAL");
    }

    public List<Resource> getFinancialResources() {
        return repository.findByType("FINANCIAL");
    }

    public List<Resource> searchResources(String query) {
        String lowerQuery = query.toLowerCase();
        return repository.findAll().stream()
            .filter(r -> matchesQuery(r, lowerQuery))
            .collect(Collectors.toList());
    }

    public List<Resource> getOverloadedResources(Double threshold) {
        return repository.findAll().stream()
            .filter(r -> r.getCurrentLoad() > threshold)
            .collect(Collectors.toList());
    }

    public List<Resource> getUnderutilizedResources(Double threshold) {
        return repository.findAll().stream()
            .filter(r -> r.getCurrentLoad() < threshold)
            .filter(Resource::isAvailable)
            .collect(Collectors.toList());
    }

    public int getResourceCount() {
        return (int) repository.count();
    }

    private boolean matchesQuery(Resource resource, String query) {
        return (resource.getName() != null && resource.getName().toLowerCase().contains(query)) ||
               (resource.getEmail() != null && resource.getEmail().toLowerCase().contains(query)) ||
               (resource.getRole() != null && resource.getRole().toLowerCase().contains(query));
    }
}
