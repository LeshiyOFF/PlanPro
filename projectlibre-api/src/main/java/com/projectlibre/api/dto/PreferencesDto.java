package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Контейнер для всех пользовательских настроек
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class PreferencesDto {
    private GeneralPreferencesDto general;
    private DisplayPreferencesDto display;
    private EditingPreferencesDto editing;
    private CalculationPreferencesDto calculations;
    private SecurityPreferencesDto security;
    private SchedulePreferencesDto schedule;
    private CalendarPreferencesDto calendar;

    public GeneralPreferencesDto getGeneral() {
        return general;
    }

    public void setGeneral(GeneralPreferencesDto general) {
        this.general = general;
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

    public CalculationPreferencesDto getCalculations() {
        return calculations;
    }

    public void setCalculations(CalculationPreferencesDto calculations) {
        this.calculations = calculations;
    }

    public SecurityPreferencesDto getSecurity() {
        return security;
    }

    public void setSecurity(SecurityPreferencesDto security) {
        this.security = security;
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
}
