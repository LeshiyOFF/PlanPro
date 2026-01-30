package com.projectlibre.api.calendar;

import com.projectlibre.api.dto.CalendarSyncDto;
import com.projectlibre.api.dto.CalendarSyncDto.WorkingHoursRangeDto;
import com.projectlibre1.pm.calendar.WorkDay;
import com.projectlibre1.pm.calendar.WorkRangeException;
import com.projectlibre1.pm.calendar.WorkingCalendar;
import com.projectlibre1.pm.calendar.WorkingHours;
import com.projectlibre1.util.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Calendar;
import java.util.List;

/**
 * Builder для настройки WorkWeek в календаре Core.
 * 
 * Решает критическую проблему: применение кастомных настроек рабочей недели
 * (рабочие дни, часы работы) к WorkingCalendar в ядре ProjectLibre.
 * 
 * Clean Architecture: Domain Service (Domain Layer).
 * SOLID: 
 * - Single Responsibility: только построение WorkWeek
 * - Open/Closed: расширяемый через новые методы apply*
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class WorkWeekBuilder {
    
    private static final Logger log = LoggerFactory.getLogger(WorkWeekBuilder.class);
    
    /**
     * Применяет настройки из CalendarSyncDto к WorkingCalendar.
     * 
     * @param calendar целевой календарь
     * @param syncDto данные с настройками
     * @return true если настройки применены успешно
     */
    public boolean applySettings(WorkingCalendar calendar, CalendarSyncDto syncDto) {
        if (calendar == null || syncDto == null) {
            log.error("[WorkWeekBuilder] Calendar or syncDto is null");
            return false;
        }
        
        log.info("[WorkWeekBuilder] Applying settings to '{}': workingDays={}, hours={}",
            syncDto.getName(), syncDto.getWorkingDaysCount(), 
            formatWorkingHours(syncDto.getWorkingHours()));
        
        try {
            applyWorkingDays(calendar, syncDto);
            
            log.info("[WorkWeekBuilder] ✅ Settings applied to '{}'", syncDto.getName());
            return true;
            
        } catch (Exception e) {
            log.error("[WorkWeekBuilder] ❌ Failed to apply settings to '{}': {}", 
                syncDto.getName(), e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Применяет настройки рабочих дней к календарю через setWeekDay().
     * Использует API WorkingCalendar напрямую.
     */
    private void applyWorkingDays(WorkingCalendar calendar, CalendarSyncDto syncDto) {
        boolean[] workingDays = syncDto.getWorkingDays();
        List<WorkingHoursRangeDto> hours = syncDto.getWorkingHours();
        
        for (int dayIndex = 0; dayIndex < 7; dayIndex++) {
            boolean isWorking = workingDays != null && dayIndex < workingDays.length && workingDays[dayIndex];
            
            WorkDay workDay = createWorkDay(isWorking, hours);
            calendar.setWeekDay(dayIndex, workDay);
            
            log.debug("[WorkWeekBuilder] Day {}: working={}", dayIndex, isWorking);
        }
    }
    
    /**
     * Создаёт WorkDay с указанными настройками.
     * 
     * @param isWorking является ли день рабочим
     * @param hours список диапазонов рабочих часов
     * @return настроенный WorkDay
     */
    private WorkDay createWorkDay(boolean isWorking, List<WorkingHoursRangeDto> hours) {
        if (!isWorking) {
            return new WorkDay();
        }
        
        WorkDay workDay = new WorkDay();
        
        if (hours != null && !hours.isEmpty()) {
            WorkingHours workingHours = createWorkingHours(hours);
            workDay.setWorkingHours(workingHours);
        } else {
            workDay.setWorkingHours(WorkingHours.getDefault());
        }
        
        return workDay;
    }
    
    /**
     * Создаёт WorkingHours из списка диапазонов.
     * Использует setInterval() для установки временных интервалов.
     */
    private WorkingHours createWorkingHours(List<WorkingHoursRangeDto> ranges) {
        WorkingHours workingHours = new WorkingHours();
        
        try {
            int intervalIndex = 0;
            
            for (WorkingHoursRangeDto range : ranges) {
                if (range == null || !range.isValid()) {
                    continue;
                }
                
                long startMillis = hourToMillis(range.getFrom());
                long endMillis = hourToMillis(range.getTo());
                
                workingHours.setInterval(intervalIndex, startMillis, endMillis);
                
                log.debug("[WorkWeekBuilder] Added interval {}: {}:00 - {}:00", 
                    intervalIndex, range.getFrom(), range.getTo());
                
                intervalIndex++;
                
                if (intervalIndex >= 5) {
                    log.warn("[WorkWeekBuilder] Max intervals reached (5)");
                    break;
                }
            }
        } catch (WorkRangeException e) {
            log.warn("[WorkWeekBuilder] WorkRangeException: {}", e.getMessage());
            return WorkingHours.getDefault();
        }
        
        return workingHours;
    }
    
    /**
     * Конвертирует час в миллисекунды в формате Core.
     * Core хранит время как смещение от начала суток в миллисекундах.
     */
    private long hourToMillis(int hour) {
        Calendar cal = DateTime.calendarInstance();
        cal.setTimeInMillis(0);
        cal.set(Calendar.HOUR_OF_DAY, hour);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTimeInMillis();
    }
    
    /**
     * Форматирует список рабочих часов для логирования.
     */
    private String formatWorkingHours(List<WorkingHoursRangeDto> hours) {
        if (hours == null || hours.isEmpty()) {
            return "default";
        }
        
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < hours.size(); i++) {
            if (i > 0) sb.append(", ");
            WorkingHoursRangeDto range = hours.get(i);
            if (range != null) {
                sb.append(range.getFrom()).append(":00-").append(range.getTo()).append(":00");
            }
        }
        sb.append("]");
        return sb.toString();
    }
    
    /**
     * Создаёт CalendarSyncDto с дефолтными настройками Standard (пятидневка).
     * Используется как fallback при отсутствии данных.
     */
    public static CalendarSyncDto createDefaultSync(String id, String name) {
        CalendarSyncDto dto = new CalendarSyncDto();
        dto.setId(id);
        dto.setName(name);
        dto.setWorkingDays(new boolean[]{false, true, true, true, true, true, false});
        dto.setWorkingHours(List.of(
            new WorkingHoursRangeDto(8, 12),
            new WorkingHoursRangeDto(13, 17)
        ));
        dto.setHoursPerDay(8);
        return dto;
    }
}
