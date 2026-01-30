package com.projectlibre.api.converter;

import com.projectlibre.api.dto.CalendarDataDto;
import com.projectlibre.api.dto.CalendarDataDto.WorkingHoursDto;
import com.projectlibre1.pm.calendar.CalendarService;
import com.projectlibre1.pm.calendar.WorkCalendar;
import com.projectlibre1.pm.calendar.WorkingCalendar;
import com.projectlibre1.pm.calendar.WorkingHours;
import com.projectlibre1.pm.time.HasStartAndEnd;
import com.projectlibre1.util.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Calendar;
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
    
    private final CalendarIdConverter idConverter = new CalendarIdConverter();
    
    /**
     * Извлекает все календари проекта (системные + кастомные).
     */
    public List<CalendarDataDto> extractAllCalendars() {
        List<CalendarDataDto> result = new ArrayList<>();
        CalendarService calService = CalendarService.getInstance();
        
        // 1. Добавляем системные календари
        result.addAll(extractSystemCalendars());
        
        // 2. Добавляем кастомные календари из derivedCalendars
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
     * Извлекает системные календари.
     */
    private List<CalendarDataDto> extractSystemCalendars() {
        List<CalendarDataDto> result = new ArrayList<>();
        CalendarService calService = CalendarService.getInstance();
        
        WorkCalendar std = calService.findByFixedId(1);
        if (std instanceof WorkingCalendar) {
            CalendarDataDto dto = convertWorkingCalendar((WorkingCalendar) std);
            if (dto != null) {
                dto.setId("standard");
                dto.setType("system");
                result.add(dto);
            }
        }
        
        WorkCalendar h24 = calService.findByFixedId(2);
        if (h24 instanceof WorkingCalendar) {
            CalendarDataDto dto = convertWorkingCalendar((WorkingCalendar) h24);
            if (dto != null) {
                dto.setId("24_7");
                dto.setType("system");
                result.add(dto);
            }
        }
        
        WorkCalendar night = calService.findByFixedId(3);
        if (night instanceof WorkingCalendar) {
            CalendarDataDto dto = convertWorkingCalendar((WorkingCalendar) night);
            if (dto != null) {
                dto.setId("night_shift");
                dto.setType("system");
                result.add(dto);
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
        dto.setName(calendar.getName());
        
        boolean[] workingDays = extractWorkingDays(calendar);
        dto.setWorkingDays(workingDays);
        
        List<WorkingHoursDto> hours = extractWorkingHours(calendar);
        dto.setWorkingHours(hours);
        
        int hoursPerDay = calculateHoursPerDay(hours);
        dto.setHoursPerDay(hoursPerDay);
        
        log.debug("[CalendarConverter] Calendar '{}': workingHours={}, hoursPerDay={}", 
            calendar.getName(), hours, hoursPerDay);
        
        return dto;
    }
    
    /**
     * Вычисляет количество рабочих часов в день из списка интервалов.
     */
    private int calculateHoursPerDay(List<WorkingHoursDto> hours) {
        if (hours == null || hours.isEmpty()) return 8;
        
        int total = 0;
        for (WorkingHoursDto h : hours) {
            total += h.getTo() - h.getFrom();
        }
        return total > 0 ? total : 8;
    }
    
    /**
     * Извлекает рабочие дни из календаря.
     * Использует CalendarService.getWeekDay() для доступа к данным.
     */
    private boolean[] extractWorkingDays(WorkingCalendar calendar) {
        boolean[] days = new boolean[7];
        CalendarService calService = CalendarService.getInstance();
        
        for (int i = 0; i < 7; i++) {
            int dayNum = i + 1;
            try {
                var descriptor = calService.getWeekDay(calendar, dayNum);
                days[i] = descriptor != null && descriptor.isWorking();
            } catch (Exception e) {
                days[i] = (i >= 1 && i <= 5);
            }
        }
        
        return days;
    }
    
    /**
     * Извлекает рабочие часы из календаря.
     * 
     * V2.1 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ:
     * - Использует UTC timezone для корректного извлечения часов из timestamp
     * - Core хранит время в UTC, поэтому конвертация должна быть в UTC
     */
    private List<WorkingHoursDto> extractWorkingHours(WorkingCalendar calendar) {
        List<WorkingHoursDto> result = new ArrayList<>();
        CalendarService calService = CalendarService.getInstance();
        
        try {
            for (int dayNum = 1; dayNum <= 7; dayNum++) {
                var descriptor = calService.getWeekDay(calendar, dayNum);
                if (descriptor == null || !descriptor.isWorking()) continue;
                
                WorkingHours wh = descriptor.getWorkingHours();
                if (wh == null) continue;
                
                List intervals = wh.getIntervals();
                if (intervals == null) continue;
                
                for (Object interval : intervals) {
                    if (interval instanceof HasStartAndEnd) {
                        HasStartAndEnd range = (HasStartAndEnd) interval;
                        int fromHour = extractHourFromTimestamp(range.getStart());
                        int toHour = extractHourFromTimestamp(range.getEnd());
                        
                        // Обработка полуночи (0 часов = 24 для end)
                        if (toHour == 0 && fromHour > 0) {
                            toHour = 24;
                        }
                        
                        if (toHour > fromHour && !containsRange(result, fromHour, toHour)) {
                            result.add(new WorkingHoursDto(fromHour, toHour));
                            log.debug("[CalendarConverter] Extracted interval: {}:00-{}:00", 
                                fromHour, toHour);
                        }
                    }
                }
                
                // Берём часы из первого рабочего дня
                if (!result.isEmpty()) break;
            }
        } catch (Exception e) {
            log.warn("[CalendarConverter] Error extracting hours: {}", e.getMessage(), e);
        }
        
        if (result.isEmpty()) {
            log.warn("[CalendarConverter] No hours extracted for '{}', using default 8-12, 13-17",
                calendar.getName());
            result.add(new WorkingHoursDto(8, 12));
            result.add(new WorkingHoursDto(13, 17));
        }
        
        return result;
    }
    
    /**
     * Извлекает час из timestamp используя UTC timezone.
     * 
     * КРИТИЧНО: Core хранит время в UTC (см. DateTime.calendarInstance()),
     * поэтому при извлечении также нужно использовать UTC,
     * иначе возникнет сдвиг на разницу локального timezone.
     */
    private int extractHourFromTimestamp(long millis) {
        Calendar cal = DateTime.calendarInstance();
        cal.setTimeInMillis(millis);
        return cal.get(Calendar.HOUR_OF_DAY);
    }
    
    private boolean containsRange(List<WorkingHoursDto> list, int from, int to) {
        for (WorkingHoursDto dto : list) {
            if (dto.getFrom() == from && dto.getTo() == to) return true;
        }
        return false;
    }
}
