package com.projectlibre.api.cache;

import java.sql.*;
import java.util.*;

/**
 * H2 database adapter for query cache
 * Provides fast in-memory filtering and search
 */
public class H2QueryCacheAdapter implements QueryCachePort {
    
    private static volatile H2QueryCacheAdapter instance;
    private static final Object LOCK = new Object();
    
    private Connection connection;
    private boolean initialized = false;
    
    private H2QueryCacheAdapter() {
        initializeDatabase();
    }
    
    public static H2QueryCacheAdapter getInstance() {
        H2QueryCacheAdapter result = instance;
        if (result == null) {
            synchronized (LOCK) {
                result = instance;
                if (result == null) {
                    instance = result = new H2QueryCacheAdapter();
                }
            }
        }
        return result;
    }
    
    private void initializeDatabase() {
        try {
            connection = DriverManager.getConnection("jdbc:h2:mem:projectcache;DB_CLOSE_DELAY=-1", "sa", "");
            createTables();
            initialized = true;
            System.out.println("[H2Cache] Database initialized successfully");
        } catch (SQLException e) {
            System.err.println("[H2Cache] Failed to initialize: " + e.getMessage());
        }
    }
    
    private void createTables() throws SQLException {
        String[] ddl = {
            "CREATE TABLE IF NOT EXISTS projects (id BIGINT PRIMARY KEY, name VARCHAR(255), " +
            "start_date BIGINT, end_date BIGINT, status VARCHAR(50), manager VARCHAR(255))",
            "CREATE TABLE IF NOT EXISTS tasks (id BIGINT PRIMARY KEY, project_id BIGINT, " +
            "name VARCHAR(255), start_date BIGINT, end_date BIGINT, progress INT, critical BOOLEAN)",
            "CREATE TABLE IF NOT EXISTS resources (id BIGINT PRIMARY KEY, name VARCHAR(255), " +
            "type VARCHAR(50), cost DOUBLE)",
            "CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id)",
            "CREATE INDEX IF NOT EXISTS idx_tasks_critical ON tasks(critical)",
            "CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)"
        };
        try (Statement stmt = connection.createStatement()) {
            for (String sql : ddl) stmt.execute(sql);
        }
    }
    
    @Override
    public void syncEntity(String tableName, Long id, Map<String, Object> data) {
        if (!initialized) return;
        try {
            removeEntity(tableName, id);
            insertEntity(tableName, id, data);
        } catch (Exception e) {
            System.err.println("[H2Cache] Sync error: " + e.getMessage());
        }
    }
    
    private void insertEntity(String tableName, Long id, Map<String, Object> data) throws SQLException {
        StringBuilder cols = new StringBuilder("id");
        StringBuilder vals = new StringBuilder("?");
        List<Object> params = new ArrayList<>();
        params.add(id);
        
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            cols.append(", ").append(entry.getKey());
            vals.append(", ?");
            params.add(entry.getValue());
        }
        
        String sql = String.format("INSERT INTO %s (%s) VALUES (%s)", tableName, cols, vals);
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            ps.executeUpdate();
        }
    }
    
    @Override
    public void syncEntities(String tableName, List<Map<String, Object>> entities) {
        for (Map<String, Object> entity : entities) {
            Long id = ((Number) entity.get("id")).longValue();
            syncEntity(tableName, id, entity);
        }
    }
    
    @Override
    public List<Map<String, Object>> findByField(String tableName, String fieldName, Object value) {
        String sql = String.format("SELECT * FROM %s WHERE %s = ?", tableName, fieldName);
        return executeQuery(sql, value);
    }
    
    @Override
    public List<Map<String, Object>> search(String tableName, List<String> searchFields, String query) {
        StringBuilder where = new StringBuilder();
        for (int i = 0; i < searchFields.size(); i++) {
            if (i > 0) where.append(" OR ");
            where.append("LOWER(").append(searchFields.get(i)).append(") LIKE ?");
        }
        String sql = String.format("SELECT * FROM %s WHERE %s", tableName, where);
        Object[] params = new Object[searchFields.size()];
        Arrays.fill(params, "%" + query.toLowerCase() + "%");
        return executeQuery(sql, params);
    }
    
    @Override
    public List<Map<String, Object>> executeQuery(String sql, Object... params) {
        List<Map<String, Object>> results = new ArrayList<>();
        if (!initialized) return results;
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }
            try (ResultSet rs = ps.executeQuery()) {
                ResultSetMetaData meta = rs.getMetaData();
                int cols = meta.getColumnCount();
                while (rs.next()) {
                    Map<String, Object> row = new HashMap<>();
                    for (int i = 1; i <= cols; i++) {
                        row.put(meta.getColumnName(i).toLowerCase(), rs.getObject(i));
                    }
                    results.add(row);
                }
            }
        } catch (SQLException e) {
            System.err.println("[H2Cache] Query error: " + e.getMessage());
        }
        return results;
    }
    
    @Override
    public long countByField(String tableName, String fieldName, Object value) {
        String sql = String.format("SELECT COUNT(*) FROM %s WHERE %s = ?", tableName, fieldName);
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setObject(1, value);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getLong(1);
            }
        } catch (SQLException e) {
            System.err.println("[H2Cache] Count error: " + e.getMessage());
        }
        return 0;
    }
    
    @Override
    public void removeEntity(String tableName, Long id) {
        if (!initialized) return;
        String sql = String.format("DELETE FROM %s WHERE id = ?", tableName);
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();
        } catch (SQLException e) { /* ignore */ }
    }
    
    @Override
    public void clearTable(String tableName) {
        if (!initialized) return;
        try (Statement stmt = connection.createStatement()) {
            stmt.execute("DELETE FROM " + tableName);
        } catch (SQLException e) { /* ignore */ }
    }
    
    @Override
    public void clearAll() {
        clearTable("tasks");
        clearTable("resources");
        clearTable("projects");
    }
    
    @Override
    public boolean isInitialized() { return initialized; }
}
