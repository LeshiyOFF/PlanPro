package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO для общих настроек
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeneralPreferencesDto {
    private String userName;
    private String companyName;
    private String defaultView;
    private boolean autoSave;
    private int autoSaveInterval;
    private String defaultCalendar;
    private String dateFormat;
    private String timeFormat;
    private String currency;
    private String language;
    private double defaultStandardRate;
    private double defaultOvertimeRate;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getDefaultView() {
        return defaultView;
    }

    public void setDefaultView(String defaultView) {
        this.defaultView = defaultView;
    }

    public boolean isAutoSave() {
        return autoSave;
    }

    public void setAutoSave(boolean autoSave) {
        this.autoSave = autoSave;
    }

    public int getAutoSaveInterval() {
        return autoSaveInterval;
    }

    public void setAutoSaveInterval(int autoSaveInterval) {
        this.autoSaveInterval = autoSaveInterval;
    }

    public String getDefaultCalendar() {
        return defaultCalendar;
    }

    public void setDefaultCalendar(String defaultCalendar) {
        this.defaultCalendar = defaultCalendar;
    }

    public String getDateFormat() {
        return dateFormat;
    }

    public void setDateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
    }

    public String getTimeFormat() {
        return timeFormat;
    }

    public void setTimeFormat(String timeFormat) {
        this.timeFormat = timeFormat;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public double getDefaultStandardRate() {
        return defaultStandardRate;
    }

    public void setDefaultStandardRate(double defaultStandardRate) {
        this.defaultStandardRate = defaultStandardRate;
    }

    public double getDefaultOvertimeRate() {
        return defaultOvertimeRate;
    }

    public void setDefaultOvertimeRate(double defaultOvertimeRate) {
        this.defaultOvertimeRate = defaultOvertimeRate;
    }
}
