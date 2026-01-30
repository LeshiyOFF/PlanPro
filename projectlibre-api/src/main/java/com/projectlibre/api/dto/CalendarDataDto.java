package com.projectlibre.api.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO для передачи данных календаря на frontend.
 * Структура соответствует TypeScript interface Calendar в calendar-types.ts.
 * 
 * Clean Architecture: DTO (Interface Layer).
 * SOLID: Single Responsibility - только данные календаря для передачи.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class CalendarDataDto {
    
    private String id;
    private String name;
    private String description;
    private String type;
    private boolean[] workingDays;
    private List<WorkingHoursDto> workingHours;
    private List<CalendarExceptionDto> exceptions;
    private int hoursPerDay;
    
    public CalendarDataDto() {
        this.workingDays = new boolean[7];
        this.workingHours = new ArrayList<>();
        this.exceptions = new ArrayList<>();
        this.type = "custom";
        this.hoursPerDay = 8;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public boolean[] getWorkingDays() { return workingDays; }
    public void setWorkingDays(boolean[] workingDays) { this.workingDays = workingDays; }
    
    public List<WorkingHoursDto> getWorkingHours() { return workingHours; }
    public void setWorkingHours(List<WorkingHoursDto> workingHours) { 
        this.workingHours = workingHours; 
    }
    
    public List<CalendarExceptionDto> getExceptions() { return exceptions; }
    public void setExceptions(List<CalendarExceptionDto> exceptions) { 
        this.exceptions = exceptions; 
    }
    
    public int getHoursPerDay() { return hoursPerDay; }
    public void setHoursPerDay(int hoursPerDay) { this.hoursPerDay = hoursPerDay; }
    
    /**
     * DTO для рабочих часов.
     */
    public static class WorkingHoursDto {
        private int from;
        private int to;
        
        public WorkingHoursDto() {}
        
        public WorkingHoursDto(int from, int to) {
            this.from = from;
            this.to = to;
        }
        
        public int getFrom() { return from; }
        public void setFrom(int from) { this.from = from; }
        
        public int getTo() { return to; }
        public void setTo(int to) { this.to = to; }
    }
    
    /**
     * DTO для исключений в календаре (праздники, особые дни).
     */
    public static class CalendarExceptionDto {
        private String date;
        private boolean working;
        private Integer from;
        private Integer to;
        private String name;
        
        public CalendarExceptionDto() {}
        
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        
        public boolean isWorking() { return working; }
        public void setWorking(boolean working) { this.working = working; }
        
        public Integer getFrom() { return from; }
        public void setFrom(Integer from) { this.from = from; }
        
        public Integer getTo() { return to; }
        public void setTo(Integer to) { this.to = to; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
}
