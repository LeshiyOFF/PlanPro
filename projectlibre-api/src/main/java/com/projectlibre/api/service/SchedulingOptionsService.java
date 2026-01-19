package com.projectlibre.api.service;

import com.projectlibre.api.dto.SchedulePreferencesDto;
import com.projectlibre.api.scheduling.CoreSchedulingOptionsAdapter;
import com.projectlibre.api.scheduling.SchedulingOptionsPort;

/**
 * Сервис для управления настройками планирования
 * Обеспечивает связь между API и Java Core ScheduleOption
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class SchedulingOptionsService {
    
    private final SchedulingOptionsPort schedulingOptions;
    
    public SchedulingOptionsService() {
        this.schedulingOptions = CoreSchedulingOptionsAdapter.getInstance();
    }
    
    public SchedulingOptionsService(SchedulingOptionsPort schedulingOptions) {
        this.schedulingOptions = schedulingOptions;
    }
    
    /**
     * Получить текущие настройки планирования
     * 
     * @return DTO с настройками планирования
     */
    public SchedulePreferencesDto getSchedulePreferences() {
        SchedulePreferencesDto dto = new SchedulePreferencesDto();
        dto.setSchedulingRule(schedulingOptions.getSchedulingRule());
        dto.setEffortDriven(schedulingOptions.isEffortDriven());
        dto.setDurationEnteredIn(schedulingOptions.getDurationEnteredIn());
        dto.setWorkUnit(schedulingOptions.getWorkUnit());
        dto.setNewTasksStartToday(schedulingOptions.isNewTasksStartToday());
        dto.setHonorRequiredDates(schedulingOptions.isHonorRequiredDates());
        return dto;
    }
    
    /**
     * Применить настройки планирования
     * 
     * @param preferences DTO с настройками
     */
    public void applySchedulePreferences(SchedulePreferencesDto preferences) {
        if (preferences == null) {
            throw new IllegalArgumentException("Schedule preferences cannot be null");
        }
        
        schedulingOptions.applyAllSettings(
            preferences.getSchedulingRule(),
            preferences.isEffortDriven(),
            preferences.getDurationEnteredIn(),
            preferences.getWorkUnit(),
            preferences.isNewTasksStartToday(),
            preferences.isHonorRequiredDates()
        );
    }
    
    /**
     * Установить правило планирования
     * 
     * @param schedulingRule 0: Fixed Units, 1: Fixed Duration, 2: Fixed Work
     */
    public void setSchedulingRule(int schedulingRule) {
        validateSchedulingRule(schedulingRule);
        schedulingOptions.setSchedulingRule(schedulingRule);
    }
    
    /**
     * Установить флаг Effort Driven
     * 
     * @param effortDriven флаг планирования от объема работ
     */
    public void setEffortDriven(boolean effortDriven) {
        schedulingOptions.setEffortDriven(effortDriven);
    }
    
    /**
     * Получить правило планирования
     * 
     * @return правило планирования
     */
    public int getSchedulingRule() {
        return schedulingOptions.getSchedulingRule();
    }
    
    /**
     * Получить флаг Effort Driven
     * 
     * @return флаг планирования от объема работ
     */
    public boolean isEffortDriven() {
        return schedulingOptions.isEffortDriven();
    }
    
    private void validateSchedulingRule(int schedulingRule) {
        if (schedulingRule < 0 || schedulingRule > 2) {
            throw new IllegalArgumentException(
                "Scheduling rule must be 0 (Fixed Units), 1 (Fixed Duration) or 2 (Fixed Work)"
            );
        }
    }
}
