package com.projectlibre.api.cache;

import java.util.*;

/**
 * Hybrid repository adapter combining H2 cache with .pod file storage
 * H2 = fast queries, .pod files = authoritative persistence
 */
public class HybridRepositoryAdapter implements HybridRepositoryPort {
    
    private static volatile HybridRepositoryAdapter instance;
    private static final Object LOCK = new Object();
    
    private final QueryCachePort queryCache;
    private final FileStoragePort fileStorage;
    
    private HybridRepositoryAdapter() {
        this.queryCache = H2QueryCacheAdapter.getInstance();
        this.fileStorage = PodFileStorageAdapter.getInstance();
    }
    
    public static HybridRepositoryAdapter getInstance() {
        HybridRepositoryAdapter result = instance;
        if (result == null) {
            synchronized (LOCK) {
                result = instance;
                if (result == null) {
                    instance = result = new HybridRepositoryAdapter();
                }
            }
        }
        return result;
    }
    
    @Override
    public boolean saveProject(Long projectId, Map<String, Object> projectData, String filePath) {
        byte[] serialized = serializeProject(projectData);
        if (serialized == null) return false;
        
        fileStorage.createBackup(filePath);
        boolean saved = fileStorage.saveToFile(projectId, filePath, serialized);
        
        if (saved) {
            syncToCache(projectId, projectData);
            System.out.println("[HybridRepo] Project saved and synced: " + projectId);
        }
        return saved;
    }
    
    @Override
    public Optional<Map<String, Object>> loadProject(String filePath) {
        byte[] data = fileStorage.loadFromFile(filePath);
        if (data == null) return Optional.empty();
        
        Map<String, Object> projectData = deserializeProject(data);
        if (projectData == null) return Optional.empty();
        
        Long projectId = extractProjectId(projectData);
        if (projectId != null) {
            syncToCache(projectId, projectData);
            System.out.println("[HybridRepo] Project loaded and cached: " + projectId);
        }
        return Optional.of(projectData);
    }
    
    @Override
    public List<Map<String, Object>> findProjectsByField(String fieldName, Object value) {
        return queryCache.findByField("projects", fieldName, value);
    }
    
    @Override
    public List<Map<String, Object>> searchProjects(String query) {
        return queryCache.search("projects", Arrays.asList("name", "manager"), query);
    }
    
    @Override
    public List<Map<String, Object>> findTasksByProject(Long projectId) {
        return queryCache.findByField("tasks", "project_id", projectId);
    }
    
    @Override
    public List<Map<String, Object>> findCriticalTasks(Long projectId) {
        String sql = "SELECT * FROM tasks WHERE project_id = ? AND critical = true";
        return queryCache.executeQuery(sql, projectId);
    }
    
    @Override
    public List<Map<String, Object>> searchTasks(Long projectId, String query) {
        String sql = "SELECT * FROM tasks WHERE project_id = ? AND LOWER(name) LIKE ?";
        return queryCache.executeQuery(sql, projectId, "%" + query.toLowerCase() + "%");
    }
    
    @Override
    public long countTasksByStatus(Long projectId, String status) {
        String sql = "SELECT COUNT(*) as cnt FROM tasks WHERE project_id = ?";
        List<Map<String, Object>> result = queryCache.executeQuery(sql, projectId);
        if (!result.isEmpty()) {
            Object cnt = result.get(0).get("cnt");
            return cnt instanceof Number ? ((Number) cnt).longValue() : 0;
        }
        return 0;
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public void syncToCache(Long projectId, Map<String, Object> projectData) {
        Map<String, Object> projectCache = extractProjectFields(projectData);
        queryCache.syncEntity("projects", projectId, projectCache);
        
        List<Map<String, Object>> tasks = (List<Map<String, Object>>) projectData.get("tasks");
        if (tasks != null) {
            for (Map<String, Object> task : tasks) {
                Long taskId = extractId(task);
                if (taskId != null) {
                    Map<String, Object> taskCache = extractTaskFields(task, projectId);
                    queryCache.syncEntity("tasks", taskId, taskCache);
                }
            }
        }
        
        List<Map<String, Object>> resources = (List<Map<String, Object>>) projectData.get("resources");
        if (resources != null) {
            for (Map<String, Object> resource : resources) {
                Long resourceId = extractId(resource);
                if (resourceId != null) {
                    queryCache.syncEntity("resources", resourceId, resource);
                }
            }
        }
    }
    
    private Map<String, Object> extractProjectFields(Map<String, Object> data) {
        Map<String, Object> fields = new HashMap<>();
        fields.put("name", data.get("name"));
        fields.put("start_date", data.get("startDate"));
        fields.put("end_date", data.get("endDate"));
        fields.put("status", data.get("status"));
        fields.put("manager", data.get("manager"));
        return fields;
    }
    
    private Map<String, Object> extractTaskFields(Map<String, Object> task, Long projectId) {
        Map<String, Object> fields = new HashMap<>();
        fields.put("project_id", projectId);
        fields.put("name", task.get("name"));
        fields.put("start_date", task.get("startDate"));
        fields.put("end_date", task.get("endDate"));
        fields.put("progress", task.get("progress"));
        fields.put("critical", task.get("critical"));
        return fields;
    }
    
    private Long extractProjectId(Map<String, Object> data) { return extractId(data); }
    
    private Long extractId(Map<String, Object> data) {
        Object id = data.get("id");
        return id instanceof Number ? ((Number) id).longValue() : null;
    }
    
    private byte[] serializeProject(Map<String, Object> data) {
        try {
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            java.io.ObjectOutputStream oos = new java.io.ObjectOutputStream(baos);
            oos.writeObject(new HashMap<>(data));
            oos.close();
            return baos.toByteArray();
        } catch (Exception e) {
            System.err.println("[HybridRepo] Serialization failed: " + e.getMessage());
            return null;
        }
    }
    
    @SuppressWarnings("unchecked")
    private Map<String, Object> deserializeProject(byte[] data) {
        try {
            java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(data);
            java.io.ObjectInputStream ois = new java.io.ObjectInputStream(bais);
            return (Map<String, Object>) ois.readObject();
        } catch (Exception e) {
            System.err.println("[HybridRepo] Deserialization failed: " + e.getMessage());
            return null;
        }
    }
    
    @Override
    public void removeFromCache(Long projectId) {
        queryCache.removeEntity("projects", projectId);
        queryCache.executeQuery("DELETE FROM tasks WHERE project_id = ?", projectId);
    }
    
    @Override
    public void clearCache() { queryCache.clearAll(); }
    
    @Override
    public boolean isCacheAvailable() { return queryCache.isInitialized(); }
}
