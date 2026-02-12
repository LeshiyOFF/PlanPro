package com.projectlibre.api.converter;

import com.projectlibre.api.dto.CalendarDataDto;
import com.projectlibre1.pm.calendar.CalendarService;
import com.projectlibre1.pm.calendar.WorkCalendar;
import com.projectlibre1.pm.calendar.WorkingCalendar;

import java.util.ArrayList;
import java.util.List;

/**
 * Извлечение системных календарей (standard, 24_7, night_shift).
 * Single Responsibility: только системные календари.
 * Clean Architecture: Adapter (Infrastructure Layer).
 */
public final class SystemCalendarExtractor {

    private SystemCalendarExtractor() { }

    public static List<CalendarDataDto> extract(CalendarService calService,
                                                 CoreCalendarConverter converter) {
        List<CalendarDataDto> result = new ArrayList<>();
        addIfPresent(result, calService, converter, 1, "standard");
        addIfPresent(result, calService, converter, 2, "24_7");
        addIfPresent(result, calService, converter, 3, "night_shift");
        return result;
    }

    private static void addIfPresent(List<CalendarDataDto> result, CalendarService calService,
                                    CoreCalendarConverter converter, int fixedId, String id) {
        WorkCalendar cal = calService.findByFixedId(fixedId);
        if (!(cal instanceof WorkingCalendar)) return;
        CalendarDataDto dto = converter.convertWorkingCalendar((WorkingCalendar) cal);
        if (dto != null) {
            dto.setId(id);
            dto.setType("system");
            result.add(dto);
        }
    }
}
