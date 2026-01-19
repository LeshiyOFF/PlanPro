package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for resource update requests.
 * Synchronized with TypeScript ResourceUpdateRequest interface.
 * Does not extend BaseDto as it represents input data without server-generated id.
 * Follows SOLID: Single Responsibility Principle.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResourceUpdateRequestDto {
    
    @NotNull(message = "Resource ID is required")
    private String id;
    
    private String name;
    private Double maxUnits;
    private Double standardRate;
    private Double overtimeRate;
    
    public ResourceUpdateRequestDto() {
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Double getMaxUnits() {
        return maxUnits;
    }
    
    public void setMaxUnits(Double maxUnits) {
        this.maxUnits = maxUnits;
    }
    
    public Double getStandardRate() {
        return standardRate;
    }
    
    public void setStandardRate(Double standardRate) {
        this.standardRate = standardRate;
    }
    
    public Double getOvertimeRate() {
        return overtimeRate;
    }
    
    public void setOvertimeRate(Double overtimeRate) {
        this.overtimeRate = overtimeRate;
    }
}
