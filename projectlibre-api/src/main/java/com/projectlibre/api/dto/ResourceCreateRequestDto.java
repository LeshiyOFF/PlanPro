package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for resource creation requests.
 * Synchronized with TypeScript ResourceCreateRequest interface.
 * Does not extend BaseDto as it represents input data without server-generated id.
 * Follows SOLID: Single Responsibility Principle.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResourceCreateRequestDto {
    
    @NotBlank(message = "Resource name is required")
    private String name;
    
    @NotNull(message = "Resource type is required")
    private String type;
    
    private Double maxUnits;
    private Double standardRate;
    private Double overtimeRate;
    
    public ResourceCreateRequestDto() {
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
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
