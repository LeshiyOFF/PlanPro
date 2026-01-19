package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO для настроек планирования
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class SchedulePreferencesDto {
    private int schedulingRule;
    private boolean effortDriven;
    private int durationEnteredIn;
    private int workUnit;
    private boolean newTasksStartToday;
    private boolean honorRequiredDates;

    public int getSchedulingRule() {
        return schedulingRule;
    }

    public void setSchedulingRule(int schedulingRule) {
        this.schedulingRule = schedulingRule;
    }

    public boolean isEffortDriven() {
        return effortDriven;
    }

    public void setEffortDriven(boolean effortDriven) {
        this.effortDriven = effortDriven;
    }

    public int getDurationEnteredIn() {
        return durationEnteredIn;
    }

    public void setDurationEnteredIn(int durationEnteredIn) {
        this.durationEnteredIn = durationEnteredIn;
    }

    public int getWorkUnit() {
        return workUnit;
    }

    public void setWorkUnit(int workUnit) {
        this.workUnit = workUnit;
    }

    public boolean isNewTasksStartToday() {
        return newTasksStartToday;
    }

    public void setNewTasksStartToday(boolean newTasksStartToday) {
        this.newTasksStartToday = newTasksStartToday;
    }

    public boolean isHonorRequiredDates() {
        return honorRequiredDates;
    }

    public void setHonorRequiredDates(boolean honorRequiredDates) {
        this.honorRequiredDates = honorRequiredDates;
    }
}
