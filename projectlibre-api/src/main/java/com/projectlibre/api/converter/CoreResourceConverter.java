package com.projectlibre.api.converter;

import com.projectlibre.api.dto.ProjectDataDto.ResourceDataDto;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.pm.resource.Resource;
import com.projectlibre1.pm.resource.ResourcePool;
import com.projectlibre1.datatype.Rate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

/**
 * Конвертер ресурсов из Core модели в API DTO.
 * 
 * Clean Architecture: Adapter (Interface Layer).
 * SOLID: Single Responsibility - только конвертация ресурсов.
 * 
 * @author ProjectLibre Team
 * @version 2.1.0
 */
public class CoreResourceConverter {
    
    private static final Logger log = LoggerFactory.getLogger(CoreResourceConverter.class);
    private final CalendarIdConverter calendarConverter = new CalendarIdConverter();
    private final RateExtractor rateExtractor = new RateExtractor();
    private final ResourceTypeConverter typeConverter = new ResourceTypeConverter();
    
    /**
     * Конвертирует все ресурсы проекта в DTO список.
     */
    public List<ResourceDataDto> convertResources(Project project) {
        List<ResourceDataDto> result = new ArrayList<>();
        
        try {
            log.info("[CoreResourceConverter] Starting resource conversion for project: {}", 
                project != null ? project.getName() : "null");
            
            ResourcePool pool = project.getResourcePool();
            if (pool == null) {
                log.warn("[CoreResourceConverter] ⚠️ ResourcePool is NULL for project: {}", project.getName());
                return result;
            }
            
            log.info("[CoreResourceConverter] ResourcePool found: {}", pool.getClass().getName());
            
            @SuppressWarnings("unchecked")
            Collection<Resource> resources = pool.getResourceList();
            
            if (resources == null) {
                log.warn("[CoreResourceConverter] ⚠️ getResourceList() returned NULL");
                return result;
            }
            
            int totalCount = resources.size();
            log.info("[CoreResourceConverter] 📊 Total resources in pool: {}", totalCount);
            
            if (totalCount == 0) {
                log.warn("[CoreResourceConverter] ⚠️ ResourceList is EMPTY");
                return result;
            }
            
            int convertedCount = 0;
            int skippedCount = 0;
            
            for (Resource coreResource : resources) {
                String resourceName = coreResource.getName();
                log.debug("[CoreResourceConverter] Processing resource: '{}' (ID: {})", 
                    resourceName, coreResource.getUniqueId());
                
                if (resourceName == null || resourceName.trim().isEmpty()) {
                    log.debug("[CoreResourceConverter] Skipping resource with empty name");
                    skippedCount++;
                    continue;
                }
                
                ResourceDataDto dto = convertSingleResource(coreResource);
                if (dto != null) {
                    result.add(dto);
                    convertedCount++;
                    log.debug("[CoreResourceConverter] ✅ Converted: {}", resourceName);
                } else {
                    skippedCount++;
                    log.warn("[CoreResourceConverter] ❌ Failed to convert: {}", resourceName);
                }
            }
            
            log.info("[CoreResourceConverter] ✅ Conversion complete: converted={}, skipped={}", 
                convertedCount, skippedCount);
            
        } catch (Exception e) {
            log.error("[CoreResourceConverter] ❌ CRITICAL ERROR during conversion", e);
        }
        
        return result;
    }
    
    /**
     * Конвертирует один ресурс.
     */
    private ResourceDataDto convertSingleResource(Resource coreResource) {
        try {
            ResourceDataDto dto = new ResourceDataDto();
            
            dto.setId(String.valueOf(coreResource.getUniqueId()));
            
            String name = coreResource.getName();
            dto.setName(name != null && !name.isEmpty() ? name : "Resource");
            
            String type = "Work";
            try {
                int resourceType = coreResource.getResourceType();
                type = typeConverter.toFrontend(resourceType);
            } catch (Exception e) {
                log.warn("[CoreResourceConverter] Failed to get resource type for '{}', using default 'Work'", 
                    coreResource.getName());
            }
            dto.setType(type);
            
            double maxUnits = 1.0;
            try {
                maxUnits = coreResource.getMaximumUnits();
            } catch (Exception e) {
            }
            dto.setMaxUnits(maxUnits);
            
            double standardRate = rateExtractor.extract(coreResource.getStandardRate());
            double overtimeRate = rateExtractor.extract(coreResource.getOvertimeRate());
            dto.setStandardRate(standardRate);
            dto.setOvertimeRate(overtimeRate);
            
            double costPerUse = 0.0;
            try {
                costPerUse = coreResource.getCostPerUse();
            } catch (Exception e) {
            }
            dto.setCostPerUse(costPerUse);
            
            String email = coreResource.getEmailAddress();
            dto.setEmail(email != null && !email.isEmpty() ? email : null);
            
            String group = coreResource.getGroup();
            dto.setGroup(group != null && !group.isEmpty() ? group : null);
            
            dto.setAvailable(true);
            
            String calendarId = convertCalendar(coreResource);
            dto.setCalendarId(calendarId);
            
            // 🔍 ДИАГНОСТИКА: Логируем все свойства ресурса
            System.out.println("[CoreResourceConverter] 📋 Resource '" + name + "': " +
                "type=" + type + ", calendar=" + calendarId + ", maxUnits=" + maxUnits + ", " +
                "stdRate=" + standardRate + ", overtRate=" + overtimeRate + ", " +
                "costPerUse=" + costPerUse + ", email=" + email + ", group=" + group);
            
            return dto;
            
        } catch (Exception e) {
            System.err.println("[CoreResourceConverter] Failed to convert resource: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Конвертирует календарь ресурса в calendarId для Frontend.
     */
    private String convertCalendar(Resource coreResource) {
        try {
            com.projectlibre1.pm.calendar.WorkCalendar calendar = 
                coreResource.getWorkCalendar();
            String calendarId = calendarConverter.toCalendarId(calendar);
            
            if (calendarId != null) {
                log.debug("[CoreResourceConverter] Resource '{}' has calendar: {}", 
                    coreResource.getName(), calendarId);
            }
            
            return calendarId;
        } catch (Exception e) {
            log.warn("[CoreResourceConverter] Failed to get calendar for '{}': {}", 
                coreResource.getName(), e.getMessage());
            return null;
        }
    }
}
