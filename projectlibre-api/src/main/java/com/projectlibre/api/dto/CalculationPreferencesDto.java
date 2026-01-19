package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO для настроек расчетов
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class CalculationPreferencesDto {
    private DurationDto criticalSlack;
    private boolean calculateMultipleCriticalPaths;
    private DurationDto tasksAreCriticalIfSlackIsLessThan;
    private boolean showEstimatedDurations;
    private boolean showActualWork;
    private boolean showBaselineWork;

    public DurationDto getCriticalSlack() {
        return criticalSlack;
    }

    public void setCriticalSlack(DurationDto criticalSlack) {
        this.criticalSlack = criticalSlack;
    }

    public boolean isCalculateMultipleCriticalPaths() {
        return calculateMultipleCriticalPaths;
    }

    public void setCalculateMultipleCriticalPaths(boolean calculateMultipleCriticalPaths) {
        this.calculateMultipleCriticalPaths = calculateMultipleCriticalPaths;
    }

    public DurationDto getTasksAreCriticalIfSlackIsLessThan() {
        return tasksAreCriticalIfSlackIsLessThan;
    }

    public void setTasksAreCriticalIfSlackIsLessThan(DurationDto tasksAreCriticalIfSlackIsLessThan) {
        this.tasksAreCriticalIfSlackIsLessThan = tasksAreCriticalIfSlackIsLessThan;
    }

    public boolean isShowEstimatedDurations() {
        return showEstimatedDurations;
    }

    public void setShowEstimatedDurations(boolean showEstimatedDurations) {
        this.showEstimatedDurations = showEstimatedDurations;
    }

    public boolean isShowActualWork() {
        return showActualWork;
    }

    public void setShowActualWork(boolean showActualWork) {
        this.showActualWork = showActualWork;
    }

    public boolean isShowBaselineWork() {
        return showBaselineWork;
    }

    public void setShowBaselineWork(boolean showBaselineWork) {
        this.showBaselineWork = showBaselineWork;
    }
}
