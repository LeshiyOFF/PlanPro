/*******************************************************************************
 * Tests for JSON serialization utilities
 * Tests basic JSON operations without requiring full ProjectLibre initialization
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 *******************************************************************************/
package com.projectlibre1.serialization;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Assertions;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

/**
 * Isolated tests for JSON serialization logic.
 * Uses simple POJOs instead of legacy ProjectLibre objects.
 */
class JsonSerializationTest {
    
    /**
     * Simple DTO for testing serialization
     */
    static class TestProject {
        private String name;
        private String description;
        private long uniqueId;
        private List<TestTask> tasks = new ArrayList<>();
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public long getUniqueId() { return uniqueId; }
        public void setUniqueId(long uniqueId) { this.uniqueId = uniqueId; }
        
        public List<TestTask> getTasks() { return tasks; }
        public void addTask(TestTask task) { tasks.add(task); }
    }
    
    /**
     * Simple Task DTO for testing
     */
    static class TestTask {
        private String name;
        private double duration;
        private int priority;
        private long uniqueId;
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public double getDuration() { return duration; }
        public void setDuration(double duration) { this.duration = duration; }
        
        public int getPriority() { return priority; }
        public void setPriority(int priority) { this.priority = priority; }
        
        public long getUniqueId() { return uniqueId; }
        public void setUniqueId(long uniqueId) { this.uniqueId = uniqueId; }
    }
    
    /**
     * Simple Resource DTO for testing
     */
    static class TestResource {
        private String name;
        private double maxUnits;
        private double standardRate;
        private long uniqueId;
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public double getMaxUnits() { return maxUnits; }
        public void setMaxUnits(double maxUnits) { this.maxUnits = maxUnits; }
        
        public double getStandardRate() { return standardRate; }
        public void setStandardRate(double standardRate) { this.standardRate = standardRate; }
        
        public long getUniqueId() { return uniqueId; }
        public void setUniqueId(long uniqueId) { this.uniqueId = uniqueId; }
    }
    
    /**
     * Simple JSON-like serializer for testing purposes
     */
    static class SimpleSerializer {
        
        public Map<String, Object> serializeProject(TestProject project) {
            if (project == null) return null;
            
            Map<String, Object> json = new HashMap<>();
            json.put("name", project.getName());
            json.put("description", project.getDescription());
            json.put("uniqueId", project.getUniqueId());
            
            List<Map<String, Object>> tasksList = new ArrayList<>();
            for (TestTask task : project.getTasks()) {
                tasksList.add(serializeTask(task));
            }
            json.put("tasks", tasksList);
            
            return json;
        }
        
        public Map<String, Object> serializeTask(TestTask task) {
            if (task == null) return null;
            
            Map<String, Object> json = new HashMap<>();
            json.put("name", task.getName());
            json.put("duration", task.getDuration());
            json.put("priority", task.getPriority());
            json.put("uniqueId", task.getUniqueId());
            return json;
        }
        
        public Map<String, Object> serializeResource(TestResource resource) {
            if (resource == null) return null;
            
            Map<String, Object> json = new HashMap<>();
            json.put("name", resource.getName());
            json.put("maxUnits", resource.getMaxUnits());
            json.put("standardRate", resource.getStandardRate());
            json.put("uniqueId", resource.getUniqueId());
            return json;
        }
        
        public TestProject deserializeProject(Map<String, Object> json) {
            if (json == null) return null;
            
            TestProject project = new TestProject();
            project.setName((String) json.get("name"));
            project.setDescription((String) json.get("description"));
            project.setUniqueId(((Number) json.get("uniqueId")).longValue());
            return project;
        }
        
        public TestTask deserializeTask(Map<String, Object> json) {
            if (json == null) return null;
            
            TestTask task = new TestTask();
            task.setName((String) json.get("name"));
            task.setDuration(((Number) json.get("duration")).doubleValue());
            task.setPriority(((Number) json.get("priority")).intValue());
            task.setUniqueId(((Number) json.get("uniqueId")).longValue());
            return task;
        }
        
        public TestResource deserializeResource(Map<String, Object> json) {
            if (json == null) return null;
            
            TestResource resource = new TestResource();
            resource.setName((String) json.get("name"));
            resource.setMaxUnits(((Number) json.get("maxUnits")).doubleValue());
            resource.setStandardRate(((Number) json.get("standardRate")).doubleValue());
            resource.setUniqueId(((Number) json.get("uniqueId")).longValue());
            return resource;
        }
    }
    
    private SimpleSerializer serializer;
    
    @BeforeEach
    void setUp() {
        serializer = new SimpleSerializer();
    }
    
    @Test
    @DisplayName("Test project serialization")
    void testProjectSerialization() {
        TestProject project = new TestProject();
        project.setName("Test Project");
        project.setDescription("Test Description");
        project.setUniqueId(123L);
        
        Map<String, Object> json = serializer.serializeProject(project);
        
        Assertions.assertNotNull(json, "JSON should not be null");
        Assertions.assertEquals("Test Project", json.get("name"));
        Assertions.assertEquals("Test Description", json.get("description"));
        Assertions.assertEquals(123L, json.get("uniqueId"));
        
        TestProject deserialized = serializer.deserializeProject(json);
        
        Assertions.assertNotNull(deserialized);
        Assertions.assertEquals("Test Project", deserialized.getName());
        Assertions.assertEquals("Test Description", deserialized.getDescription());
    }
    
    @Test
    @DisplayName("Test task serialization")
    void testTaskSerialization() {
        TestTask task = new TestTask();
        task.setName("Test Task");
        task.setDuration(8.0);
        task.setPriority(5);
        task.setUniqueId(456L);
        
        Map<String, Object> json = serializer.serializeTask(task);
        
        Assertions.assertNotNull(json);
        Assertions.assertEquals("Test Task", json.get("name"));
        Assertions.assertEquals(8.0, json.get("duration"));
        Assertions.assertEquals(5, json.get("priority"));
        
        TestTask deserialized = serializer.deserializeTask(json);
        
        Assertions.assertNotNull(deserialized);
        Assertions.assertEquals("Test Task", deserialized.getName());
        Assertions.assertEquals(8.0, deserialized.getDuration(), 0.01);
        Assertions.assertEquals(5, deserialized.getPriority());
    }
    
    @Test
    @DisplayName("Test resource serialization")
    void testResourceSerialization() {
        TestResource resource = new TestResource();
        resource.setName("Test Resource");
        resource.setMaxUnits(100.0);
        resource.setStandardRate(50.0);
        resource.setUniqueId(789L);
        
        Map<String, Object> json = serializer.serializeResource(resource);
        
        Assertions.assertNotNull(json);
        Assertions.assertEquals("Test Resource", json.get("name"));
        Assertions.assertEquals(100.0, json.get("maxUnits"));
        Assertions.assertEquals(50.0, json.get("standardRate"));
        
        TestResource deserialized = serializer.deserializeResource(json);
        
        Assertions.assertNotNull(deserialized);
        Assertions.assertEquals("Test Resource", deserialized.getName());
        Assertions.assertEquals(100.0, deserialized.getMaxUnits(), 0.01);
        Assertions.assertEquals(50.0, deserialized.getStandardRate(), 0.01);
    }
    
    @Test
    @DisplayName("Test null handling")
    void testNullHandling() {
        Map<String, Object> nullJson = serializer.serializeProject(null);
        Assertions.assertNull(nullJson, "Null input should return null");
        
        TestProject nullProject = serializer.deserializeProject(null);
        Assertions.assertNull(nullProject, "Null JSON should return null");
    }
    
    @Test
    @DisplayName("Test project with tasks")
    void testProjectWithTasks() {
        TestProject project = new TestProject();
        project.setName("Project with Tasks");
        project.setUniqueId(100L);
        
        TestTask task1 = new TestTask();
        task1.setName("Task 1");
        task1.setDuration(8.0);
        
        TestTask task2 = new TestTask();
        task2.setName("Task 2");
        task2.setDuration(16.0);
        
        project.addTask(task1);
        project.addTask(task2);
        
        Map<String, Object> json = serializer.serializeProject(project);
        
        Assertions.assertNotNull(json);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> tasks = (List<Map<String, Object>>) json.get("tasks");
        Assertions.assertEquals(2, tasks.size(), "Should have 2 tasks");
        Assertions.assertEquals("Task 1", tasks.get(0).get("name"));
        Assertions.assertEquals("Task 2", tasks.get(1).get("name"));
    }
}
