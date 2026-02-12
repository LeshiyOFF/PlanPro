package com.projectlibre.api.converter;

import com.projectlibre.api.dto.CalendarDataDto;
import com.projectlibre.api.dto.CalendarDataDto.WorkingHoursDto;
import com.projectlibre1.pm.calendar.CalendarService;
import com.projectlibre1.pm.calendar.WorkingCalendar;
import com.projectlibre1.pm.task.Project;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * Конвертер календарей из Core модели в DTO для передачи на frontend.
 * 
 * Извлекает:
 * - Системные календари (standard, 24_7, night_shift)
 * - Кастомные календари из derivedCalendars
 * 
 * Clean Architecture: Adapter (Infrastructure Layer).
 * SOLID: Single Responsibility - только конвертация календарей.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class CoreCalendarConverter {

    private static final Logger log = LoggerFactory.getLogger(CoreCalendarConverter.class);
    private static final String EMPTY_CALENDAR_DISPLAY_NAME = "Без названия";

    private final CalendarIdConverter idConverter = new CalendarIdConverter();

    /**
     * Извлекает календари текущего проекта: системные + все производные из CalendarService
     * (включая не назначенные задачам/ресурсам), с фильтрами по типу WorkingCalendar и fixedId == 0.
     */
    public List<CalendarDataDto> extractCalendarsForProject(Project project) {
        CalendarService calService = CalendarService.getInstance();
        List<CalendarDataDto> result = new ArrayList<>(
            SystemCalendarExtractor.extract(calService, this));
        ArrayList derivedList = calService.getDerivedCalendars();
        if (derivedList != null) {
            for (Object obj : derivedList) {
                if (!(obj instanceof WorkingCalendar)) continue;
                WorkingCalendar wc = (WorkingCalendar) obj;
                if (wc.getFixedId() != 0) continue;
                CalendarDataDto dto = convertWorkingCalendar(wc);
                if (dto != null) {
                    dto.setType("custom");
                    result.add(dto);
                }
            }
        }
        log.info("[CalendarConverter] Extracted {} calendars for project", result.size());
        return result;
    }

    /**
     * Извлекает все календари из CalendarService (системные + все кастомные).
     */
    public List<CalendarDataDto> extractAllCalendars() {
        CalendarService calService = CalendarService.getInstance();
        List<CalendarDataDto> result = new ArrayList<>(
            SystemCalendarExtractor.extract(calService, this));
        result.addAll(extractCustomCalendars(calService));
        log.info("[CalendarConverter] Extracted {} calendars total", result.size());
        return result;
    }
    
    /**
     * Извлекает только кастомные календари.
     */
    public List<CalendarDataDto> extractCustomCalendars(CalendarService calService) {
        List<CalendarDataDto> result = new ArrayList<>();
        
        ArrayList derivedList = calService.getDerivedCalendars();
        if (derivedList == null || derivedList.isEmpty()) {
            return result;
        }
        
        for (Object obj : derivedList) {
            if (!(obj instanceof WorkingCalendar)) continue;
            
            WorkingCalendar wc = (WorkingCalendar) obj;
            if (wc.getFixedId() != 0) continue;
            
            CalendarDataDto dto = convertWorkingCalendar(wc);
            if (dto != null) {
                dto.setType("custom");
                result.add(dto);
                log.info("[CalendarConverter] Extracted custom: '{}' (id={})", 
                    dto.getName(), dto.getId());
            }
        }
        
        return result;
    }

    /**
     * Конвертирует WorkingCalendar в CalendarDataDto.
     * 
     * V2.0: Добавлено извлечение hoursPerDay из рабочих часов.
     */
    public CalendarDataDto convertWorkingCalendar(WorkingCalendar calendar) {
        if (calendar == null) return null;
        
        CalendarDataDto dto = new CalendarDataDto();
        
        String calId = idConverter.toCalendarId(calendar);
        dto.setId(calId);
        String name = calendar.getName();
        dto.setName(name == null || name.trim().isEmpty() ? EMPTY_CALENDAR_DISPLAY_NAME : name);
        boolean[] workingDays = WorkingCalendarDtoExtractor.extractWorkingDays(calendar);
        dto.setWorkingDays(workingDays);
        List<WorkingHoursDto> hours = WorkingCalendarDtoExtractor.extractWorkingHours(calendar);
        dto.setWorkingHours(hours);
        dto.setHoursPerDay(WorkingCalendarDtoExtractor.calculateHoursPerDay(hours));
        
        log.debug("[CalendarConverter] Calendar '{}': workingHours={}, hoursPerDay={}",
            calendar.getName(), hours, dto.getHoursPerDay());
        
        return dto;
    }
}
