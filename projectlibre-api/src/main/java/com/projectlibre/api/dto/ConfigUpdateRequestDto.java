package com.projectlibre.api.dto;

import jakarta.validation.Valid;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO for configuration update requests.
 * Replaces Map<String, Object> with strongly typed POJO.
 * Does not extend BaseDto as it represents input data without server-generated id.
 * Follows SOLID: Single Responsibility Principle.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ConfigUpdateRequestDto {
    
    @Valid
    private GeneralPreferencesDto general;
    
    @Valid
    private CalculationPreferencesDto calculation;
    
    @Valid
    private DisplayPreferencesDto display;
    
    @Valid
    private EditingPreferencesDto editing;
    
    @Valid
    private SchedulePreferencesDto schedule;
    
    @Valid
    private CalendarPreferencesDto calendar;
    
    private Map<String, Object> additionalSettings;
    
    public ConfigUpdateRequestDto() {
    }
    
    public GeneralPreferencesDto getGeneral() {
        return general;
    }
    
    public void setGeneral(GeneralPreferencesDto general) {
        this.general = general;
    }
    
    public CalculationPreferencesDto getCalculation() {
        return calculation;
    }
    
    public void setCalculation(CalculationPreferencesDto calculation) {
        this.calculation = calculation;
    }
    
    public DisplayPreferencesDto getDisplay() {
        return display;
    }
    
    public void setDisplay(DisplayPreferencesDto display) {
        this.display = display;
    }
    
    public EditingPreferencesDto getEditing() {
        return editing;
    }
    
    public void setEditing(EditingPreferencesDto editing) {
        this.editing = editing;
    }
    
    public SchedulePreferencesDto getSchedule() {
        return schedule;
    }
    
    public void setSchedule(SchedulePreferencesDto schedule) {
        this.schedule = schedule;
    }
    
    public CalendarPreferencesDto getCalendar() {
        return calendar;
    }
    
    public void setCalendar(CalendarPreferencesDto calendar) {
        this.calendar = calendar;
    }
    
    public Map<String, Object> getAdditionalSettings() {
        return additionalSettings;
    }
    
    public void setAdditionalSettings(Map<String, Object> additionalSettings) {
        this.additionalSettings = additionalSettings;
    }
}
