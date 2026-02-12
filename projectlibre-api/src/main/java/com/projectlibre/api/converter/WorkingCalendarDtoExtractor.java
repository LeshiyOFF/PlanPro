package com.projectlibre.api.converter;

import com.projectlibre.api.dto.CalendarDataDto.WorkingHoursDto;
import com.projectlibre1.pm.calendar.CalendarService;
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
 * Извлечение рабочих дней и часов из WorkingCalendar в DTO-формат.
 * Single Responsibility: только извлечение данных рабочих дней/часов.
 * Clean Architecture: Adapter (Infrastructure Layer).
 */
public final class WorkingCalendarDtoExtractor {

    private static final Logger log = LoggerFactory.getLogger(WorkingCalendarDtoExtractor.class);

    private WorkingCalendarDtoExtractor() { }

    public static boolean[] extractWorkingDays(WorkingCalendar calendar) {
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

    public static List<WorkingHoursDto> extractWorkingHours(WorkingCalendar calendar) {
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
                        if (toHour == 0 && fromHour > 0) toHour = 24;
                        if (toHour > fromHour && !containsRange(result, fromHour, toHour)) {
                            result.add(new WorkingHoursDto(fromHour, toHour));
                        }
                    }
                }
                if (!result.isEmpty()) break;
            }
        } catch (Exception e) {
            log.warn("[WorkingCalendarDtoExtractor] Error extracting hours: {}", e.getMessage());
        }
        if (result.isEmpty()) {
            result.add(new WorkingHoursDto(8, 12));
            result.add(new WorkingHoursDto(13, 17));
        }
        return result;
    }

    public static int calculateHoursPerDay(List<WorkingHoursDto> hours) {
        if (hours == null || hours.isEmpty()) return 8;
        int total = 0;
        for (WorkingHoursDto h : hours) {
            total += h.getTo() - h.getFrom();
        }
        return total > 0 ? total : 8;
    }

    private static int extractHourFromTimestamp(long millis) {
        Calendar cal = DateTime.calendarInstance();
        cal.setTimeInMillis(millis);
        return cal.get(Calendar.HOUR_OF_DAY);
    }

    private static boolean containsRange(List<WorkingHoursDto> list, int from, int to) {
        for (WorkingHoursDto dto : list) {
            if (dto.getFrom() == from && dto.getTo() == to) return true;
        }
        return false;
    }
}
