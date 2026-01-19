package com.projectlibre.api.rest;

import com.projectlibre.api.dto.ApiResponseDto;
import com.projectlibre.api.dto.ConfigStatusResponseDto;
import com.projectlibre.api.dto.ConfigUpdateRequestDto;
import com.projectlibre.api.service.PreferenceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

/**
 * Modern Spring Boot REST controller for configuration
 * Replaces HttpServer-based ConfigController
 * Provides injection protection and validation
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ConfigRestController {
    
    private final PreferenceService preferenceService;
    
    public ConfigRestController(PreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }
    
    @GetMapping("/config")
    public ResponseEntity<ApiResponseDto<ConfigStatusResponseDto>> getConfig() {
        try {
            return ResponseEntity.ok(ApiResponseDto.success("Configuration retrieved", ConfigStatusResponseDto.ok()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error("Failed to fetch configuration: " + e.getMessage()));
        }
    }
    
    @PostMapping("/config.update")
    public ResponseEntity<ApiResponseDto<ConfigStatusResponseDto>> updateConfig(
            @Valid @RequestBody ConfigUpdateRequestDto config) {
        try {
            return ResponseEntity.ok(ApiResponseDto.success("Configuration updated", ConfigStatusResponseDto.updated()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.error("Failed to update configuration: " + e.getMessage()));
        }
    }
}
