package com.projectlibre.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * DTO для синхронизации полных данных календаря между Frontend и Core.
 * 
 * Решает критическую проблему: передача настроек WorkWeek (рабочие дни, часы)
 * от фронтенда на бэкенд при создании/обновлении кастомных календарей.
 * 
 * Clean Architecture: DTO (Interface Adapters Layer).
 * SOLID: Single Responsibility - только транспорт данных календаря.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class CalendarSyncDto {
    
    @NotBlank(message = "Calendar ID is required")
    private String id;
    
    @NotBlank(message = "Calendar name is required")
    @Size(min = 1, max = 255, message = "Calendar name must be between 1 and 255 characters")
    private String name;
    
    private String description;
    
    @NotNull(message = "Working days array is required")
    @Size(min = 7, max = 7, message = "Working days must contain exactly 7 elements")
    private boolean[] workingDays;
    
    @NotNull(message = "Working hours list is required")
    private List<WorkingHoursRangeDto> workingHours;
    
    private int hoursPerDay;
    
    private String templateType;
    
    public CalendarSyncDto() {
        this.workingDays = new boolean[7];
        this.hoursPerDay = 8;
    }
    
    // === Getters ===
    
    public String getId() {
        return id;
    }
    
    public String getName() {
        return name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public boolean[] getWorkingDays() {
        return workingDays;
    }
    
    public List<WorkingHoursRangeDto> getWorkingHours() {
        return workingHours;
    }
    
    public int getHoursPerDay() {
        return hoursPerDay;
    }
    
    public String getTemplateType() {
        return templateType;
    }
    
    // === Setters ===
    
    public void setId(String id) {
        this.id = id;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public void setWorkingDays(boolean[] workingDays) {
        this.workingDays = workingDays;
    }
    
    public void setWorkingHours(List<WorkingHoursRangeDto> workingHours) {
        this.workingHours = workingHours;
    }
    
    public void setHoursPerDay(int hoursPerDay) {
        this.hoursPerDay = hoursPerDay;
    }
    
    public void setTemplateType(String templateType) {
        this.templateType = templateType;
    }
    
    // === Utility Methods ===
    
    /**
     * Подсчитывает количество рабочих дней в неделе.
     */
    public int getWorkingDaysCount() {
        if (workingDays == null) return 0;
        int count = 0;
        for (boolean isWorking : workingDays) {
            if (isWorking) count++;
        }
        return count;
    }
    
    /**
     * Проверяет, является ли указанный день рабочим.
     * @param dayIndex индекс дня (0 = воскресенье, 1 = понедельник, ...)
     */
    public boolean isDayWorking(int dayIndex) {
        if (workingDays == null || dayIndex < 0 || dayIndex >= workingDays.length) {
            return false;
        }
        return workingDays[dayIndex];
    }
    
    /**
     * Проверяет, является ли это кастомным календарём.
     */
    public boolean isCustomCalendar() {
        return id != null && id.startsWith("custom_");
    }
    
    @Override
    public String toString() {
        return "CalendarSyncDto{" +
            "id='" + id + '\'' +
            ", name='" + name + '\'' +
            ", workingDaysCount=" + getWorkingDaysCount() +
            ", hoursPerDay=" + hoursPerDay +
            '}';
    }
    
    /**
     * DTO для диапазона рабочих часов.
     */
    public static class WorkingHoursRangeDto {
        
        private int from;
        private int to;
        
        public WorkingHoursRangeDto() {}
        
        public WorkingHoursRangeDto(int from, int to) {
            this.from = from;
            this.to = to;
        }
        
        public int getFrom() {
            return from;
        }
        
        public void setFrom(int from) {
            this.from = from;
        }
        
        public int getTo() {
            return to;
        }
        
        public void setTo(int to) {
            this.to = to;
        }
        
        /**
         * Вычисляет продолжительность в часах.
         */
        public int getDurationHours() {
            return to - from;
        }
        
        /**
         * Проверяет валидность диапазона.
         */
        public boolean isValid() {
            return from >= 0 && from <= 23 && to >= 0 && to <= 24 && from < to;
        }
        
        @Override
        public String toString() {
            return from + ":00-" + to + ":00";
        }
    }
}
