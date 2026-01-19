package com.projectlibre.api.rest;

import com.projectlibre.api.dto.ApiResponseDto;
import com.projectlibre.api.model.Resource;
import com.projectlibre.api.service.ResourceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

/**
 * Modern Spring Boot REST controller for resources
 * Replaces HttpServer-based ResourceController
 * Provides injection protection and validation
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ResourceRestController {
    
    private final ResourceService resourceService;
    
    public ResourceRestController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }
    
    @GetMapping("/resources")
    public ResponseEntity<ApiResponseDto<List<Resource>>> getAllResources(@RequestParam(required = false) Long projectId) {
        try {
            List<Resource> resources = resourceService.getAllResources();
            return ResponseEntity.ok(ApiResponseDto.success("Resources retrieved successfully", resources));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error("Failed to fetch resources: " + e.getMessage()));
        }
    }
    
    @GetMapping("/resource/{id}")
    public ResponseEntity<ApiResponseDto<Resource>> getResource(@PathVariable Long id) {
        try {
            Optional<Resource> resource = resourceService.getResourceById(id);
            return resource.map(r -> ResponseEntity.ok(ApiResponseDto.success("Resource retrieved successfully", r)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponseDto.error("Resource not found: " + id)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error("Failed to fetch resource: " + e.getMessage()));
        }
    }
    
    @PostMapping("/resource")
    public ResponseEntity<ApiResponseDto<Resource>> createResource(@Valid @RequestBody Resource resource) {
        try {
            Resource created = resourceService.createResource(resource);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDto.success("Resource created successfully", created));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.error("Failed to create resource: " + e.getMessage()));
        }
    }
    
    @PutMapping("/resource/{id}")
    public ResponseEntity<ApiResponseDto<Resource>> updateResource(@PathVariable Long id, @Valid @RequestBody Resource resource) {
        try {
            resource.setId(id);
            resourceService.updateResource(id, resource);
            return ResponseEntity.ok(ApiResponseDto.success("Resource updated successfully", resource));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.error("Failed to update resource: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/resource/{id}")
    public ResponseEntity<ApiResponseDto<Void>> deleteResource(@PathVariable Long id) {
        try {
            resourceService.deleteResource(id);
            return ResponseEntity.ok(ApiResponseDto.success("Resource deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error("Failed to delete resource: " + e.getMessage()));
        }
    }
}
