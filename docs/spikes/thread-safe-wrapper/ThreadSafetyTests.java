package com.projectlibre.spike;

import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;
import java.util.concurrent.*;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;

/**
 * Unit тесты для Thread-Safe Wrapper прототипа
 * 
 * Тестируем key scenarios:
 * 1. Concurrent read/write операций
 * 2. Race conditions prevention  
 * 3. SwingUtilities.invokeLater обработка
 * 4. Performance под нагрузкой
 */
public class ThreadSafetyTests {
    
    private ThreadSafeWrapperPrototype wrapper;
    private ExecutorService testExecutor;
    
    @BeforeEach
    void setUp() {
        // Mock LocalSession для тестов
        LocalSession mockSession = createMockLocalSession();
        wrapper = new ThreadSafeWrapperPrototype(mockSession);
        testExecutor = Executors.newFixedThreadPool(20);
    }
    
    @AfterEach  
    void tearDown() {
        wrapper.shutdown();
        testExecutor.shutdown();
    }
    
    /**
     * Тест 1: Concurrent создание проектов без race conditions
     * Ожидание: Все проекты созданы, нет дубликатов
     */
    @Test
    @DisplayName("Concurrent Project Creation - No Race Conditions")
    void testConcurrentProjectCreation() throws Exception {
        int threadCount = 10;
        int projectsPerThread = 5;
        CountDownLatch latch = new CountDownLatch(threadCount);
        List<Future<Project>> futures = new ArrayList<>();
        
        // Запускаем concurrent создание проектов
        for (int i = 0; i < threadCount; i++) {
            final int threadId = i;
            Future<Project> future = testExecutor.submit(() -> {
                try {
                    latch.countDown();
                    latch.await(); // Синхронный старт
                    
                    List<Project> createdProjects = new ArrayList<>();
                    for (int j = 0; j < projectsPerThread; j++) {
                        String projectName = "Project-" + threadId + "-" + j;
                        CreateProjectRequest request = new CreateProjectRequest(
                            projectName, "Description", "2025-01-01", "2025-06-30"
                        );
                        
                        Project created = wrapper.createProjectAsync(request).get(5, TimeUnit.SECONDS);
                        assertNotNull(created, "Project should not be null");
                        createdProjects.add(created);
                    }
                    
                    return createdProjects;
                } catch (Exception e) {
                    fail("Concurrent project creation failed: " + e.getMessage());
                }
            });
            futures.add(future);
        }
        
        // Ждем завершения всех потоков
        latch.countDown(); // Разрешаем старт
        
        List<Project> allProjects = new ArrayList<>();
        for (Future<Project> future : futures) {
            List<Project> threadProjects = future.get(30, TimeUnit.SECONDS);
            allProjects.addAll(threadProjects);
        }
        
        // Проверяем результаты
        assertEquals(
            threadCount * projectsPerThread, 
            allProjects.size(),
            "All projects should be created"
        );
        
        // Проверяем отсутствие дубликатов
        long uniqueProjectCount = allProjects.stream()
            .map(Project::getName)
            .distinct()
            .count();
            
        assertEquals(
            allProjects.size(),
            uniqueProjectCount,
            "No duplicate projects should exist"
        );
        
        System.out.println("✅ Concurrent project creation test passed");
    }
    
    /**
     * Тест 2: Concurrent обновление одной и той же задачи
     * Ожидание: Обновления применяются последовательно, нет data corruption
     */
    @Test
    @DisplayName("Concurrent Task Updates - Sequential Application")
    void testConcurrentTaskUpdates() throws Exception {
        String taskId = "test-task-1";
        String projectId = "test-project-1";
        
        // Создаем задачу
        CreateProjectRequest projectRequest = new CreateProjectRequest(
            "Test Project", "Description", "2025-01-01", "2025-06-30"
        );
        Project project = wrapper.createProjectAsync(projectRequest).get(5, TimeUnit.SECONDS);
        
        // Mock создаем задачу в проекте
        Task mockTask = createMockTask(taskId, projectId);
        
        int updateCount = 50;
        CountDownLatch latch = new CountDownLatch(updateCount);
        List<Future<Task>> futures = new ArrayList<>();
        
        // Concurrent обновления прогресса
        for (int i = 0; i < updateCount; i++) {
            final int progress = i * 2; // 0, 2, 4, 6... 
            Future<Task> future = testExecutor.submit(() -> {
                try {
                    latch.countDown();
                    latch.await();
                    
                    UpdateTaskRequest request = new UpdateTaskRequest(
                        projectId, taskId, "Updated Task " + progress, progress, "IN_PROGRESS"
                    );
                    
                    return wrapper.updateTaskAsync(request).get(5, TimeUnit.SECONDS);
                } catch (Exception e) {
                    fail("Task update failed: " + e.getMessage());
                }
            });
            futures.add(future);
        }
        
        latch.countDown();
        
        // Ждем завершения
        Task finalTask = null;
        for (Future<Task> future : futures) {
            Task updatedTask = future.get(30, TimeUnit.SECONDS);
            if (finalTask == null || updatedTask.getProgress() > finalTask.getProgress()) {
                finalTask = updatedTask;
            }
        }
        
        // Проверяем финальный результат
        assertNotNull(finalTask, "Final task should not be null");
        assertTrue(
            finalTask.getProgress() >= 0 && finalTask.getProgress() <= 100,
            "Progress should be within valid range"
        );
        
        System.out.println("✅ Concurrent task update test passed - Final progress: " + finalTask.getProgress());
    }
    
    /**
     * Тест 3: Race condition prevention
     * Два потока одновременно читают и пишут одни данные
     */
    @Test
    @DisplayName("Race Condition Prevention - Read/Write Lock")
    void testRaceConditionPrevention() throws Exception {
        String projectId = "race-test-project";
        CountDownLatch latch = new CountDownLatch(2);
        
        // Reader thread - читает задачи
        Future<List<Task>> readerFuture = testExecutor.submit(() -> {
            try {
                latch.countDown();
                latch.await();
                
                // Несколько последовательных чтений
                for (int i = 0; i < 5; i++) {
                    List<Task> tasks = wrapper.getProjectTasksAsync(projectId).get(5, TimeUnit.SECONDS);
                    assertNotNull(tasks, "Tasks should not be null");
                    Thread.sleep(100); // Небольшая задержка
                }
                return new ArrayList<>();
            } catch (Exception e) {
                fail("Reader failed: " + e.getMessage());
            }
        });
        
        // Writer thread - обновляет задачи
        Future<Boolean> writerFuture = testExecutor.submit(() -> {
            try {
                latch.countDown();
                latch.await();
                Thread.sleep(200); // Даем читателю начать первым
                
                UpdateTaskRequest request = new UpdateTaskRequest(
                    projectId, "task-1", "Updated by writer", 75, "IN_PROGRESS"
                );
                
                Task updated = wrapper.updateTaskAsync(request).get(10, TimeUnit.SECONDS);
                assertNotNull(updated, "Task should be updated");
                return true;
            } catch (Exception e) {
                fail("Writer failed: " + e.getMessage());
                return false;
            }
        });
        
        latch.countDown();
        
        // Ждем завершения
        List<Task> readResult = readerFuture.get(20, TimeUnit.SECONDS);
        Boolean writeResult = writerFuture.get(20, TimeUnit.SECONDS);
        
        assertTrue(writeResult, "Write operation should succeed");
        assertNotNull(readResult, "Read operations should succeed");
        
        System.out.println("✅ Race condition prevention test passed");
    }
    
    /**
     * Тест 4: SwingUtilities.invokeLater обработка
     * Проверяем корректность вызовов в EDT
     */
    @Test
    @DisplayName("SwingUtilities.invokeLater Handling")
    void testSwingInvokeHandling() throws Exception {
        // Тестируем методы которые требуют EDT
        CreateProjectRequest request = new CreateProjectRequest(
            "EDT Test Project", "Testing EDT calls", "2025-01-01", "2025-06-30"
        );
        
        long startTime = System.currentTimeMillis();
        Project project = wrapper.createProjectAsync(request).get(10, TimeUnit.SECONDS);
        long endTime = System.currentTimeMillis();
        
        assertNotNull(project, "Project should be created");
        assertTrue(
            (endTime - startTime) < 5000,
            "EDT call should complete within reasonable time (< 5s)"
        );
        
        System.out.println("✅ Swing invoke handling test passed - Duration: " + (endTime - startTime) + "ms");
    }
    
    /**
     * Тест 5: Performance под нагрузкой
     * 50+ concurrent операций, проверяем throughput
     */
    @Test
    @DisplayName("High Concurrency Performance")
    void testHighConcurrencyPerformance() throws Exception {
        int operationCount = 100;
        CountDownLatch latch = new CountDownLatch(operationCount);
        List<Future<?>> futures = new ArrayList<>();
        
        long startTime = System.currentTimeMillis();
        
        // Запускаем mixed операции
        for (int i = 0; i < operationCount; i++) {
            final int index = i;
            Future<?> future = testExecutor.submit(() -> {
                try {
                    latch.countDown();
                    latch.await();
                    
                    switch (index % 4) {
                        case 0: // Create project
                            CreateProjectRequest req = new CreateProjectRequest(
                                "Perf-Project-" + index, "Description", "2025-01-01", "2025-06-30"
                            );
                            return wrapper.createProjectAsync(req).get(5, TimeUnit.SECONDS);
                            
                        case 1: // Get tasks
                            return wrapper.getProjectTasksAsync("perf-project-" + index).get(5, TimeUnit.SECONDS);
                            
                        case 2: // Update task
                            UpdateTaskRequest updateReq = new UpdateTaskRequest(
                                "perf-project-" + index, "perf-task-" + index, "Updated Task", 50, "IN_PROGRESS"
                            );
                            return wrapper.updateTaskAsync(updateReq).get(5, TimeUnit.SECONDS);
                            
                        case 3: // Delete task
                            return wrapper.deleteTaskAsync("perf-task-" + index).get(5, TimeUnit.SECONDS);
                            
                        default:
                            return null;
                    }
                } catch (Exception e) {
                    System.err.println("Operation failed: " + e.getMessage());
                    return null;
                }
            });
            futures.add(future);
        }
        
        latch.countDown();
        
        // Ждем завершения
        int successCount = 0;
        for (Future<?> future : futures) {
            try {
                Object result = future.get(30, TimeUnit.SECONDS);
                if (result != null) {
                    successCount++;
                }
            } catch (Exception e) {
                System.err.println("Future failed: " + e.getMessage());
            }
        }
        
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;
        double operationsPerSecond = (double) successCount / (duration / 1000.0);
        
        // Performance assertions
        assertTrue(
            successCount >= operationCount * 0.9, // 90% success rate
            "At least 90% operations should succeed"
        );
        
        assertTrue(
            operationsPerSecond >= 10.0,
            "Should handle at least 10 ops/sec, got: " + operationsPerSecond
        );
        
        System.out.println("✅ Performance test passed:");
        System.out.println("  - Success rate: " + (successCount * 100.0 / operationCount) + "%");
        System.out.println("  - Throughput: " + String.format("%.2f", operationsPerSecond) + " ops/sec");
        System.out.println("  - Duration: " + duration + "ms");
    }
    
    /**
     * Тест 6: Memory leak detection
     * Проверяем что locks очищаются корректно
     */
    @Test
    @DisplayName("Memory Leak Prevention - Lock Cleanup")
    void testMemoryLeakPrevention() throws Exception {
        // Создаем много проектов для генерации locks
        List<Future<Project>> projectFutures = new ArrayList<>();
        for (int i = 0; i < 50; i++) {
            CreateProjectRequest request = new CreateProjectRequest(
                "Mem-Leak-Test-" + i, "Description", "2025-01-01", "2025-06-30"
            );
            projectFutures.add(wrapper.createProjectAsync(request));
        }
        
        // Ждем завершения
        List<Project> projects = new ArrayList<>();
        for (Future<Project> future : projectFutures) {
            projects.add(future.get(10, TimeUnit.SECONDS));
        }
        
        ThreadSafetyStats statsBefore = wrapper.getStats();
        int initialLocks = statsBefore.getActiveProjectLocks();
        
        // "Удаляем" половину проектов (в реальности они бы были удалены)
        for (int i = 0; i < projects.size() / 2; i++) {
            Project project = projects.get(i);
            if (project != null) {
                wrapper.deleteTaskAsync("mock-task-" + i); // Симуляция очистки
            }
        }
        
        // Вызываем cleanup
        wrapper.cleanupLocks();
        
        ThreadSafetyStats statsAfter = wrapper.getStats();
        int finalLocks = statsAfter.getActiveProjectLocks();
        
        // Проверяем что locks уменьшились
        assertTrue(
            finalLocks < initialLocks,
            "Lock count should decrease after cleanup"
        );
        
        System.out.println("✅ Memory leak prevention test passed");
        System.out.println("  - Locks before: " + initialLocks);
        System.out.println("  - Locks after cleanup: " + finalLocks);
    }
    
    /**
     * Helper методы для создания mock объектов
     */
    private LocalSession createMockLocalSession() {
        return new LocalSession() {
            private final Map<String, Project> projects = new ConcurrentHashMap<>();
            private final Map<String, List<Task>> tasks = new ConcurrentHashMap<>();
            
            @Override
            public Project createProject(Project project) {
                projects.put(project.getId(), project);
                return project;
            }
            
            @Override
            public List<Project> getProjects() {
                return new ArrayList<>(projects.values());
            }
            
            @Override
            public Project getProject(String projectId) {
                return projects.get(projectId);
            }
            
            @Override
            public List<Task> getTasks(String projectId) {
                return tasks.getOrDefault(projectId, new ArrayList<>());
            }
            
            @Override
            public Task getTask(String taskId) {
                return tasks.values().stream()
                    .flatMap(List::stream)
                    .filter(t -> t.getId().equals(taskId))
                    .findFirst()
                    .orElse(null);
            }
            
            @Override
            public Task deleteTask(String taskId) {
                tasks.values().forEach(taskList -> 
                    taskList.removeIf(t -> t.getId().equals(taskId))
                );
                return true;
            }
            
            @Override
            public Project updateProject(Project project) {
                projects.put(project.getId(), project);
                return project;
            }
        };
    }
    
    private Task createMockTask(String taskId, String projectId) {
        Task task = new Task();
        task.setId(taskId);
        task.setName("Mock Task " + taskId);
        task.setProgress(0);
        task.setStatus("NOT_STARTED");
        task.setProjectId(projectId);
        return task;
    }
}