package com.projectlibre.api.converter;

import com.projectlibre.api.dto.CalendarDataDto;
import com.projectlibre.api.dto.ProjectDataDto;
import com.projectlibre.api.dto.ProjectDataDto.TaskDataDto;
import com.projectlibre.api.dto.ProjectDataDto.ResourceDataDto;
import com.projectlibre1.pm.task.Project;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

/**
 * Главный конвертер данных из Core модели в API DTO.
 * Координирует работу специализированных конвертеров.
 * 
 * V3.0: Добавлена конвертация календарей.
 * 
 * Clean Architecture: Adapter (Interface Layer).
 * SOLID: Single Responsibility - координация конвертации, делегирование специалистам.
 * 
 * @author ProjectLibre Team
 * @version 3.0.0
 */
public class CoreToApiConverter {

    private static final Logger log = LoggerFactory.getLogger("CriticalPathTrace");
    
    private final CoreTaskConverter taskConverter;
    private final CoreResourceConverter resourceConverter;
    private final CoreCalendarConverter calendarConverter;
    
    public CoreToApiConverter() {
        this.taskConverter = new CoreTaskConverter();
        this.resourceConverter = new CoreResourceConverter();
        this.calendarConverter = new CoreCalendarConverter();
    }
    
    /**
     * Конвертирует полный Core Project в DTO для frontend.
     * V3.0: Включает календари проекта.
     */
    public ProjectDataDto convert(Project coreProject) {
        if (coreProject == null) {
            log.warn("[CoreToApiConverter] Null project received");
            return ProjectDataDto.successWithCalendars(
                null, "Unknown", new ArrayList<>(), new ArrayList<>(),
                new ArrayList<>(), null
            );
        }

        log.debug("[CoreToApiConverter] Converting: {}", coreProject.getName());

        List<TaskDataDto> tasks = taskConverter.convertTasks(coreProject);
        List<ResourceDataDto> resources = resourceConverter.convertResources(coreProject);
        List<CalendarDataDto> calendars = calendarConverter.extractCalendarsForProject(coreProject);

        int criticalCount = 0;
        for (TaskDataDto t : tasks) {
            if (Boolean.TRUE.equals(t.isCritical())) criticalCount++;
        }
        log.info("[CriticalPathTrace] layer=api_converter taskCount={} criticalCount={} resources={} calendars={}",
                tasks.size(), criticalCount, resources.size(), calendars.size());

        ProjectDataDto dto = ProjectDataDto.successWithCalendars(
            coreProject.getUniqueId(),
            coreProject.getName(),
            tasks,
            resources,
            calendars,
            coreProject.getFileName()
        );
        
        // VB.1: Передача imposed finish date (жёсткого дедлайна) с Core в DTO
        long imposedFinish = coreProject.getImposedFinishDate();
        if (imposedFinish > 0) {
            dto.setImposedFinishDate(imposedFinish);
            log.debug("[VB.1] Imposed finish date передан в DTO: {}", imposedFinish);
        } else {
            dto.setImposedFinishDate(null); // Автоматический режим
        }
        
        // VB.12: Передача режима планирования (Schedule from Start/End) с Core в DTO
        boolean isForward = coreProject.isForward();
        dto.setIsForward(isForward);
        log.debug("[VB.12] Scheduling mode передан в DTO: isForward={} ({})",
                isForward, isForward ? "Schedule from Start" : "Schedule from End");
        
        return dto;
    }
}
