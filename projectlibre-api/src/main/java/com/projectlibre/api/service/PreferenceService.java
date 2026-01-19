package com.projectlibre.api.service;

import com.projectlibre.api.dto.*;
import com.projectlibre.api.scheduling.CoreSchedulingOptionsAdapter;
import com.projectlibre.api.scheduling.SchedulingOptionsPort;
import com.projectlibre1.options.*;
import java.text.SimpleDateFormat;
import java.util.Locale;

/**
 * Сервис для синхронизации настроек с ядром ProjectLibre
 * Использует SchedulingOptionsPort для потокобезопасной связи с Core
 */
public class PreferenceService {
    
    private static PreferenceService instance;
    private final SchedulingOptionsPort schedulingOptions;
    
    private PreferenceService() {
        this.schedulingOptions = CoreSchedulingOptionsAdapter.getInstance();
    }
    
    public static synchronized PreferenceService getInstance() {
        if (instance == null) {
            instance = new PreferenceService();
        }
        return instance;
    }

    /**
     * Применяет все настройки из DTO к ядру
     */
    public void applyPreferences(PreferencesDto dto) {
        if (dto == null) return;
        
        if (dto.getGeneral() != null) {
            applyGeneralPreferences(dto.getGeneral());
        }
        
        if (dto.getSchedule() != null) {
            applySchedulePreferences(dto.getSchedule());
        }
        
        if (dto.getCalendar() != null) {
            applyCalendarPreferences(dto.getCalendar());
        }
        
        if (dto.getEditing() != null) {
            applyEditingPreferences(dto.getEditing());
        }
        
        if (dto.getCalculations() != null) {
            applyCalculationPreferences(dto.getCalculations());
        }
    }

    private void applyGeneralPreferences(GeneralPreferencesDto dto) {
        GeneralOption opt = GeneralOption.getInstance();
        opt.setDefaultStandardRate(dto.getDefaultStandardRate());
        opt.setDefaultOvertimeRate(dto.getDefaultOvertimeRate());
        opt.setUserName(dto.getUserName());
        opt.setCompanyName(dto.getCompanyName());
        opt.setCurrency(dto.getCurrency());
        
        // Синхронизация форматов даты и времени через EditOption
        if (dto.getDateFormat() != null) {
            try {
                EditOption editOpt = EditOption.getInstance();
                SimpleDateFormat sdf = new SimpleDateFormat(dto.getDateFormat());
                editOpt.setDateFormat(sdf);
                editOpt.setShortDateFormat(sdf); // Используем тот же формат для краткого отображения
            } catch (Exception e) {
                System.err.println("Failed to set date format: " + e.getMessage());
            }
        }
        
        // Попытка установить локаль для валюты и интерфейса
        if (dto.getLanguage() != null) {
            try {
                String[] parts = dto.getLanguage().split("-");
                if (parts.length == 2) {
                    Locale locale = new Locale(parts[0], parts[1]);
                    Locale.setDefault(locale);
                }
            } catch (Exception e) {
                System.err.println("Failed to set locale: " + e.getMessage());
            }
        }
    }

    private void applySchedulePreferences(SchedulePreferencesDto dto) {
        schedulingOptions.applyAllSettings(
            dto.getSchedulingRule(),
            dto.isEffortDriven(),
            dto.getDurationEnteredIn(),
            dto.getWorkUnit(),
            dto.isNewTasksStartToday(),
            dto.isHonorRequiredDates()
        );
    }

    private void applyCalendarPreferences(CalendarPreferencesDto dto) {
        CalendarOption opt = CalendarOption.getInstance();
        opt.setHoursPerDay(dto.getHoursPerDay());
        opt.setHoursPerWeek(dto.getHoursPerWeek());
        opt.setDaysPerMonth(dto.getDaysPerMonth());
    }

    private void applyEditingPreferences(EditingPreferencesDto dto) {
        EditOption opt = EditOption.getInstance();
        opt.setAutoCalculate(dto.isAutoCalculate());
        opt.setAutoLinkTasks(dto.isAutoLinkTasks());
        opt.setSplitTasksEnabled(dto.isSplitTasksEnabled());
        opt.setAllowTaskDeletion(dto.isAllowTaskDeletion());
        
        // confirmDeletions находится в GeneralOption в ядре
        GeneralOption.getInstance().setConfirmDeletes(dto.isConfirmDeletions());
    }

    private void applyCalculationPreferences(CalculationPreferencesDto dto) {
        CalculationOption opt = CalculationOption.getInstance();
        opt.setCalculateMultipleCriticalPaths(dto.isCalculateMultipleCriticalPaths());
        
        if (dto.getCriticalSlack() != null) {
            opt.setCriticalSlackThreshold(dto.getCriticalSlack().toMilliseconds());
        } else if (dto.getTasksAreCriticalIfSlackIsLessThan() != null) {
            // Если criticalSlack не задан, пробуем использовать альтернативное поле
            opt.setCriticalSlackThreshold(dto.getTasksAreCriticalIfSlackIsLessThan().toMilliseconds());
        }

        // Синхронизация визуальных флагов через GanttOption
        GanttOption ganttOpt = GanttOption.getInstance();
        ganttOpt.setShowEstimatedDurations(dto.isShowEstimatedDurations());
        ganttOpt.setShowActualWork(dto.isShowActualWork());
        ganttOpt.setShowBaselineWork(dto.isShowBaselineWork());
    }
}
