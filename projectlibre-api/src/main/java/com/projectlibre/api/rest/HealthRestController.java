package com.projectlibre.api.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

/**
 * Modern Spring Boot REST controller for health checks
 * Replaces HttpServer-based HealthHandler
 * Provides simple health status endpoint
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HealthRestController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("unified", true);
        response.put("timestamp", System.currentTimeMillis());
        response.put("framework", "Spring Boot");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/calendar")
    public ResponseEntity<Map<String, Object>> calendar() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("module", "calendar");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/report")
    public ResponseEntity<Map<String, Object>> report() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("module", "report");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
