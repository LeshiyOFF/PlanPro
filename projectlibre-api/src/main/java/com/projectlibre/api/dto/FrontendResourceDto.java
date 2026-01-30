package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO ресурса из Frontend для синхронизации с Core.
 * Соответствует FrontendResourceData interface из TypeScript.
 * 
 * КРИТИЧЕСКОЕ V2.0:
 * - Добавлено поле calendarData для передачи полных настроек календаря
 * - Это исправляет баг с потерей настроек кастомных календарей
 * 
 * Clean Architecture: Data Transfer Object (Interface Adapters Layer).
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class FrontendResourceDto {
    
    private String id;
    private String name;
    private String type;
    private double maxUnits;
    private double standardRate;
    private double overtimeRate;
    private double costPerUse;
    private String calendarId;
    
    /**
     * Полные данные календаря для синхронизации.
     * КРИТИЧЕСКОЕ: Если указан calendarData, применяются настройки WorkWeek.
     * Это исправляет баг с потерей настроек кастомных календарей.
     */
    private CalendarSyncDto calendarData;
    
    private String materialLabel;
    private String email;
    private String group;
    private Boolean available;
    
    public FrontendResourceDto() {}
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public double getMaxUnits() { return maxUnits; }
    public void setMaxUnits(double maxUnits) { this.maxUnits = maxUnits; }
    
    public double getStandardRate() { return standardRate; }
    public void setStandardRate(double standardRate) { this.standardRate = standardRate; }
    
    public double getOvertimeRate() { return overtimeRate; }
    public void setOvertimeRate(double overtimeRate) { this.overtimeRate = overtimeRate; }
    
    public double getCostPerUse() { return costPerUse; }
    public void setCostPerUse(double costPerUse) { this.costPerUse = costPerUse; }
    
    public String getCalendarId() { return calendarId; }
    public void setCalendarId(String calendarId) { this.calendarId = calendarId; }
    
    public CalendarSyncDto getCalendarData() { return calendarData; }
    public void setCalendarData(CalendarSyncDto calendarData) { this.calendarData = calendarData; }
    
    public String getMaterialLabel() { return materialLabel; }
    public void setMaterialLabel(String materialLabel) { this.materialLabel = materialLabel; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getGroup() { return group; }
    public void setGroup(String group) { this.group = group; }
    
    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
    
    /**
     * Проверяет, есть ли полные данные календаря для синхронизации.
     */
    public boolean hasCalendarData() {
        return calendarData != null && calendarData.getName() != null;
    }
}
