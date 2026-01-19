package com.projectlibre.api.streaming;

import com.projectlibre.api.dto.TaskDto;
import com.projectlibre.api.streaming.StreamingSerializerPort.ItemSerializer;

/**
 * Task-specific JSON serializer for streaming operations
 * Optimized for large task lists (1000+ items)
 */
public class TaskItemSerializer implements ItemSerializer<TaskDto> {
    
    private static final TaskItemSerializer INSTANCE = new TaskItemSerializer();
    
    public static TaskItemSerializer getInstance() { return INSTANCE; }
    
    private TaskItemSerializer() {}
    
    @Override
    public String serialize(TaskDto task) {
        StringBuilder sb = new StringBuilder(512);
        sb.append("{");
        
        appendField(sb, "id", task.getId(), true);
        appendField(sb, "name", task.getName(), false);
        appendField(sb, "status", task.getStatus(), false);
        appendField(sb, "priority", task.getPriority(), false);
        appendField(sb, "progress", task.getProgress(), false);
        appendField(sb, "projectId", task.getProjectId(), false);
        appendField(sb, "assignee", task.getAssignee(), false);
        appendField(sb, "type", task.getType(), false);
        
        if (task.getStartDate() != null) {
            sb.append(",\"startDate\":\"").append(task.getStartDate()).append("\"");
        }
        if (task.getEndDate() != null) {
            sb.append(",\"endDate\":\"").append(task.getEndDate()).append("\"");
        }
        if (task.getDueDate() != null) {
            sb.append(",\"dueDate\":\"").append(task.getDueDate()).append("\"");
        }
        if (task.getEstimatedHours() != null) {
            sb.append(",\"estimatedHours\":").append(task.getEstimatedHours());
        }
        if (task.getActualHours() != null) {
            sb.append(",\"actualHours\":").append(task.getActualHours());
        }
        
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
    
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
}
