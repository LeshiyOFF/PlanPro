package com.projectlibre.api.service;

import com.projectlibre.api.model.Task;
import com.projectlibre.api.repository.TaskRepository;
import com.projectlibre.api.adapter.ThreadSafeTaskAdapter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

/**
 * Сервис для управления задачами
 * Использует ThreadSafe репозиторий для потокобезопасного доступа
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
public class TaskService {
    
    private final TaskRepository repository;
    private final TaskUpdateService updateService;

    public TaskService() {
        this.repository = ThreadSafeTaskAdapter.getInstance();
        this.updateService = new TaskUpdateService();
    }

    public TaskService(TaskRepository repository) {
        this.repository = repository;
        this.updateService = new TaskUpdateService();
    }

    public List<Task> getAllTasks() {
        return repository.findAll();
    }

    public Optional<Task> getTaskById(Long id) {
        return repository.findById(id);
    }

    public List<Task> getTasksByProjectId(Long projectId) {
        return repository.findByProjectId(projectId);
    }

    public List<Task> getTasksByStatus(String status) {
        return repository.findByStatus(status);
    }

    public List<Task> getTasksByAssignee(Long assigneeId) {
        return repository.findByAssigneeId(assigneeId);
    }

    public List<Task> getOverdueTasks() {
        return repository.findOverdueTasks();
    }

    public Task createTask(Task task) {
        validateTaskForCreation(task);
        updateService.prepareNewTask(task);
        return repository.save(task);
    }

    public Optional<Task> updateTask(Long id, Task updatedTask) {
        if (updatedTask == null) {
            throw new IllegalArgumentException("Updated task cannot be null");
        }
        return repository.findById(id).map(existing -> {
            updateService.updateAllFields(existing, updatedTask);
            return repository.save(existing);
        });
    }

    public Optional<Task> updateTaskStatus(Long id, String status) {
        return repository.findById(id).map(task -> {
            task.setStatus(status);
            task.setUpdatedAt(LocalDateTime.now());
            return repository.save(task);
        });
    }

    public Optional<Task> updateTaskProgress(Long id, Double progress) {
        return repository.findById(id).map(task -> {
            task.updateProgress(progress);
            task.setUpdatedAt(LocalDateTime.now());
            return repository.save(task);
        });
    }

    public Optional<Task> assignTask(Long id, Long assigneeId) {
        return repository.findById(id).map(task -> {
            task.setAssigneeId(assigneeId);
            task.setUpdatedAt(LocalDateTime.now());
            return repository.save(task);
        });
    }

    public boolean deleteTask(Long id) {
        return repository.deleteById(id);
    }

    public long getTotalTaskCount() {
        return repository.count();
    }

    public long getTaskCountByStatus(String status) {
        return repository.findByStatus(status).size();
    }

    public Map<String, Long> getTaskStatistics() {
        Map<String, Long> stats = new HashMap<>();
        repository.findAll().forEach(task -> 
            stats.merge(task.getStatus(), 1L, Long::sum));
        return stats;
    }

    private void validateTaskForCreation(Task task) {
        if (task == null) {
            throw new IllegalArgumentException("Task cannot be null");
        }
        if (task.getTitle() == null || task.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Task title cannot be null or empty");
        }
    }
}
