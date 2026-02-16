package com.projectlibre.api.sync;

import com.projectlibre.api.converter.CustomCalendarFactory;
import com.projectlibre.api.dto.CalendarSyncDto;
import com.projectlibre.api.dto.FrontendResourceDto;
import com.projectlibre1.pm.calendar.CalendarService;
import com.projectlibre1.pm.calendar.WorkCalendar;
import com.projectlibre1.pm.calendar.WorkingCalendar;
import com.projectlibre1.pm.resource.Resource;
import com.projectlibre1.pm.resource.ResourceImpl;
import com.projectlibre1.pm.resource.ResourcePool;
import com.projectlibre1.pm.task.Project;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Синхронизатор ресурсов из Frontend в Core Project.
 * 
 * V3.0 КРИТИЧЕСКИЕ ИЗМЕНЕНИЯ:
 * - Поддержка calendarData для передачи полных настроек WorkWeek
 * - Использует CustomCalendarFactory.createWithSettings() для кастомных календарей
 * - Это исправляет баг с потерей настроек кастомных календарей!
 * 
 * V2.0 ИЗМЕНЕНИЯ:
 * - Добавлена автоматическая очистка CalendarService от дубликатов
 * - Усилена валидация календарей
 * - Улучшена обработка ошибок
 * 
 * Clean Architecture: Application Service (Application Layer).
 * SOLID: Single Responsibility - только синхронизация ресурсов.
 * 
 * @author ProjectLibre Team
 * @version 3.0.0
 */
public class ApiToCoreResourceSynchronizer {
    
    private static final Logger log = LoggerFactory.getLogger(ApiToCoreResourceSynchronizer.class);
    
    private final com.projectlibre.api.converter.CalendarIdConverter calendarConverter = 
        new com.projectlibre.api.converter.CalendarIdConverter();
    private final CustomCalendarFactory calendarFactory = new CustomCalendarFactory();
    private final com.projectlibre.api.converter.ResourceTypeConverter typeConverter =
        new com.projectlibre.api.converter.ResourceTypeConverter();
    private final com.projectlibre.api.validator.CalendarSafetyValidator safetyValidator =
        new com.projectlibre.api.validator.CalendarSafetyValidator();
    private final com.projectlibre.api.validator.CalendarHealer calendarHealer =
        new com.projectlibre.api.validator.CalendarHealer();
    private final com.projectlibre.api.validator.CalendarErrorMessageBuilder messageBuilder =
        new com.projectlibre.api.validator.CalendarErrorMessageBuilder();
    private final com.projectlibre.api.exchange.CalendarServiceCleaner calendarCleaner =
        new com.projectlibre.api.exchange.CalendarServiceCleaner();
    
    private int syncedCount;
    private int skippedCount;
    private String lastCalendarError;
    private String lastCalendarErrorCode;
    
    /**
     * Маппинг временных Frontend ID на постоянные Core ID.
     * Заполняется при создании новых ресурсов.
     */
    private final Map<String, String> idMapping = new HashMap<>();

    public SyncResult synchronize(Project project, List<FrontendResourceDto> frontendResources) {
        if (project == null) return SyncResult.error("Project is null");
        if (frontendResources == null) return SyncResult.success(0, 0);
        
        syncedCount = 0;
        skippedCount = 0;
        lastCalendarError = null;
        lastCalendarErrorCode = null;
        idMapping.clear();
        
        try {
            System.out.println("[ResSync] 🧹 Pre-sync CalendarService cleanup...");
            calendarCleaner.cleanDuplicates();
            System.out.println("[ResSync] ✅ Cleanup done, removed: " + 
                calendarCleaner.getRemovedCount() + " duplicates");
            
            ResourcePool resourcePool = project.getResourcePool();
            if (resourcePool == null) return SyncResult.error("ResourcePool is null");
            
            log.info("[ResSync] Starting resource sync: {} resources", frontendResources.size());
            Map<String, Resource> existingResourcesByName = buildResourceMap(resourcePool);
            Set<Resource> usedResources = new HashSet<>();
            
            for (FrontendResourceDto frontendResource : frontendResources) {
                Resource coreResource = findMatchingResource(
                    frontendResource, existingResourcesByName, usedResources);
                
                if (coreResource == null) {
                    coreResource = resourcePool.createScriptedResource();
                    if (coreResource instanceof ResourceImpl) {
                        long uniqueId = System.currentTimeMillis() + syncedCount;
                        ((ResourceImpl) coreResource).getGlobalResource().setUniqueId(uniqueId);
                        
                        String frontendId = getFrontendId(frontendResource);
                        if (frontendId != null && !frontendId.isEmpty()) {
                            String coreId = String.valueOf(uniqueId);
                            idMapping.put(frontendId, coreId);
                            log.info("[ResSync] ID Mapping: {} -> {}", frontendId, coreId);
                        }
                    }
                    log.debug("[ResSync] Created new resource for: {}", frontendResource.getName());
                } else {
                    String frontendId = getFrontendId(frontendResource);
                    if (frontendId != null && !frontendId.isEmpty() && coreResource instanceof ResourceImpl) {
                        long coreIdLong = ((ResourceImpl) coreResource).getUniqueId();
                        idMapping.put(frontendId, String.valueOf(coreIdLong));
                        log.debug("[ResSync] ID Mapping (existing): {} -> {}", frontendId, coreIdLong);
                    }
                }
                
                usedResources.add(coreResource);
                updateResourceProperties(coreResource, frontendResource);
                syncedCount++;
            }
            
            if (lastCalendarErrorCode != null) {
                return SyncResult.error(lastCalendarError, lastCalendarErrorCode);
            }
            
            log.info("[ResSync] ✅ Sync completed: synced={}, idMappings={}", 
                syncedCount, idMapping.size());
            return SyncResult.successWithIdMapping(syncedCount, skippedCount, idMapping);
            
        } catch (Exception e) {
            log.error("[ResSync] ❌ Sync failed", e);
            return SyncResult.error(e.getMessage());
        }
    }
    
    /**
     * Находит соответствующий Core-ресурс для Frontend-ресурса.
     * Сначала пытается найти по имени, но только если ресурс ещё не был использован.
     * Это предотвращает перезапись при наличии ресурсов с одинаковыми именами.
     */
    private Resource findMatchingResource(
            FrontendResourceDto frontendResource,
            Map<String, Resource> existingByName,
            Set<Resource> usedResources) {
        
        Resource byName = existingByName.get(frontendResource.getName());
        if (byName != null && !usedResources.contains(byName)) {
            return byName;
        }
        return null;
    }
    
    private Map<String, Resource> buildResourceMap(ResourcePool pool) {
        Map<String, Resource> map = new HashMap<>();
        if (pool.getResourceList() != null) {
            for (Object obj : pool.getResourceList()) {
                if (obj instanceof Resource) {
                    Resource r = (Resource) obj;
                    map.put(r.getName(), r);
                }
            }
        }
        return map;
    }
    
    private void updateResourceProperties(Resource coreResource, FrontendResourceDto dto) {
        coreResource.setName(dto.getName());
        
        coreResource.setResourceType(typeConverter.toCore(dto.getType()));
        if (coreResource instanceof ResourceImpl) {
            ((ResourceImpl) coreResource).setMaximumUnits(dto.getMaxUnits());
        }
        coreResource.setStandardRate(new com.projectlibre1.datatype.Rate(
            dto.getStandardRate(), com.projectlibre1.datatype.TimeUnit.NON_TEMPORAL));
        coreResource.setOvertimeRate(new com.projectlibre1.datatype.Rate(
            dto.getOvertimeRate(), com.projectlibre1.datatype.TimeUnit.NON_TEMPORAL));
        coreResource.setCostPerUse(dto.getCostPerUse());
        if (dto.getEmail() != null) coreResource.setEmailAddress(dto.getEmail());
        if (dto.getGroup() != null) coreResource.setGroup(dto.getGroup());
        synchronizeCalendar(coreResource, dto);
    }
    
    /**
     * Синхронизирует календарь ресурса.
     * 
     * V3.0: Если есть calendarData, создаёт/обновляет календарь с полными настройками.
     * Это критическое исправление бага с потерей настроек кастомных календарей.
     */
    private void synchronizeCalendar(Resource coreResource, FrontendResourceDto dto) {
        String calendarId = dto.getCalendarId();
        CalendarSyncDto calendarData = dto.getCalendarData();
        
        if ((calendarId == null || calendarId.trim().isEmpty()) && calendarData == null) {
            return;
        }
        
        try {
            WorkCalendar newCalendar;
            
            if (dto.hasCalendarData()) {
                newCalendar = synchronizeWithCalendarData(dto, calendarData);
            } else {
                newCalendar = synchronizeWithCalendarId(dto, calendarId);
            }
            
            if (newCalendar == null) {
                log.warn("[ResSync] ⚠️ Calendar not resolved for resource '{}'", dto.getName());
                return;
            }
            
            applyCalendarToResource(coreResource, newCalendar, calendarId, dto.getName());
            
        } catch (Throwable t) {
            log.error("[ResSync] ❌ Calendar sync failed for '{}': {}", 
                dto.getName(), t.getClass().getSimpleName(), t);
        }
    }
    
    /**
     * Синхронизирует календарь используя полные данные из calendarData.
     * КРИТИЧЕСКОЕ: Это исправляет баг с потерей настроек кастомных календарей!
     */
    private WorkCalendar synchronizeWithCalendarData(FrontendResourceDto dto, CalendarSyncDto calendarData) {
        log.info("[ResSync] 🔄 Syncing calendar with FULL DATA for '{}': name='{}', workingDays={}, hours={}", 
            dto.getName(), calendarData.getName(), calendarData.getWorkingDaysCount(), 
            calendarData.getHoursPerDay());
        
        WorkCalendar calendar = calendarFactory.createWithSettings(calendarData);
        
        if (calendar != null && calendar instanceof WorkingCalendar) {
            WorkingCalendar wc = (WorkingCalendar) calendar;
            log.info("[ResSync] ✅ Created/updated calendar '{}' with settings: uniqueId={}", 
                wc.getName(), wc.getUniqueId());
        }
        
        return calendar;
    }
    
    /**
     * Синхронизирует календарь используя только calendarId (legacy метод).
     */
    private WorkCalendar synchronizeWithCalendarId(FrontendResourceDto dto, String calendarId) {
        log.info("[ResSync] 🔄 Syncing calendar by ID for '{}': calendarId='{}'", 
            dto.getName(), calendarId);
        
        WorkCalendar calendar = calendarConverter.fromCalendarId(calendarId);
        
        if (calendar == null) {
            log.warn("[ResSync] ⚠️ Calendar '{}' not found for resource '{}'", 
                calendarId, dto.getName());
            return null;
        }
        
        if (calendar instanceof WorkingCalendar) {
            WorkingCalendar wc = (WorkingCalendar) calendar;
            log.info("[ResSync] 📅 Found calendar for '{}': name='{}', fixedId={}, uniqueId={}", 
                dto.getName(), wc.getName(), wc.getFixedId(), wc.getUniqueId());
            
            if (calendarHealer.healIfNeeded(wc)) {
                log.warn("[ResSync] Calendar '{}' was healed", calendarId);
            }
        }
        
        return calendar;
    }
    
    /**
     * Применяет календарь к ресурсу с валидацией.
     */
    private void applyCalendarToResource(Resource coreResource, WorkCalendar newCalendar, 
                                          String calendarId, String resourceName) {
        WorkCalendar existingCalendar = safelyGetExistingCalendar(coreResource);
        
        var validation = safetyValidator.validateReplacement(existingCalendar, newCalendar);
        if (!validation.isValid()) {
            lastCalendarErrorCode = validation.getErrorCode();
            lastCalendarError = messageBuilder.buildUserFriendlyMessage(lastCalendarErrorCode);
            log.error("[ResSync] ❌ Unsafe calendar '{}': {}", calendarId, lastCalendarErrorCode);
            return;
        }
        
        if (safelySetCalendarWithService(coreResource, existingCalendar, 
                newCalendar, calendarId, resourceName)) {
            log.info("[ResSync] ✅ Set calendar for '{}'", resourceName);
        }
    }
    
    private WorkCalendar safelyGetExistingCalendar(Resource resource) {
        try {
            return resource.getWorkCalendar();
        } catch (Throwable t) {
            return null;
        }
    }
    
    private boolean safelySetCalendarWithService(Resource resource, 
            WorkCalendar oldCalendar, WorkCalendar newCalendar, 
            String calendarId, String resourceName) {
        try {
            CalendarService calendarService = CalendarService.getInstance();
            calendarService.reassignCalendar(resource, oldCalendar, newCalendar);
            resource.setWorkCalendar(newCalendar);
            return true;
        } catch (StackOverflowError e) {
            log.error("[ResSync] ❌ STACKOVERFLOW '{}' - CIRCULAR", calendarId);
            return false;
        } catch (Throwable t) {
            log.error("[ResSync] ❌ Failed set calendar '{}': {}", calendarId, t.getMessage());
            return false;
        }
    }
    
    /**
     * Получает Frontend ID ресурса для маппинга.
     * Приоритет: temporaryId > id (если начинается с "RES-").
     */
    private String getFrontendId(FrontendResourceDto dto) {
        if (dto.getTemporaryId() != null && !dto.getTemporaryId().isEmpty()) {
            return dto.getTemporaryId();
        }
        String id = dto.getId();
        if (id != null && (id.startsWith("RES-") || !isNumericId(id))) {
            return id;
        }
        return null;
    }
    
    /**
     * Проверяет, является ли ID числовым (уже существующий Core ID).
     */
    private boolean isNumericId(String id) {
        if (id == null || id.isEmpty()) return false;
        try {
            Long.parseLong(id);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
