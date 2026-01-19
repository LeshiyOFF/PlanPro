package com.projectlibre.api.config;

import com.projectlibre.api.dto.ApiResponseDto;
import com.projectlibre.api.model.Project;
import com.projectlibre1.job.JobQueue;
import com.projectlibre1.session.SessionFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.junit.jupiter.api.Disabled;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Smoke-тесты для Headless Mode.
 * Проверяют, что ядро работает корректно без графической среды.
 * Использует рефлексию для проверки новых типов, чтобы избежать ошибок компиляции при устаревшем JAR.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class HeadlessModeSmokeTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @BeforeAll
    public static void enableHeadless() {
        System.setProperty("java.awt.headless", "true");
    }

    @Test
    public void testHeadlessPropertyIsSet() {
        assertEquals("true", System.getProperty("java.awt.headless"));
        assertTrue(java.awt.GraphicsEnvironment.isHeadless());
    }

    @Test
    public void testCreateProjectInHeadlessMode() {
        Project project = new Project();
        project.setName("HeadlessProject");
        ResponseEntity<ApiResponseDto> response = restTemplate.postForEntity("/api/projects", project, ApiResponseDto.class);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    @Disabled("Требует обновления projectlibre.jar для доступа к новым методам JobQueue")
    public void testJobQueueReturnsCorrectProgressMonitor() throws Exception {
        JobQueue jobQueue = SessionFactory.getInstance().getJobQueue();
        assertNotNull(jobQueue);
        
        // Вызываем новый метод через рефлексию
        java.lang.reflect.Method method = jobQueue.getClass().getMethod("getProgressMonitorInterface", String.class, java.awt.Component.class);
        Object monitor = method.invoke(jobQueue, "TestTask", null);
        
        assertNotNull(monitor);
        assertEquals("SilentProgressMonitor", monitor.getClass().getSimpleName(), 
            "Should return SilentProgressMonitor in headless mode");
            
        // Проверяем наличие методов интерфейса IProgressMonitor
        assertNotNull(monitor.getClass().getMethod("setProgress", int.class));
        assertNotNull(monitor.getClass().getMethod("setNote", String.class));
    }
}
