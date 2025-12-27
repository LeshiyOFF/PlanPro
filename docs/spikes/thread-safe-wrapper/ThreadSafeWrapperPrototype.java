package com.projectlibre.spike;

import com.projectlibre.session.LocalSession;
import com.projectlibre.pm.task.Task;
import com.projectlibre.pm.project.Project;
import com.projectlibre.pm.resource.Resource;

import javax.swing.SwingUtilities;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Future;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Thread-Safe Wrapper для LocalSession
 * 
 * Решает проблему с Swing зависимостями в бизнес-логике ProjectLibre
 * Использует паттерн SynchronizedFacade + ExecutorService
 * 
 * Key проблемы:
 * 1. SwingUtilities.invokeLater вызовы в LocalSession
 * 2. Thread-safety при многопоточных REST вызовах  
 * 3. Race conditions при одновременном доступе к данным
 * 4. Синхронизация с EDT (Event Dispatch Thread)
 */
public class ThreadSafeWrapperPrototype {
    
    // Пул потоков для бизнес-операций
    private final ExecutorService businessExecutor = Executors.newFixedThreadPool(10);
    
    // Locks для thread-safety
    private final Map<String, ReentrantLock> projectLocks = new ConcurrentHashMap<>();
    private final ReentrantReadWriteLock globalLock = new ReentrantReadWriteLock();
    
    // Оригинальная LocalSession (не thread-safe)
    private final LocalSession originalSession;
    
    // Статистика для мониторинга
    private volatile long operationCount = 0;
    private volatile long swingInvokeCount = 0;
    private volatile long maxConcurrentOperations = 0;
    private volatile long currentConcurrentOperations = 0;
    
    public ThreadSafeWrapperPrototype(LocalSession session) {
        this.originalSession = session;
    }
    
    /**
     * Thread-safe создание проекта
     * Проблема: LocalSession.createProject() вызывает SwingUtilities.invokeLater
     */
    public CompletableFuture<Project> createProjectAsync(CreateProjectRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            currentConcurrentOperations++;
            updateMaxConcurrent();
            
            try {
                // Вызываем в EDT если нужно
                if (needsEdtCall("createProject")) {
                    return invokeAndWait(() -> originalSession.createProject(request.toProject()));
                } else {
                    return originalSession.createProject(request.toProject());
                }
            } finally {
                operationCount++;
                currentConcurrentOperations--;
            }
        }, businessExecutor);
    }
    
    /**
     * Thread-safe получение задач проекта
     * Race condition prevention через project-level lock
     */
    public CompletableFuture<List<Task>> getProjectTasksAsync(String projectId) {
        return CompletableFuture.supplyAsync(() -> {
            currentConcurrentOperations++;
            updateMaxConcurrent();
            
            ReentrantLock projectLock = getProjectLock(projectId);
            projectLock.lock();
            try {
                if (needsEdtCall("getTasks")) {
                    return invokeAndWait(() -> originalSession.getTasks(projectId));
                } else {
                    return originalSession.getTasks(projectId);
                }
            } finally {
                projectLock.unlock();
                operationCount++;
                currentConcurrentOperations--;
            }
        }, businessExecutor);
    }
    
    /**
     * Thread-safe обновление задачи
     * Критично: избегаем race conditions между одновременными обновлениями
     */
    public CompletableFuture<Task> updateTaskAsync(UpdateTaskRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            currentConcurrentOperations++;
            updateMaxConcurrent();
            
            String projectId = request.getProjectId();
            String taskId = request.getTaskId();
            
            // Двойная блокировка для избежания race conditions
            ReentrantLock projectLock = getProjectLock(projectId);
            projectLock.lock();
            try {
                // Валидация в текущем потоке
                Task existingTask = originalSession.getTask(taskId);
                if (existingTask == null) {
                    throw new RuntimeException("Task not found: " + taskId);
                }
                
                if (needsEdtCall("updateTask")) {
                    return invokeAndWait(() -> {
                        existingTask.setName(request.getName());
                        existingTask.setProgress(request.getProgress());
                        existingTask.setStatus(request.getStatus());
                        return existingTask;
                    });
                } else {
                    existingTask.setName(request.getName());
                    existingTask.setProgress(request.getProgress());
                    existingTask.setStatus(request.getStatus());
                    return existingTask;
                }
            } finally {
                projectLock.unlock();
                operationCount++;
                currentConcurrentOperations--;
            }
        }, businessExecutor);
    }
    
    /**
     * Thread-safe удаление задачи
     * Использует оптимистичное удаление с минимальной блокировкой
     */
    public CompletableFuture<Boolean> deleteTaskAsync(String taskId) {
        return CompletableFuture.supplyAsync(() -> {
            currentConcurrentOperations++;
            updateMaxConcurrent();
            
            // Находим проект задачи для блокировки
            Task task = invokeAndWait(() -> originalSession.getTask(taskId));
            if (task == null) {
                return false;
            }
            
            String projectId = task.getProjectId();
            ReentrantLock projectLock = getProjectLock(projectId);
            projectLock.lock();
            try {
                if (needsEdtCall("deleteTask")) {
                    return invokeAndWait(() -> originalSession.deleteTask(taskId));
                } else {
                    return originalSession.deleteTask(taskId);
                }
            } finally {
                projectLock.unlock();
                operationCount++;
                currentConcurrentOperations--;
            }
        }, businessExecutor);
    }
    
    /**
     * Массовые операции с повышенной concurrency
     * Блокируем глобально для consistency
     */
    public CompletableFuture<List<Project>> getAllProjectsAsync() {
        return CompletableFuture.supplyAsync(() -> {
            currentConcurrentOperations++;
            updateMaxConcurrent();
            
            globalLock.readLock().lock();
            try {
                if (needsEdtCall("getAllProjects")) {
                    return invokeAndWait(() -> originalSession.getProjects());
                } else {
                    return originalSession.getProjects();
                }
            } finally {
                globalLock.readLock().unlock();
                operationCount++;
                currentConcurrentOperations--;
            }
        }, businessExecutor);
    }
    
    /**
     * Определение нужности вызова в EDT
     * Анализирует методы LocalSession на предмет Swing зависимостей
     */
    private boolean needsEdtCall(String methodName) {
        // HOTSPOT методы которые требуют EDT
        switch (methodName) {
            case "createProject":
            case "updateProject":
            case "deleteProject":
            case "createTask":
            case "updateTask":
            case "deleteTask":
            case "getTasks":
                return true; // Эти методы используют Swing компоненты
                
            case "getAllProjects":
            case "getProject":
            case "getTask":
                return false; // Эти методы могут работать в background
                
            default:
                return false; // Безопасно по умолчанию
        }
    }
    
    /**
     * Безопасный вызов в EDT с ожиданием результата
     * Блокирует текущий поток до выполнения в EDT
     */
    @SuppressWarnings("unchecked")
    private <T> T invokeAndWait(java.util.concurrent.Callable<T> callable) {
        swingInvokeCount++;
        
        if (SwingUtilities.isEventDispatchThread()) {
            try {
                return callable.call();
            } catch (Exception e) {
                throw new RuntimeException("EDT call failed", e);
            }
        } else {
            try {
                // Блокируем и ждем выполнения в EDT
                FutureTask<T> future = new FutureTask<>(callable);
                SwingUtilities.invokeLater(future);
                return future.get(); // Блокируем до завершения
            } catch (Exception e) {
                throw new RuntimeException("EDT invokeAndWait failed", e);
            }
        }
    }
    
    /**
     * Получение/создание lock для проекта
     */
    private ReentrantLock getProjectLock(String projectId) {
        return projectLocks.computeIfAbsent(projectId, k -> new ReentrantLock());
    }
    
    /**
     * Обновление счетчика concurrent операций
     */
    private void updateMaxConcurrent() {
        if (currentConcurrentOperations > maxConcurrentOperations) {
            maxConcurrentOperations = currentConcurrentOperations;
        }
    }
    
    /**
     * Статистика для мониторинга thread-safety
     */
    public ThreadSafetyStats getStats() {
        return new ThreadSafetyStats(
            operationCount,
            swingInvokeCount,
            maxConcurrentOperations,
            currentConcurrentOperations,
            projectLocks.size()
        );
    }
    
    /**
     * Очистка неиспользуемых locks
     */
    public void cleanupLocks() {
        // Remove locks for deleted/completed projects
        globalLock.writeLock().lock();
        try {
            projectLocks.entrySet().removeIf(entry -> {
                String projectId = entry.getKey();
                // Проверяем существует ли проект
                try {
                    originalSession.getProject(projectId);
                    return false; // Keep lock
                } catch (Exception e) {
                    return true; // Remove lock - project doesn't exist
                }
            });
        } finally {
            globalLock.writeLock().unlock();
        }
    }
    
    /**
     * Graceful shutdown
     */
    public void shutdown() {
        try {
            businessExecutor.shutdown();
            if (!businessExecutor.awaitTermination(30, java.util.concurrent.TimeUnit.SECONDS)) {
                System.err.println("Warning: Business executor did not shutdown gracefully");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    /**
     * Статистика thread-safety
     */
    public static class ThreadSafetyStats {
        private final long totalOperations;
        private final long swingInvokes;
        private final long maxConcurrent;
        private final long currentConcurrent;
        private final int activeProjectLocks;
        
        public ThreadSafetyStats(long total, long swing, long max, long current, int locks) {
            this.totalOperations = total;
            this.swingInvokes = swing;
            this.maxConcurrent = max;
            this.currentConcurrent = current;
            this.activeProjectLocks = locks;
        }
        
        @Override
        public String toString() {
            return String.format(
                "ThreadSafetyStats{totalOps=%d, swingInvokes=%d, maxConcurrent=%d, currentConcurrent=%d, activeLocks=%d}",
                totalOperations, swingInvokes, maxConcurrent, currentConcurrent, activeProjectLocks
            );
        }
        
        // Getters
        public long getTotalOperations() { return totalOperations; }
        public long getSwingInvokes() { return swingInvokes; }
        public long getMaxConcurrent() { return maxConcurrent; }
        public long getCurrentConcurrent() { return currentConcurrent; }
        public int getActiveProjectLocks() { return activeProjectLocks; }
    }
    
    /**
     * Request DTOs для прототипа
     */
    public static class CreateProjectRequest {
        private String name;
        private String description;
        private String startDate;
        private String endDate;
        
        // Constructors, getters, setters
        public CreateProjectRequest(String name, String description, String startDate, String endDate) {
            this.name = name;
            this.description = description;
            this.startDate = startDate;
            this.endDate = endDate;
        }
        
        public Project toProject() {
            Project project = new Project();
            project.setName(name);
            project.setDescription(description);
            // Convert dates...
            return project;
        }
        
        // Getters
        public String getName() { return name; }
        public String getDescription() { return description; }
        public String getStartDate() { return startDate; }
        public String getEndDate() { return endDate; }
    }
    
    public static class UpdateTaskRequest {
        private String projectId;
        private String taskId;
        private String name;
        private Integer progress;
        private String status;
        
        public UpdateTaskRequest(String projectId, String taskId, String name, Integer progress, String status) {
            this.projectId = projectId;
            this.taskId = taskId;
            this.name = name;
            this.progress = progress;
            this.status = status;
        }
        
        // Getters
        public String getProjectId() { return projectId; }
        public String getTaskId() { return taskId; }
        public String getName() { return name; }
        public Integer getProgress() { return progress; }
        public String getStatus() { return status; }
    }
}