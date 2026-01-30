package com.projectlibre.api.streaming;

import com.projectlibre.api.dto.ProjectDto;
import com.projectlibre.api.streaming.StreamingSerializerPort.ItemSerializer;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * JSON сериализатор для ProjectDto в потоковых операциях.
 * 
 * V2.0: Исправлена сериализация дат - используется ISO_FORMATTER
 * вместо прямого вызова toString() на LocalDateTime.
 * 
 * Clean Architecture: Adapter (Infrastructure Layer).
 * SOLID: Single Responsibility - только сериализация ProjectDto.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
public class ProjectItemSerializer implements ItemSerializer<ProjectDto> {
    
    private static final ProjectItemSerializer INSTANCE = new ProjectItemSerializer();
    
    /** ISO-8601 форматтер для LocalDateTime. */
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    public static ProjectItemSerializer getInstance() { 
        return INSTANCE; 
    }
    
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
        
        appendDateField(sb, "startDate", project.getStartDate());
        appendDateField(sb, "endDate", project.getEndDate());
        
        appendIds(sb, "taskIds", project.getTaskIds());
        appendIds(sb, "resourceIds", project.getResourceIds());
        
        sb.append("}");
        return sb.toString();
    }
    
    /**
     * Добавляет поле даты с форматированием в ISO-8601.
     */
    private void appendDateField(StringBuilder sb, String name, LocalDateTime date) {
        if (date == null) return;
        String formattedDate = date.format(ISO_FORMATTER);
        sb.append(",\"").append(name).append("\":\"").append(formattedDate).append("\"");
    }
    
    /**
     * Добавляет обычное поле с автоматическим определением типа.
     */
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
    
    /**
     * Добавляет массив идентификаторов.
     */
    private void appendIds(StringBuilder sb, String name, List<String> ids) {
        if (ids == null || ids.isEmpty()) return;
        
        sb.append(",\"").append(name).append("\":[");
        for (int i = 0; i < ids.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(ids.get(i)).append("\"");
        }
        sb.append("]");
    }
    
    /**
     * Экранирует спецсимволы для JSON.
     */
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
}
