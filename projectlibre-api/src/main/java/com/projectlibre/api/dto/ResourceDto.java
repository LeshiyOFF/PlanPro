package com.projectlibre.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/**
 * DTO для передачи данных ресурса между API и клиентом
 * Изолирует внутреннюю модель ресурса от внешнего представления
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ResourceDto extends BaseDto {
    
    @NotBlank(message = "Resource name is required")
    private String name;
    
    @NotNull(message = "Resource type is required")
    private String type;
    
    private String description;
    private String status;
    
    @Email(message = "Invalid email format")
    private String email;
    
    private String department;
    private String phone;
    private String location;
    
    @Min(value = 0, message = "Cost per hour must be positive")
    private Double costPerHour;
    
    private Boolean available;
    private List<String> skillIds;
    private List<String> projectIds;
    
    @Min(value = 0, message = "Total hours must be positive")
    private Integer totalHoursAssigned;
    
    private String notes;
    private LocalDateTime lastAssignedDate;
    private String reportingTo;
    
    public ResourceDto() {
        super();
    }
    
    public ResourceDto(String name, String type, String email, String department) {
        super();
        this.name = name;
        this.type = type;
        this.email = email;
        this.department = department;
        this.available = true;
    }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public Double getCostPerHour() { return costPerHour; }
    public void setCostPerHour(Double costPerHour) { this.costPerHour = costPerHour; }
    
    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
    
    public List<String> getSkillIds() { return skillIds; }
    public void setSkillIds(List<String> skillIds) { this.skillIds = skillIds; }
    
    public List<String> getProjectIds() { return projectIds; }
    public void setProjectIds(List<String> projectIds) { this.projectIds = projectIds; }
    
    public Integer getTotalHoursAssigned() { return totalHoursAssigned; }
    public void setTotalHoursAssigned(Integer totalHoursAssigned) { this.totalHoursAssigned = totalHoursAssigned; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public LocalDateTime getLastAssignedDate() { return lastAssignedDate; }
    public void setLastAssignedDate(LocalDateTime lastAssignedDate) { this.lastAssignedDate = lastAssignedDate; }
    
    public String getReportingTo() { return reportingTo; }
    public void setReportingTo(String reportingTo) { this.reportingTo = reportingTo; }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        ResourceDto that = (ResourceDto) o;
        return Objects.equals(name, that.name) &&
                Objects.equals(email, that.email) &&
                Objects.equals(department, that.department);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), name, email, department);
    }
    
    @Override
    public String toString() {
        return "ResourceDto{id=" + getId() + ", name='" + name + '\'' + '}';
    }
}