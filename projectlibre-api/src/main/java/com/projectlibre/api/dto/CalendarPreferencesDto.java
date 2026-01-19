package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO для настроек календаря
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class CalendarPreferencesDto {
    private double hoursPerDay;
    private double hoursPerWeek;
    private double daysPerMonth;

    public double getHoursPerDay() {
        return hoursPerDay;
    }

    public void setHoursPerDay(double hoursPerDay) {
        this.hoursPerDay = hoursPerDay;
    }

    public double getHoursPerWeek() {
        return hoursPerWeek;
    }

    public void setHoursPerWeek(double hoursPerWeek) {
        this.hoursPerWeek = hoursPerWeek;
    }

    public double getDaysPerMonth() {
        return daysPerMonth;
    }

    public void setDaysPerMonth(double daysPerMonth) {
        this.daysPerMonth = daysPerMonth;
    }
}
