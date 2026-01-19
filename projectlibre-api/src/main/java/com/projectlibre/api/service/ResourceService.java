package com.projectlibre.api.service;

import com.projectlibre.api.model.Resource;
import com.projectlibre.api.repository.ResourceRepository;
import com.projectlibre.api.adapter.ThreadSafeResourceAdapter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

/**
 * Сервис для управления ресурсами
 * Использует ThreadSafe репозиторий для потокобезопасного доступа
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
public class ResourceService {
    
    private final ResourceRepository repository;
    private final ResourceQueryService queryService;
    private final ResourceManagementService managementService;

    public ResourceService() {
        this.repository = ThreadSafeResourceAdapter.getInstance();
        this.queryService = new ResourceQueryService(repository);
        this.managementService = new ResourceManagementService(repository);
    }

    public ResourceService(ResourceRepository repository) {
        this.repository = repository;
        this.queryService = new ResourceQueryService(repository);
        this.managementService = new ResourceManagementService(repository);
    }

    public List<Resource> getAllResources() {
        return queryService.getAllResources();
    }

    public Optional<Resource> getResourceById(Long id) {
        return queryService.getResourceById(id);
    }

    public Resource createResource(Resource resource) {
        if (resource == null) {
            throw new IllegalArgumentException("Resource cannot be null");
        }
        resource.setCreatedAt(LocalDateTime.now());
        resource.setUpdatedAt(LocalDateTime.now());
        return repository.save(resource);
    }

    public Optional<Resource> updateResource(Long id, Resource updatedResource) {
        if (updatedResource == null) {
            throw new IllegalArgumentException("Updated resource cannot be null");
        }
        return repository.findById(id).map(existing -> {
            updatedResource.setId(id);
            updatedResource.setCreatedAt(existing.getCreatedAt());
            updatedResource.setUpdatedAt(LocalDateTime.now());
            return repository.save(updatedResource);
        });
    }

    public boolean deleteResource(Long id) {
        return repository.deleteById(id);
    }

    public List<Resource> getResourcesByType(String type) {
        return queryService.getResourcesByType(type);
    }

    public List<Resource> getResourcesByStatus(String status) {
        return queryService.getResourcesByStatus(status);
    }

    public List<Resource> getResourcesByDepartment(String department) {
        return queryService.getResourcesByDepartment(department);
    }

    public List<Resource> getActiveResources() {
        return queryService.getActiveResources();
    }

    public List<Resource> getAvailableResources() {
        return queryService.getAvailableResources();
    }

    public List<Resource> getResourcesByProject(Long projectId) {
        return queryService.getResourcesByProject(projectId);
    }

    public List<Resource> getResourcesBySkill(String skill) {
        return queryService.getResourcesBySkill(skill);
    }

    public List<Resource> getHumanResources() {
        return queryService.getHumanResources();
    }

    public List<Resource> getMaterialResources() {
        return queryService.getMaterialResources();
    }

    public List<Resource> getFinancialResources() {
        return queryService.getFinancialResources();
    }

    public List<Resource> searchResources(String query) {
        return queryService.searchResources(query);
    }

    public boolean addProjectToResource(Long resourceId, Long projectId) {
        return managementService.addProjectToResource(resourceId, projectId);
    }

    public boolean removeProjectFromResource(Long resourceId, Long projectId) {
        return managementService.removeProjectFromResource(resourceId, projectId);
    }

    public boolean addSkillToResource(Long resourceId, String skill) {
        return managementService.addSkillToResource(resourceId, skill);
    }

    public boolean removeSkillFromResource(Long resourceId, String skill) {
        return managementService.removeSkillFromResource(resourceId, skill);
    }

    public boolean changeResourceStatus(Long id, String newStatus) {
        return managementService.changeResourceStatus(id, newStatus);
    }

    public boolean changeResourceAvailability(Long id, String newAvailability) {
        return managementService.changeResourceAvailability(id, newAvailability);
    }

    public Map<String, Integer> getResourceStatistics() {
        Map<String, Integer> stats = new HashMap<>();
        stats.put("total", queryService.getResourceCount());
        stats.put("active", queryService.getActiveResources().size());
        stats.put("available", queryService.getAvailableResources().size());
        stats.put("human", queryService.getHumanResources().size());
        stats.put("material", queryService.getMaterialResources().size());
        stats.put("financial", queryService.getFinancialResources().size());
        return stats;
    }

    public List<Resource> getOverloadedResources(Double threshold) {
        return queryService.getOverloadedResources(threshold);
    }

    public List<Resource> getUnderutilizedResources(Double threshold) {
        return queryService.getUnderutilizedResources(threshold);
    }

    public int getResourceCount() {
        return queryService.getResourceCount();
    }

    public void clearAllResources() {
        repository.findAll().forEach(r -> repository.deleteById(r.getId()));
    }
}
