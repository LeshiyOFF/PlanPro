package com.projectlibre1.serialization;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Assertions;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.task.Task;
import com.projectlibre1.resource.Resource;

/**
 * Tests for JSON serialization
 * Verifies correct operation of all components
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
class JsonSerializationTest {
    
    private JsonSerializationService service;
    
    @BeforeEach
    void setUp() {
        service = new JsonSerializationService();
    }
    
    @Test
    @DisplayName("Test project serialization")
    void testProjectSerialization() throws JsonProcessingException {
        Project project = new Project();
        project.setName("Test Project");
        project.setDescription("Test Description");
        project.setUniqueId(123L);
        
        String json = service.serializeProject(project);
        Assertions.assertNotNull(json);
        Assertions.assertTrue(json.contains("Test Project"));
        
        Project deserialized = service.deserializeProject(json);
        Assertions.assertNotNull(deserialized);
        Assertions.assertEquals("Test Project", deserialized.getName());
        Assertions.assertEquals("Test Description", deserialized.getDescription());
    }
    
    @Test
    @DisplayName("Test task serialization")
    void testTaskSerialization() throws JsonProcessingException {
        Task task = new Task();
        task.setName("Test Task");
        task.setDuration(8.0);
        task.setPriority(5);
        task.setUniqueId(456L);
        
        String json = service.serializeTask(task);
        Assertions.assertNotNull(json);
        Assertions.assertTrue(json.contains("Test Task"));
        
        Task deserialized = service.deserializeTask(json);
        Assertions.assertNotNull(deserialized);
        Assertions.assertEquals("Test Task", deserialized.getName());
        Assertions.assertEquals(8.0, deserialized.getDuration(), 0.01);
        Assertions.assertEquals(5, deserialized.getPriority());
    }
    
    @Test
    @DisplayName("Test resource serialization")
    void testResourceSerialization() throws JsonProcessingException {
        Resource resource = new Resource();
        resource.setName("Test Resource");
        resource.setMaxUnits(100.0);
        resource.setStandardRate(50.0);
        resource.setUniqueId(789L);
        
        String json = service.serializeResource(resource);
        Assertions.assertNotNull(json);
        Assertions.assertTrue(json.contains("Test Resource"));
        
        Resource deserialized = service.deserializeResource(json);
        Assertions.assertNotNull(deserialized);
        Assertions.assertEquals("Test Resource", deserialized.getName());
        Assertions.assertEquals(100.0, deserialized.getMaxUnits(), 0.01);
        Assertions.assertEquals(50.0, deserialized.getStandardRate(), 0.01);
    }
    
    @Test
    @DisplayName("Test factory pattern")
    void testFactoryPattern() {
        JsonSerializationFactory factory = JsonSerializationFactory.getInstance();
        Assertions.assertNotNull(factory);
        
        JsonSerializationPort projectSerializer = factory.getSerializerForType(Project.class);
        Assertions.assertNotNull(projectSerializer);
        Assertions.assertTrue(projectSerializer instanceof ProjectJsonSerializer);
        
        JsonSerializationPort taskSerializer = factory.getSerializerForType(Task.class);
        Assertions.assertNotNull(taskSerializer);
        Assertions.assertTrue(taskSerializer instanceof TaskJsonSerializer);
        
        JsonSerializationPort resourceSerializer = factory.getSerializerForType(Resource.class);
        Assertions.assertNotNull(resourceSerializer);
        Assertions.assertTrue(resourceSerializer instanceof ResourceJsonSerializer);
    }
    
    @Test
    @DisplayName("Test legacy adapter")
    void testLegacyAdapter() {
        LegacyJsonAdapter adapter = new LegacyJsonAdapter();
        
        Project project = new Project();
        project.setName("Legacy Test");
        
        String json = adapter.convertToJson(project);
        Assertions.assertNotNull(json);
        
        Project deserialized = adapter.convertFromJson(json, Project.class);
        Assertions.assertNotNull(deserialized);
        Assertions.assertEquals("Legacy Test", deserialized.getName());
    }
    
    @Test
    @DisplayName("Test null handling")
    void testNullHandling() throws JsonProcessingException {
        String nullJson = service.serializeProject(null);
        Assertions.assertNull(nullJson);
        
        Project nullProject = service.deserializeProject(null);
        Assertions.assertNull(nullProject);
    }
}