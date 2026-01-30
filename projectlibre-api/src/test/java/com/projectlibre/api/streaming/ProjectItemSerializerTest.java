package com.projectlibre.api.streaming;

import com.projectlibre.api.dto.ProjectDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit тесты для ProjectItemSerializer.
 * 
 * Проверяет корректность JSON сериализации ProjectDto,
 * особенно форматирование дат в ISO-8601 формате.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
@DisplayName("ProjectItemSerializer Tests")
class ProjectItemSerializerTest {
    
    private ProjectItemSerializer serializer;
    
    @BeforeEach
    void setUp() {
        serializer = ProjectItemSerializer.getInstance();
    }
    
    @Nested
    @DisplayName("Singleton паттерн")
    class SingletonTests {
        
        @Test
        @DisplayName("getInstance() должен возвращать один и тот же экземпляр")
        void shouldReturnSameInstance() {
            ProjectItemSerializer instance1 = ProjectItemSerializer.getInstance();
            ProjectItemSerializer instance2 = ProjectItemSerializer.getInstance();
            
            assertSame(instance1, instance2);
        }
    }
    
    @Nested
    @DisplayName("Сериализация дат")
    class DateSerializationTests {
        
        @Test
        @DisplayName("Должен форматировать даты в ISO-8601 с дефисами")
        void shouldFormatDatesWithDashes() {
            ProjectDto project = createProjectWithDates();
            
            String json = serializer.serialize(project);
            
            assertTrue(json.contains("2026-01-28"), "Дата должна содержать дефисы");
            assertFalse(json.contains("20260128"), "Не должно быть BASIC_ISO формата");
        }
        
        @Test
        @DisplayName("Должен корректно сериализовать startDate")
        void shouldSerializeStartDate() {
            ProjectDto project = createProjectWithDates();
            
            String json = serializer.serialize(project);
            
            assertTrue(json.contains("\"startDate\":\"2026-01-28T10:00:00\""));
        }
        
        @Test
        @DisplayName("Должен корректно сериализовать endDate")
        void shouldSerializeEndDate() {
            ProjectDto project = createProjectWithDates();
            
            String json = serializer.serialize(project);
            
            assertTrue(json.contains("\"endDate\":\"2026-02-28T18:00:00\""));
        }
        
        @Test
        @DisplayName("Должен пропускать null даты")
        void shouldSkipNullDates() {
            ProjectDto project = new ProjectDto();
            project.setId(1L);
            project.setName("Test");
            
            String json = serializer.serialize(project);
            
            assertFalse(json.contains("startDate"));
            assertFalse(json.contains("endDate"));
        }
    }
    
    @Nested
    @DisplayName("Сериализация полей")
    class FieldSerializationTests {
        
        @Test
        @DisplayName("Должен сериализовать базовые поля")
        void shouldSerializeBasicFields() {
            ProjectDto project = createFullProject();
            
            String json = serializer.serialize(project);
            
            assertTrue(json.contains("\"id\":1"));
            assertTrue(json.contains("\"name\":\"Test Project\""));
            assertTrue(json.contains("\"status\":\"ACTIVE\""));
        }
        
        @Test
        @DisplayName("Должен сериализовать массивы идентификаторов")
        void shouldSerializeIdArrays() {
            ProjectDto project = createFullProject();
            project.setTaskIds(Arrays.asList("task-1", "task-2"));
            
            String json = serializer.serialize(project);
            
            assertTrue(json.contains("\"taskIds\":[\"task-1\",\"task-2\"]"));
        }
        
        @Test
        @DisplayName("Должен экранировать спецсимволы в строках")
        void shouldEscapeSpecialCharacters() {
            ProjectDto project = new ProjectDto();
            project.setId(1L);
            project.setName("Test \"Project\" with\nnewline");
            
            String json = serializer.serialize(project);
            
            assertTrue(json.contains("\\\"Project\\\""));
            assertTrue(json.contains("\\n"));
        }
    }
    
    private ProjectDto createProjectWithDates() {
        ProjectDto project = new ProjectDto();
        project.setId(1L);
        project.setName("Test Project");
        project.setStartDate(LocalDateTime.of(2026, 1, 28, 10, 0, 0));
        project.setEndDate(LocalDateTime.of(2026, 2, 28, 18, 0, 0));
        return project;
    }
    
    private ProjectDto createFullProject() {
        ProjectDto project = createProjectWithDates();
        project.setDescription("Test Description");
        project.setStatus("ACTIVE");
        project.setPriority("HIGH");
        project.setProgress(50.0);
        return project;
    }
}
