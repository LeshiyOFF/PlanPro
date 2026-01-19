package com.projectlibre.api.model;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Модель ресурса для ProjectLibre API
 * Содержит основные поля и методы для управления ресурсами проекта
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class Resource extends BaseEntity {
    
    private String name;
    private String type;
    private String description;
    private String status;
    private String email;
    private String department;
    private String role;
    private Double hourlyRate;
    private Double maxHoursPerDay;
    private Double maxHoursPerWeek;
    private List<Long> projectIds;
    private List<String> skills;
    private String availability;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String location;
    private String phone;

    /**
     * Конструктор по умолчанию
     */
    public Resource() {
        super();
        this.type = "HUMAN";
        this.status = "ACTIVE";
        this.availability = "AVAILABLE";
        this.projectIds = new ArrayList<>();
        this.skills = new ArrayList<>();
        this.maxHoursPerDay = 8.0;
        this.maxHoursPerWeek = 40.0;
    }

    /**
     * Конструктор с параметрами
     */
    public Resource(String name, String type, String email) {
        this();
        this.name = name;
        this.type = type;
        this.email = email;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; this.updatedAt = LocalDateTime.now(); }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; this.updatedAt = LocalDateTime.now(); }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; this.updatedAt = LocalDateTime.now(); }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; this.updatedAt = LocalDateTime.now(); }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; this.updatedAt = LocalDateTime.now(); }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; this.updatedAt = LocalDateTime.now(); }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; this.updatedAt = LocalDateTime.now(); }
    
    public Double getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(Double hourlyRate) { this.hourlyRate = Math.max(0.0, hourlyRate); this.updatedAt = LocalDateTime.now(); }
    
    public Double getMaxHoursPerDay() { return maxHoursPerDay; }
    public void setMaxHoursPerDay(Double maxHoursPerDay) { this.maxHoursPerDay = Math.max(0.0, maxHoursPerDay); this.updatedAt = LocalDateTime.now(); }
    
    public Double getMaxHoursPerWeek() { return maxHoursPerWeek; }
    public void setMaxHoursPerWeek(Double maxHoursPerWeek) { this.maxHoursPerWeek = Math.max(0.0, maxHoursPerWeek); this.updatedAt = LocalDateTime.now(); }
    
    public List<Long> getProjectIds() { return new ArrayList<>(projectIds); }
    public void setProjectIds(List<Long> projectIds) { this.projectIds = new ArrayList<>(projectIds); this.updatedAt = LocalDateTime.now(); }
    
    public List<String> getSkills() { return new ArrayList<>(skills); }
    public void setSkills(List<String> skills) { this.skills = new ArrayList<>(skills); this.updatedAt = LocalDateTime.now(); }
    
    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; this.updatedAt = LocalDateTime.now(); }
    
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; this.updatedAt = LocalDateTime.now(); }
    
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; this.updatedAt = LocalDateTime.now(); }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; this.updatedAt = LocalDateTime.now(); }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; this.updatedAt = LocalDateTime.now(); }

    // Business methods
    public void addProject(Long projectId) {
        if (projectId != null && !projectIds.contains(projectId)) {
            this.projectIds.add(projectId);
            this.updatedAt = LocalDateTime.now();
        }
    }

    public void removeProject(Long projectId) {
        if (projectIds.remove(projectId)) {
            this.updatedAt = LocalDateTime.now();
        }
    }

    public void addSkill(String skill) {
        if (skill != null && !skill.trim().isEmpty() && !skills.contains(skill)) {
            this.skills.add(skill);
            this.updatedAt = LocalDateTime.now();
        }
    }

    public void removeSkill(String skill) {
        if (skills.remove(skill)) {
            this.updatedAt = LocalDateTime.now();
        }
    }

    public boolean isActive() {
        return "ACTIVE".equals(status) && isAvailable();
    }

    public boolean isAvailable() {
        return "AVAILABLE".equals(availability) && isWithinAvailabilityPeriod();
    }

    public boolean isWithinAvailabilityPeriod() {
        LocalDateTime now = LocalDateTime.now();
        boolean afterStart = startDate == null || !now.isBefore(startDate);
        boolean beforeEnd = endDate == null || !now.isAfter(endDate);
        return afterStart && beforeEnd;
    }

    public boolean isHumanResource() {
        return "HUMAN".equals(type);
    }

    public boolean isMaterialResource() {
        return "MATERIAL".equals(type);
    }

    public boolean isFinancialResource() {
        return "FINANCIAL".equals(type);
    }

    public Double getCurrentLoad() {
        if (maxHoursPerWeek == null || maxHoursPerWeek <= 0) return 0.0;
        return (projectIds.size() * 10.0) / maxHoursPerWeek * 100.0;
    }

    public String getResourceSummary() {
        return String.format("Resource[id=%d]: %s (%s) - %s - %d projects",
            id, name, type, status, projectIds.size());
    }
}