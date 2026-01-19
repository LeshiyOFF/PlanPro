package com.projectlibre.api.rest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

/**
 * Modern Spring Boot REST controller for UI operations
 * Replaces HttpServer-based UIController
 * Handles file dialogs and notifications
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UIRestController {
    
    @PostMapping("/file/choose")
    public ResponseEntity<Map<String, Object>> chooseFile(@RequestBody Map<String, Object> request) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("path", request.getOrDefault("initialPath", ""));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @PostMapping("/ui/notify")
    public ResponseEntity<Map<String, Object>> notify(
            @RequestParam String level,
            @RequestParam String message) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "sent");
            response.put("level", level);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
