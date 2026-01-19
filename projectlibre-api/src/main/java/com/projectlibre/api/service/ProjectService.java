package com.projectlibre.api.service;

import com.projectlibre.api.model.Project;
import com.projectlibre.api.repository.ProjectRepository;
import com.projectlibre.api.adapter.ThreadSafeProjectAdapter;
import java.util.List;
import java.util.Map;

/**
 * Сервис для управления проектами
 * Реализует бизнес-логику CRUD операций с проектами
 * Использует ThreadSafe репозиторий для потокобезопасного доступа
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
public class ProjectService {
    
    private final ProjectRepository repository;

    public ProjectService() {
        this.repository = ThreadSafeProjectAdapter.getInstance();
    }

    public ProjectService(ProjectRepository repository) {
        this.repository = repository;
    }

    public List<Project> getAllProjects() {
        return repository.findAll();
    }

    public Project getProjectById(Long id) {
        if (id == null) {
            return null;
        }
        return repository.findById(id).orElse(null);
    }

    public Project createProject(Project project) {
        validateProjectForCreation(project);
        project.setStatus("CREATED");
        return repository.save(project);
    }

    public Project updateProject(Project project) {
        validateProjectForUpdate(project);
        Project existing = repository.findById(project.getId())
            .orElseThrow(() -> new IllegalArgumentException(
                "Project not found with ID: " + project.getId()));
        
        updateProjectFields(existing, project);
        return repository.save(existing);
    }

    public Project deleteProject(Long id) {
        if (id == null) {
            return null;
        }
        Project existing = repository.findById(id).orElse(null);
        if (existing != null) {
            existing.setStatus("DELETED");
            repository.deleteById(id);
        }
        return existing;
    }

    public Project recalculateProject(Long id) {
        return repository.recalculate(id);
    }

    public Map<String, Object> getProjectStatistics() {
        List<Project> all = repository.findAll();
        long total = all.size();
        long active = all.stream().filter(Project::isActive).count();
        long completed = repository.findByStatus("COMPLETED").size();
        
        return Map.of(
            "totalProjects", total,
            "activeProjects", active,
            "completedProjects", completed,
            "completionRate", total > 0 ? (double) completed / total * 100 : 0
        );
    }

    private void validateProjectForCreation(Project project) {
        if (project == null) {
            throw new IllegalArgumentException("Project cannot be null");
        }
        if (project.getName() == null || project.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Project name cannot be null or empty");
        }
    }

    private void validateProjectForUpdate(Project project) {
        if (project == null || project.getId() == null) {
            throw new IllegalArgumentException("Project and ID cannot be null");
        }
    }

    private void updateProjectFields(Project existing, Project update) {
        if (update.getName() != null) {
            existing.setName(update.getName());
        }
        if (update.getDescription() != null) {
            existing.setDescription(update.getDescription());
        }
        if (update.getStatus() != null) {
            existing.setStatus(update.getStatus());
        }
        if (update.getPriority() != null) {
            existing.setPriority(update.getPriority());
        }
        if (update.getOwner() != null) {
            existing.setOwner(update.getOwner());
        }
    }
}
