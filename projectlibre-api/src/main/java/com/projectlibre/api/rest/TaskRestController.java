package com.projectlibre.api.rest;

import com.projectlibre.api.dto.ApiResponseDto;
import com.projectlibre.api.model.Task;
import com.projectlibre.api.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

/**
 * Modern Spring Boot REST controller for tasks
 * Replaces HttpServer-based TaskController
 * Provides injection protection and validation
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TaskRestController {
    
    private final TaskService taskService;
    
    public TaskRestController(TaskService taskService) {
        this.taskService = taskService;
    }
    
    @GetMapping("/tasks")
    public ResponseEntity<ApiResponseDto<List<Task>>> getAllTasks(@RequestParam(required = false) Long projectId) {
        try {
            List<Task> tasks = taskService.getAllTasks();
            return ResponseEntity.ok(ApiResponseDto.success("Tasks retrieved successfully", tasks));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error("Failed to fetch tasks: " + e.getMessage()));
        }
    }
    
    @GetMapping("/task/{id}")
    public ResponseEntity<ApiResponseDto<Task>> getTask(@PathVariable Long id) {
        try {
            Optional<Task> task = taskService.getTaskById(id);
            return task.map(t -> ResponseEntity.ok(ApiResponseDto.success("Task retrieved successfully", t)))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponseDto.error("Task not found: " + id)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error("Failed to fetch task: " + e.getMessage()));
        }
    }
    
    @PostMapping("/task")
    public ResponseEntity<ApiResponseDto<Task>> createTask(@Valid @RequestBody Task task) {
        try {
            Task created = taskService.createTask(task);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDto.success("Task created successfully", created));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.error("Failed to create task: " + e.getMessage()));
        }
    }
    
    @PutMapping("/task/{id}")
    public ResponseEntity<ApiResponseDto<Task>> updateTask(@PathVariable Long id, @Valid @RequestBody Task task) {
        try {
            task.setId(id);
            taskService.updateTask(id, task);
            return ResponseEntity.ok(ApiResponseDto.success("Task updated successfully", task));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.error("Failed to update task: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/task/{id}")
    public ResponseEntity<ApiResponseDto<Void>> deleteTask(@PathVariable Long id) {
        try {
            boolean deleted = taskService.deleteTask(id);
            return deleted ? ResponseEntity.ok(ApiResponseDto.success("Task deleted successfully"))
                    : ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponseDto.error("Task not found: " + id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error("Failed to delete task: " + e.getMessage()));
        }
    }
}
