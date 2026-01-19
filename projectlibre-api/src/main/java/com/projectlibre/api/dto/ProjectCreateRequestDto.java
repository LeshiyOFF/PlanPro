package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

/**
 * DTO for project creation requests.
 * Synchronized with TypeScript ProjectCreateRequest interface.
 * Does not extend BaseDto as it represents input data without server-generated id.
 * Follows SOLID: Single Responsibility Principle.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProjectCreateRequestDto {
    
    @NotBlank(message = "Project name is required")
    private String name;
    
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    public ProjectCreateRequestDto() {
    }
    
    public ProjectCreateRequestDto(String name, String description) {
        this.name = name;
        this.description = description;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public LocalDateTime getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }
    
    public LocalDateTime getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }
}
