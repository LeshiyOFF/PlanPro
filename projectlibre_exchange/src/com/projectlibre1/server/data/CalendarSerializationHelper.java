package com.projectlibre1.server.data;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import com.projectlibre1.configuration.CircularDependencyException;
import com.projectlibre1.pm.calendar.CalendarService;
import com.projectlibre1.pm.calendar.WorkCalendar;
import com.projectlibre1.pm.calendar.WorkingCalendar;
import com.projectlibre1.server.access.ErrorLogger;
import com.projectlibre1.session.Session;

/**
 * Конвертация WorkingCalendar ↔ CalendarData для сериализации в файл.
 * В модуле projectlibre_exchange, без зависимости от api.
 * Файл ≤200 строк, методы ≤50 строк.
 */
public final class CalendarSerializationHelper {

    private CalendarSerializationHelper() {
    }

    /**
     * Преобразует список производных календарей CalendarService в коллекцию CalendarData для projectData.setCalendars.
     */
    public static Collection<CalendarData> derivedCalendarsToCalendarDataCollection(ArrayList derivedCalendars)
            throws IOException {
        if (derivedCalendars == null || derivedCalendars.isEmpty()) {
            return new ArrayList<CalendarData>();
        }
        logDerivedCalendarsForDiagnostics(derivedCalendars);
        Map<WorkCalendar, CalendarData> cache = new HashMap<WorkCalendar, CalendarData>();
        Set<WorkCalendar> inProgress = new HashSet<WorkCalendar>();
        Collection<CalendarData> result = new ArrayList<CalendarData>();
        for (Object obj : derivedCalendars) {
            if (!(obj instanceof WorkingCalendar)) {
                continue;
            }
            WorkingCalendar wc = (WorkingCalendar) obj;
            result.add(workingCalendarToCalendarData(wc, cache, inProgress));
        }
        return result;
    }

    /**
     * Преобразует один WorkingCalendar в CalendarData с учётом базового календаря.
     * Кэш заполняется до рекурсии по базовому календарю, чтобы обрывать циклы и повторные ссылки в графе календарей.
     */
    static CalendarData workingCalendarToCalendarData(WorkingCalendar wc, Map<WorkCalendar, CalendarData> cache,
                                                      Set<WorkCalendar> inProgress) throws IOException {
        if (cache.containsKey(wc)) {
            return cache.get(wc);
        }
        CalendarData data = (CalendarData) SerializeUtil.serialize(wc, CalendarData.FACTORY);
        data.setCalendarName(wc.getName());
        data.setFixedId(wc.getFixedId());
        data.setIsBaseCalendar(wc.isBaseCalendar());
        cache.put(wc, data);
        inProgress.add(wc);
        try {
            WorkCalendar base = wc.getBaseCalendar();
            if (base == CalendarService.getInstance().getStandardInstance())
                base = null;
            if (base != null && base instanceof WorkingCalendar) {
                if (inProgress.contains(base)) {
                    String cycleMsg = buildCycleDiagnostics(wc, (WorkingCalendar) base, inProgress);
                    ErrorLogger.log("[CalendarCycle] " + cycleMsg);
                    throw new IOException("Cyclic calendar dependency: " + cycleMsg);
                }
                CalendarData baseData = workingCalendarToCalendarData((WorkingCalendar) base, cache, inProgress);
                data.setBaseCalendar(baseData);
            }
            return data;
        } finally {
            inProgress.remove(wc);
        }
    }

    /**
     * Формирует диагностическую строку при обнаружении цикла в графе календарей.
     * Содержит имена, uniqueId и fixedId текущего календаря, базового (уже в цепочке) и полную цепочку inProgress.
     */
    private static String buildCycleDiagnostics(WorkingCalendar wc, WorkingCalendar baseInProgress,
                                                 Set<WorkCalendar> inProgress) {
        StringBuilder sb = new StringBuilder();
        sb.append("calendar '").append(safeName(wc)).append("' (uniqueId=").append(wc.getUniqueId())
          .append(", fixedId=").append(wc.getFixedId()).append(") has base calendar '")
          .append(safeName(baseInProgress)).append("' (uniqueId=").append(baseInProgress.getUniqueId())
          .append(", fixedId=").append(baseInProgress.getFixedId())
          .append(") which is already in the serialization chain.");
        if (inProgress != null && !inProgress.isEmpty()) {
            sb.append(" Chain (order): ");
            int i = 0;
            for (WorkCalendar cal : inProgress) {
                if (i++ > 0) sb.append(" -> ");
                if (cal instanceof WorkingCalendar) {
                    WorkingCalendar w = (WorkingCalendar) cal;
                    sb.append("'").append(safeName(w)).append("'(id=").append(w.getUniqueId()).append(")");
                } else {
                    sb.append(cal);
                }
            }
        }
        return sb.toString();
    }

    private static String safeName(WorkingCalendar w) {
        if (w == null) return "null";
        String n = w.getName();
        return n != null ? n : "(no name)";
    }

    /**
     * Логирует список производных календарей перед сериализацией (имя, uniqueId, fixedId, base) для диагностики.
     */
    private static void logDerivedCalendarsForDiagnostics(ArrayList derivedCalendars) {
        if (derivedCalendars == null) return;
        StringBuilder sb = new StringBuilder("[CalendarCycle] Serializing derived calendars: count=")
            .append(derivedCalendars.size());
        for (int i = 0; i < derivedCalendars.size(); i++) {
            Object obj = derivedCalendars.get(i);
            if (!(obj instanceof WorkingCalendar)) continue;
            WorkingCalendar w = (WorkingCalendar) obj;
            WorkCalendar base = w.getBaseCalendar();
            sb.append("; [").append(i).append("] '").append(safeName(w))
              .append("' uniqueId=").append(w.getUniqueId()).append(" fixedId=").append(w.getFixedId())
              .append(" base=").append(base == null ? "null" : (base instanceof WorkingCalendar
                  ? "'" + safeName((WorkingCalendar) base) + "'(id=" + ((WorkingCalendar) base).getUniqueId() + ")"
                  : base.toString()));
        }
        ErrorLogger.log(sb.toString());
    }

    /**
     * Десериализует коллекцию CalendarData и добавляет календари в CalendarService.
     * Session при десериализации не передаётся (null), чтобы сохранить uniqueId из файла
     * и избежать дубликатов с календарями, уже добавленными из графа ресурсов при readObject.
     */
    public static void deserializeAndAddCalendars(Collection calendarDataCollection, Session reindex)
            throws IOException, ClassNotFoundException {
        if (calendarDataCollection == null || calendarDataCollection.isEmpty()) {
            return;
        }
        Map<CalendarData, WorkingCalendar> cache = new HashMap<CalendarData, WorkingCalendar>();
        for (Iterator it = calendarDataCollection.iterator(); it.hasNext(); ) {
            Object o = it.next();
            if (!(o instanceof CalendarData)) {
                continue;
            }
            CalendarData calData = (CalendarData) o;
            WorkingCalendar cal = deserializeCalendarCached(calData, cache);
            CalendarService.getInstance().add(cal);
        }
    }

    private static WorkingCalendar deserializeCalendarCached(CalendarData calData,
                                                              Map<CalendarData, WorkingCalendar> cache)
            throws IOException, ClassNotFoundException {
        if (cache.containsKey(calData)) {
            return cache.get(calData);
        }
        WorkingCalendar cal = (WorkingCalendar) SerializeUtil.deserialize(calData, null);
        cache.put(calData, cal);
        if (calData.getBaseCalendar() != null) {
            WorkingCalendar base = deserializeCalendarCached(calData.getBaseCalendar(), cache);
            try {
                cal.setBaseCalendar(base);
            } catch (CircularDependencyException e) {
                String msg = "Circular calendar dependency at load: calendar '" + safeName(cal)
                    + "' (uniqueId=" + cal.getUniqueId() + ", fixedId=" + cal.getFixedId()
                    + ") -> base '" + safeName(base) + "' (uniqueId=" + base.getUniqueId()
                    + ", fixedId=" + base.getFixedId() + "). " + e.getMessage();
                ErrorLogger.log("[CalendarCycle] " + msg);
                throw new IOException(msg, e);
            }
        }
        return cal;
    }
}
