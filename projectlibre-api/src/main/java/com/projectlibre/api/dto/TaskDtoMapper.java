package com.projectlibre.api.dto;

import com.projectlibre.api.model.Task;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Mapper для преобразования Task между доменной моделью и DTO
 * Реализует паттерн Mapper для чистого разделения слоев
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class TaskDtoMapper {
    
    /**
     * Преобразование Task в TaskDto
     */
    public static TaskDto toDto(Task task) {
        if (task == null) {
            return null;
        }
        
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setName(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setStartDate(task.getStartDate());
        dto.setDueDate(task.getDueDate());
        dto.setProjectId(task.getProjectId() != null ? task.getProjectId().toString() : null);
        dto.setAssigneeId(task.getAssigneeId() != null ? task.getAssigneeId().toString() : null);
        dto.setEstimatedHours(task.getEstimatedHours() != null ? task.getEstimatedHours().intValue() : null);
        dto.setActualHours(task.getActualHours() != null ? task.getActualHours().intValue() : null);
        dto.setTags(task.getTags() != null ? String.join(",", task.getTags()) : null);
        dto.setType(task.getType());
        dto.setProgress(task.getProgress());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        
        return dto;
    }
    
    /**
     * Преобразование TaskDto в Task
     */
    public static Task fromDto(TaskDto dto) {
        if (dto == null) {
            return null;
        }
        
        Task task = new Task();
        task.setId(dto.getId());
        task.setTitle(dto.getName());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus());
        task.setPriority(dto.getPriority());
        task.setStartDate(dto.getStartDate());
        task.setDueDate(dto.getDueDate());
        
        if (dto.getProjectId() != null) {
            try {
                task.setProjectId(Long.valueOf(dto.getProjectId()));
            } catch (NumberFormatException e) {
                task.setProjectId(null);
            }
        }
        
        if (dto.getAssigneeId() != null) {
            try {
                task.setAssigneeId(Long.valueOf(dto.getAssigneeId()));
            } catch (NumberFormatException e) {
                task.setAssigneeId(null);
            }
        }
        
        if (dto.getEstimatedHours() != null) {
            task.setEstimatedHours(dto.getEstimatedHours().doubleValue());
        }
        
        if (dto.getActualHours() != null) {
            task.setActualHours(dto.getActualHours().doubleValue());
        }
        
        if (dto.getTags() != null && !dto.getTags().isEmpty()) {
            task.setTags(List.of(dto.getTags().split(",")));
        }
        
        task.setType(dto.getType());
        task.setProgress(dto.getProgress());
        task.setCreatedAt(dto.getCreatedAt());
        task.setUpdatedAt(dto.getUpdatedAt());
        
        return task;
    }
    
    /**
     * Преобразование списка Task в список TaskDto
     */
    public static List<TaskDto> toDtoList(List<Task> tasks) {
        if (tasks == null) {
            return List.of();
        }
        
        return tasks.stream()
                .map(TaskDtoMapper::toDto)
                .collect(Collectors.toList());
    }
}