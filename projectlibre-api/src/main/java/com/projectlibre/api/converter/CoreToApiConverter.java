package com.projectlibre.api.converter;

import com.projectlibre.api.dto.CalendarDataDto;
import com.projectlibre.api.dto.ProjectDataDto;
import com.projectlibre.api.dto.ProjectDataDto.TaskDataDto;
import com.projectlibre.api.dto.ProjectDataDto.ResourceDataDto;
import com.projectlibre1.pm.task.Project;

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
            System.out.println("[CoreToApiConverter] Null project received");
            return ProjectDataDto.successWithCalendars(
                null, "Unknown", new ArrayList<>(), new ArrayList<>(), 
                new ArrayList<>(), null
            );
        }
        
        System.out.println("[CoreToApiConverter] Converting: " + coreProject.getName());
        
        List<TaskDataDto> tasks = taskConverter.convertTasks(coreProject);
        List<ResourceDataDto> resources = resourceConverter.convertResources(coreProject);
        List<CalendarDataDto> calendars = calendarConverter.extractAllCalendars();
        
        ProjectDataDto result = ProjectDataDto.successWithCalendars(
            coreProject.getUniqueId(),
            coreProject.getName(),
            tasks,
            resources,
            calendars,
            coreProject.getFileName()
        );
        
        System.out.println("[CoreToApiConverter] Converted: " 
            + tasks.size() + " tasks, " + resources.size() + " resources, "
            + calendars.size() + " calendars");
        
        return result;
    }
}
