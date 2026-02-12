package com.projectlibre.api.dto;

import com.projectlibre.api.model.Project;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Mapper для преобразования Project между доменной моделью и DTO
 * Реализует паттерн Mapper для чистого разделения слоев
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ProjectDtoMapper {
    
    /**
     * Преобразование Project в ProjectDto
     */
    public static ProjectDto toDto(Project project) {
        if (project == null) {
            return null;
        }
        
        ProjectDto dto = new ProjectDto();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setStatus(project.getStatus());
        dto.setPriority(project.getPriority());
        dto.setProgress(project.getProgress());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setImposedFinishDate(project.getImposedFinishDate()); // VB.1: Маппинг imposed finish date
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());
        
        if (project.getResources() != null) {
            dto.setResourceIds(project.getResources());
        }
        
        return dto;
    }
    
    /**
     * Преобразование ProjectDto в Project
     */
    public static Project fromDto(ProjectDto dto) {
        if (dto == null) {
            return null;
        }
        
        Project project = new Project();
        project.setId(dto.getId());
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setStatus(dto.getStatus());
        project.setPriority(dto.getPriority());
        project.setProgress(dto.getProgress());
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());
        project.setImposedFinishDate(dto.getImposedFinishDate()); // VB.1: Маппинг imposed finish date
        project.setCreatedAt(dto.getCreatedAt());
        project.setUpdatedAt(dto.getUpdatedAt());
        
        if (dto.getResourceIds() != null) {
            project.setResources(dto.getResourceIds());
        }
        
        return project;
    }
    
    /**
     * Преобразование списка Project в список ProjectDto
     */
    public static List<ProjectDto> toDtoList(List<Project> projects) {
        if (projects == null) {
            return List.of();
        }
        
        return projects.stream()
                .map(ProjectDtoMapper::toDto)
                .collect(Collectors.toList());
    }
}