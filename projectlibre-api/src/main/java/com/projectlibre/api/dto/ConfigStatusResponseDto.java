package com.projectlibre.api.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTO for configuration status responses.
 * Replaces Map<String, Object> with strongly typed POJO.
 * Follows SOLID: Single Responsibility Principle.
 */
public class ConfigStatusResponseDto extends BaseDto {
    
    @NotNull
    private String status;
    
    @NotNull
    private Long timestamp;
    
    public ConfigStatusResponseDto() {
    }
    
    public ConfigStatusResponseDto(String status, Long timestamp) {
        this.status = status;
        this.timestamp = timestamp;
    }
    
    public static ConfigStatusResponseDto ok() {
        return new ConfigStatusResponseDto("ok", System.currentTimeMillis());
    }
    
    public static ConfigStatusResponseDto updated() {
        return new ConfigStatusResponseDto("updated", System.currentTimeMillis());
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Long getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }
}
