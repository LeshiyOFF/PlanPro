package com.projectlibre.api.dto;

import com.projectlibre.api.model.Resource;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Mapper для преобразования Resource между доменной моделью и DTO
 * Реализует паттерн Mapper для чистого разделения слоев
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ResourceDtoMapper {
    
    /**
     * Преобразование Resource в ResourceDto
     */
    public static ResourceDto toDto(Resource resource) {
        if (resource == null) {
            return null;
        }
        
        ResourceDto dto = new ResourceDto();
        dto.setId(resource.getId());
        dto.setName(resource.getName());
        dto.setType(resource.getType());
        dto.setDescription(resource.getDescription());
        dto.setStatus(resource.getStatus());
        dto.setEmail(resource.getEmail());
        dto.setDepartment(resource.getDepartment());
        dto.setLocation(resource.getLocation());
        dto.setCostPerHour(resource.getHourlyRate());
        dto.setAvailable("AVAILABLE".equals(resource.getAvailability()));
        dto.setSkillIds(resource.getSkills());
        
        if (resource.getProjectIds() != null) {
            dto.setProjectIds(resource.getProjectIds().stream()
                    .map(String::valueOf)
                    .collect(Collectors.toList()));
        }
        
        dto.setNotes(resource.getRole());
        dto.setCreatedAt(resource.getCreatedAt());
        dto.setUpdatedAt(resource.getUpdatedAt());
        
        return dto;
    }
    
    /**
     * Преобразование ResourceDto в Resource
     */
    public static Resource fromDto(ResourceDto dto) {
        if (dto == null) {
            return null;
        }
        
        Resource resource = new Resource();
        resource.setId(dto.getId());
        resource.setName(dto.getName());
        resource.setType(dto.getType());
        resource.setDescription(dto.getDescription());
        resource.setStatus(dto.getStatus());
        resource.setEmail(dto.getEmail());
        resource.setDepartment(dto.getDepartment());
        resource.setLocation(dto.getLocation());
        resource.setHourlyRate(dto.getCostPerHour());
        resource.setAvailability(dto.getAvailable() != null && dto.getAvailable() ? "AVAILABLE" : "UNAVAILABLE");
        resource.setSkills(dto.getSkillIds());
        
        if (dto.getProjectIds() != null) {
            List<Long> projectIds = dto.getProjectIds().stream()
                    .map(id -> {
                        try {
                            return Long.valueOf(id);
                        } catch (NumberFormatException e) {
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            resource.setProjectIds(projectIds);
        }
        
        resource.setRole(dto.getNotes());
        resource.setCreatedAt(dto.getCreatedAt());
        resource.setUpdatedAt(dto.getUpdatedAt());
        
        return resource;
    }
    
    /**
     * Преобразование списка Resource в список ResourceDto
     */
    public static List<ResourceDto> toDtoList(List<Resource> resources) {
        if (resources == null) {
            return List.of();
        }
        
        return resources.stream()
                .map(ResourceDtoMapper::toDto)
                .collect(Collectors.toList());
    }
}