package com.projectlibre.api.rest;

import com.projectlibre.api.dto.*;
import com.projectlibre.api.model.Project;
import com.projectlibre.api.storage.CoreProjectBridge;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.DirtiesContext;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Интеграционные тесты для файловых операций.
 * Проверяют сохранение и загрузку .pod файлов через REST API.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class FileOperationsIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    private CoreProjectBridge projectBridge = CoreProjectBridge.getInstance();

    private Long testProjectId;
    private String testProjectName = "IntegrationTestProject";

    @BeforeEach
    public void setUp() {
        // Создаем проект для тестов
        Project project = new Project();
        project.setName(testProjectName);
        ResponseEntity<ApiResponseDto> response = restTemplate.postForEntity("/api/projects", project, ApiResponseDto.class);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        
        // Извлекаем ID (нужно быть аккуратным с типизацией ответа в тестах)
        Object data = response.getBody().getData();
        if (data instanceof java.util.Map) {
            testProjectId = Long.valueOf(((java.util.Map<?, ?>) data).get("id").toString());
        }
    }

    /**
     * Тест полного цикла: создание -> сохранение -> загрузка.
     */
    @Test
    public void testSaveAndLoadPodFile() throws Exception {
        Path tempDir = Files.createTempDirectory("projectlibre_test");
        String filePath = tempDir.resolve("test_project.pod").toString();

        // 1. Сохранение
        FileSaveRequestDto saveRequest = new FileSaveRequestDto();
        saveRequest.setProjectId(testProjectId);
        saveRequest.setFilePath(filePath);
        saveRequest.setFormat("pod");

        ResponseEntity<ApiResponseDto> saveResponse = restTemplate.postForEntity("/api/files/save", saveRequest, ApiResponseDto.class);
        assertEquals(HttpStatus.OK, saveResponse.getStatusCode(), "Save should be successful");
        assertTrue(new File(filePath).exists(), "POD file should be created on disk");

        // 2. Очистка моста перед загрузкой
        projectBridge.clearAll();

        // 3. Загрузка
        FileLoadRequestDto loadRequest = new FileLoadRequestDto();
        loadRequest.setFilePath(filePath);

        ResponseEntity<ApiResponseDto> loadResponse = restTemplate.postForEntity("/api/files/load", loadRequest, ApiResponseDto.class);
        assertEquals(HttpStatus.OK, loadResponse.getStatusCode(), "Load should be successful");
        
        // 4. Проверка регистрации в мосту
        assertFalse(projectBridge.getAllProjects().isEmpty(), "Project should be registered in bridge after load");
        
        // Очистка
        Files.deleteIfExists(Path.of(filePath));
        Files.deleteIfExists(tempDir);
    }

    /**
     * Тест на параллельную загрузку файлов (проверка отсутствия NPE и race conditions).
     */
    @Test
    public void testConcurrentLoadOperations() throws Exception {
        Path tempDir = Files.createTempDirectory("projectlibre_concurrent");
        int count = 5;
        String[] filePaths = new String[count];
        
        // Подготовка файлов
        for (int i = 0; i < count; i++) {
            filePaths[i] = tempDir.resolve("concurrent_" + i + ".pod").toString();
            FileSaveRequestDto req = new FileSaveRequestDto();
            req.setProjectId(testProjectId);
            req.setFilePath(filePaths[i]);
            restTemplate.postForEntity("/api/files/save", req, ApiResponseDto.class);
        }

        ExecutorService executor = Executors.newFixedThreadPool(count);
        CountDownLatch latch = new CountDownLatch(count);
        AtomicInteger successCount = new AtomicInteger(0);

        for (int i = 0; i < count; i++) {
            final String path = filePaths[i];
            executor.submit(() -> {
                try {
                    FileLoadRequestDto loadReq = new FileLoadRequestDto();
                    loadReq.setFilePath(path);
                    ResponseEntity<ApiResponseDto> resp = restTemplate.postForEntity("/api/files/load", loadReq, ApiResponseDto.class);
                    if (resp.getStatusCode() == HttpStatus.OK) {
                        successCount.incrementAndGet();
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        assertTrue(latch.await(30, TimeUnit.SECONDS), "Concurrent loads timed out");
        assertEquals(count, successCount.get(), "All concurrent loads should succeed");

        // Очистка
        for (String p : filePaths) Files.deleteIfExists(Path.of(p));
        Files.deleteIfExists(tempDir);
    }
}
