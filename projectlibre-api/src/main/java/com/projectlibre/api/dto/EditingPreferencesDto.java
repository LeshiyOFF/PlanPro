package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO для настроек редактирования
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class EditingPreferencesDto {
    private boolean autoCalculate;
    private boolean showDependencies;
    private boolean allowTaskDeletion;
    private boolean confirmDeletions;
    private boolean autoLinkTasks;
    private boolean splitTasksEnabled;
    private boolean effortDriven;

    public boolean isAutoCalculate() {
        return autoCalculate;
    }

    public void setAutoCalculate(boolean autoCalculate) {
        this.autoCalculate = autoCalculate;
    }

    public boolean isShowDependencies() {
        return showDependencies;
    }

    public void setShowDependencies(boolean showDependencies) {
        this.showDependencies = showDependencies;
    }

    public boolean isAllowTaskDeletion() {
        return allowTaskDeletion;
    }

    public void setAllowTaskDeletion(boolean allowTaskDeletion) {
        this.allowTaskDeletion = allowTaskDeletion;
    }

    public boolean isConfirmDeletions() {
        return confirmDeletions;
    }

    public void setConfirmDeletions(boolean confirmDeletions) {
        this.confirmDeletions = confirmDeletions;
    }

    public boolean isAutoLinkTasks() {
        return autoLinkTasks;
    }

    public void setAutoLinkTasks(boolean autoLinkTasks) {
        this.autoLinkTasks = autoLinkTasks;
    }

    public boolean isSplitTasksEnabled() {
        return splitTasksEnabled;
    }

    public void setSplitTasksEnabled(boolean splitTasksEnabled) {
        this.splitTasksEnabled = splitTasksEnabled;
    }

    public boolean isEffortDriven() {
        return effortDriven;
    }

    public void setEffortDriven(boolean effortDriven) {
        this.effortDriven = effortDriven;
    }
}
