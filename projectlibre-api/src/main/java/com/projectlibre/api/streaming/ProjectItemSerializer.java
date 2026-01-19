package com.projectlibre.api.streaming;

import com.projectlibre.api.dto.ProjectDto;
import com.projectlibre.api.streaming.StreamingSerializerPort.ItemSerializer;
import java.util.List;

/**
 * Project-specific JSON serializer for streaming operations
 * Handles project metadata serialization
 */
public class ProjectItemSerializer implements ItemSerializer<ProjectDto> {
    
    private static final ProjectItemSerializer INSTANCE = new ProjectItemSerializer();
    
    public static ProjectItemSerializer getInstance() { return INSTANCE; }
    
    private ProjectItemSerializer() {}
    
    @Override
    public String serialize(ProjectDto project) {
        StringBuilder sb = new StringBuilder(1024);
        sb.append("{");
        
        appendField(sb, "id", project.getId(), true);
        appendField(sb, "name", project.getName(), false);
        appendField(sb, "description", project.getDescription(), false);
        appendField(sb, "status", project.getStatus(), false);
        appendField(sb, "priority", project.getPriority(), false);
        appendField(sb, "progress", project.getProgress(), false);
        appendField(sb, "manager", project.getManager(), false);
        appendField(sb, "department", project.getDepartment(), false);
        
        if (project.getStartDate() != null) {
            sb.append(",\"startDate\":\"").append(project.getStartDate()).append("\"");
        }
        if (project.getEndDate() != null) {
            sb.append(",\"endDate\":\"").append(project.getEndDate()).append("\"");
        }
        
        appendIds(sb, "taskIds", project.getTaskIds());
        appendIds(sb, "resourceIds", project.getResourceIds());
        
        sb.append("}");
        return sb.toString();
    }
    
    private void appendField(StringBuilder sb, String name, Object value, boolean first) {
        if (value == null) return;
        
        if (!first) sb.append(",");
        sb.append("\"").append(name).append("\":");
        
        if (value instanceof String) {
            sb.append("\"").append(escapeJson((String) value)).append("\"");
        } else if (value instanceof Number) {
            sb.append(value);
        } else {
            sb.append("\"").append(value).append("\"");
        }
    }
    
    private void appendIds(StringBuilder sb, String name, List<String> ids) {
        if (ids == null || ids.isEmpty()) return;
        
        sb.append(",\"").append(name).append("\":[");
        for (int i = 0; i < ids.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(ids.get(i)).append("\"");
        }
        sb.append("]");
    }
    
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
}
