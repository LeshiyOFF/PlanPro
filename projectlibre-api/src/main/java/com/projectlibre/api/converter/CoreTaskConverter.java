package com.projectlibre.api.converter;

import com.projectlibre.api.dto.ProjectDataDto.TaskDataDto;
import com.projectlibre.api.validator.MilestoneProgressValidator;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.pm.task.Task;
import com.projectlibre1.pm.task.NormalTask;
import com.projectlibre1.pm.scheduling.SchedulingType;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;

/**
 * Конвертер задач из Core модели в API DTO.
 * 
 * SOLID: Single Responsibility - только конвертация задач.
 * Clean Architecture: Adapter (Interface Layer).
 * 
 * @author ProjectLibre Team
 * @version 2.1.0
 */
public class CoreTaskConverter {
    
    private static final Logger log = LoggerFactory.getLogger("CriticalPathTrace");
    /** Логер для диагностики сдвига дат */
    private static final Logger dateShiftLog = LoggerFactory.getLogger("DateShiftTrace");
    /** CORE-AUTH.2.4: Логер для трассировки CPM-авторитетных данных */
    private static final Logger coreAuthLog = LoggerFactory.getLogger("CoreAuthTrace");
    /** PERSISTENT-CONFLICT: Логер для трассировки осознанных конфликтов */
    private static final Logger conflictLog = LoggerFactory.getLogger("PersistentConflictTrace");
    private final TaskDateMapper dateMapper = new TaskDateMapper();
    private final TaskHierarchyMapper hierarchyMapper = new TaskHierarchyMapper();
    /** PERSISTENT-CONFLICT: Jackson ObjectMapper для сериализации/десериализации */
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private static final String[] LEVEL_COLORS = {
        "#4A90D9", "#50C878", "#FF6B6B", "#FFB347",
        "#9B59B6", "#3498DB", "#E74C3C", "#2ECC71"
    };
    
    public List<TaskDataDto> convertTasks(Project project) {
        List<TaskDataDto> result = new ArrayList<>();
        Map<Long, String> taskIdMap = new HashMap<>();
        try {
            Iterator<Task> iterator = project.getTaskOutlineIterator();
            int index = 1;
            while (iterator.hasNext()) {
                Task coreTask = iterator.next();
                if (coreTask.isExternal()) continue;
                String taskId = getOrGenerateId(coreTask, index++);
                taskIdMap.put(coreTask.getUniqueId(), taskId);
                result.add(convertSingleTask(project, coreTask, taskId, taskIdMap));
            }
            restorePredecessors(project, result, taskIdMap);
            int criticalCount = 0;
            for (TaskDataDto dto : result) {
                if (Boolean.TRUE.equals(dto.isCritical())) criticalCount++;
            }
            log.info("[CriticalPathTrace] layer=converter taskCount={} criticalCount={}",
                    result.size(), criticalCount);
            // Диагностика сдвига дат: что API отдаёт клиенту (первые 5 задач)
            for (int i = 0; i < Math.min(5, result.size()); i++) {
                TaskDataDto d = result.get(i);
                dateShiftLog.info("[DateShiftTrace] API_TO_CLIENT taskId={} name='{}' startDate={} endDate={}",
                        d.getId(), d.getName(), d.getStartDate(), d.getEndDate());
            }
        } catch (Exception e) {
            log.error("[CoreTaskConverter] Conversion failed: {}", e.getMessage());
        }
        return result;
    }

    private String getOrGenerateId(Task task, int index) {
        String taskId = task.getCustomText(0);
        return (taskId == null || taskId.trim().isEmpty()) ? String.valueOf(index) : taskId;
    }

    private TaskDataDto convertSingleTask(Project project, Task coreTask, String taskId, Map<Long, String> taskIdMap) {
        TaskDataDto dto = new TaskDataDto();
        dto.setId(taskId);
        dto.setName(coreTask.getName() != null ? coreTask.getName() : "Unnamed Task");
        dateMapper.mapDates(coreTask, dto);
        mapDuration(project, coreTask, dto);
        mapProgress(coreTask, dto);
        mapHierarchy(coreTask, dto, taskIdMap);
        mapFlags(project, coreTask, dto);
        dto.setWbs(coreTask.getWbs() != null ? coreTask.getWbs() : taskId);
        dto.setNotes(coreTask.getNotes() != null ? coreTask.getNotes() : "");
        dto.setResourceIds(hierarchyMapper.getResourceIds(coreTask));
        // UNITS-FIX: Передаём полные данные о назначениях включая units
        dto.setResourceAssignments(hierarchyMapper.getResourceAssignments(coreTask));
        
        // PERSISTENT-CONFLICT: Загружаем acknowledgedConflicts из customText(1)
        loadAcknowledgedConflicts(coreTask, dto);
        
        // A.2: Тип планирования из Core (только для NormalTask)
        if (coreTask instanceof NormalTask) {
            int st = ((NormalTask) coreTask).getSchedulingType();
            dto.setSchedulingType(mapSchedulingTypeToString(st));
        }
        
        logCoreAuthData(dto);
        return dto;
    }
    
    /** A.2: Маппинг int SchedulingType из Core в строку для API. */
    private static String mapSchedulingTypeToString(int schedulingType) {
        switch (schedulingType) {
            case SchedulingType.FIXED_UNITS:
                return "fixed_units";
            case SchedulingType.FIXED_DURATION:
                return "fixed_duration";
            case SchedulingType.FIXED_WORK:
                return "fixed_work";
            default:
                return "fixed_duration";
        }
    }
    
    /**
     * PERSISTENT-CONFLICT: Загружает осознанные конфликты дат из customText(1).
     * 
     * @param coreTask задача из Core модели
     * @param dto DTO для заполнения
     */
    private void loadAcknowledgedConflicts(Task coreTask, TaskDataDto dto) {
        String conflictsJson = coreTask.getCustomText(1);
        if (conflictsJson == null || conflictsJson.trim().isEmpty()) {
            dto.setAcknowledgedConflicts(new HashMap<>());
            return;
        }
        
        try {
            Map<String, Boolean> conflicts = objectMapper.readValue(
                conflictsJson, 
                new TypeReference<Map<String, Boolean>>() {}
            );
            dto.setAcknowledgedConflicts(conflicts);
            conflictLog.info("[PERSISTENT-CONFLICT] Loaded acknowledgedConflicts for task '{}': {}", 
                dto.getName(), conflictsJson);
        } catch (Exception e) {
            conflictLog.warn("[PERSISTENT-CONFLICT] Failed to deserialize acknowledgedConflicts for task '{}': {}", 
                dto.getName(), e.getMessage());
            dto.setAcknowledgedConflicts(new HashMap<>());
        }
    }
    
    /**
     * CORE-AUTH.2.4: Логирует CPM-авторитетные данные для диагностики синхронизации Frontend-Core.
     * Позволяет верифицировать что API отдаёт правильные calculated dates и критичность.
     */
    private void logCoreAuthData(TaskDataDto dto) {
        coreAuthLog.info("[CORE-AUTH] taskId={} calculatedStart={} calculatedEnd={} isCritical={}",
                dto.getId(), dto.getCalculatedStartDate(), dto.getCalculatedEndDate(), dto.isCritical());
    }
    
    /**
     * Маппинг длительности задачи из Core в DTO.
     * 
     * UNIFIED-DURATION-FIX: Duration конвертируется в дни с учётом типа задачи:
     * - Elapsed задачи: 24 часа в сутках (календарное время)
     * - Суммарные задачи (WBS parent): 24 часа (duration = end - start, календарное время)
     * - Обычные задачи: hoursPerDay из настроек проекта (рабочее время)
     * 
     * SUMMARY-DURATION-FIX: Суммарные задачи хранят duration как (end - start) в миллисекундах,
     * что является календарным временем. Поэтому для них нужно использовать 24 часа/день,
     * а не hoursPerDay из настроек проекта.
     * 
     * @param project проект для доступа к CalendarOption (hoursPerDay)
     * @param coreTask задача Core
     * @param dto целевой DTO
     */
    private void mapDuration(Project project, Task coreTask, TaskDataDto dto) {
        if (!(coreTask instanceof NormalTask)) {
            return;
        }
        
        NormalTask nt = (NormalTask) coreTask;
        
        try {
            // Получаем длительность в миллисекундах из Core
            long durationMillis = nt.getDurationMillis();
            
            // UNIFIED-DURATION-FIX: Выбираем делитель в зависимости от типа задачи
            double msPerHour = 1000.0 * 60.0 * 60.0;
            double hoursPerDay;
            
            // SUMMARY-DURATION-FIX: Суммарные задачи используют календарное время (24 часа/день)
            // потому что их duration вычисляется как (end - start) в CpmRecalculationRunner
            if (nt.isElapsed() || nt.isSummary()) {
                // Elapsed или суммарные задачи: календарные дни = 24 часа
                hoursPerDay = 24.0;
            } else {
                // Обычные: рабочие дни из настроек проекта
                hoursPerDay = project.getCalendarOption().getHoursPerDay();
            }
            double msPerDay = msPerHour * hoursPerDay;
            
            double durationDays = durationMillis / msPerDay;
            
            // Округляем до 2 знаков для точности
            durationDays = Math.round(durationDays * 100.0) / 100.0;
            
            dto.setDuration(durationDays);
            
            log.debug("[CoreTaskConverter] mapDuration taskId={} name='{}' elapsed={} summary={} durationMillis={} hoursPerDay={} durationDays={}",
                    dto.getId(), nt.getName(), nt.isElapsed(), nt.isSummary(), durationMillis, hoursPerDay, durationDays);
        } catch (Exception e) {
            log.warn("[CoreTaskConverter] mapDuration failed for taskId={}: {}", dto.getId(), e.getMessage());
        }
    }

    private void mapProgress(Task coreTask, TaskDataDto dto) {
        double progress = 0.0;
        boolean isMilestone = false;
        
        if (coreTask instanceof NormalTask) {
            NormalTask normalTask = (NormalTask) coreTask;
            progress = normalTask.getPercentComplete();
            isMilestone = normalTask.isMarkTaskAsMilestone();
        }
        
        // Защита от значений вне [0, 1] из Core (например -1.0 «не задано») — не падать, приводить к допустимому диапазону
        if (progress < 0.0 || progress > 1.0) {
            log.warn("[CoreTaskConverter] Task progress out of range, clamping: taskId={} progress={}", dto.getId(), progress);
            progress = Math.max(0.0, Math.min(1.0, progress));
        }
        
        // Нормализация для устранения ошибок точности IEEE 754
        // Обычные задачи: округление до 2 знаков (0.2800000004 -> 0.28)
        // Вехи: приведение к бинарному значению (0.0 или 1.0)
        double normalizedProgress = MilestoneProgressValidator.normalizeProgress(
            progress,
            isMilestone
        );
        
        dto.setProgress(normalizedProgress);
    }

    private void mapHierarchy(Task coreTask, TaskDataDto dto, Map<Long, String> taskIdMap) {
        int level = hierarchyMapper.calculateLevel(coreTask);
        dto.setLevel(level);
        dto.setColor(LEVEL_COLORS[level % LEVEL_COLORS.length]);
        dto.setChildren(hierarchyMapper.getChildren(coreTask, taskIdMap));
    }

    private void mapFlags(Project project, Task coreTask, TaskDataDto dto) {
        boolean isMilestone = false;
        boolean isSummary = false;
        if (coreTask instanceof NormalTask) {
            NormalTask nt = (NormalTask) coreTask;
            isMilestone = nt.isMarkTaskAsMilestone();
            isSummary = nt.isSummary();
            dto.setEstimated(nt.isEstimated());
            dto.setCritical(nt.isCritical());
            mapSlack(project, nt, dto);
            mapSummaryFields(project, nt, dto, isSummary);
        }
        dto.setMilestone(isMilestone);
        dto.setSummary(isSummary);
        dto.setType(isMilestone ? "MILESTONE" : (isSummary ? "SUMMARY" : "TASK"));
    }
    
    /**
     * CPM-MS.7: Маппинг полей для summary tasks (containsCriticalChildren, minChildSlack).
     * По стандарту MS Project summary не на критическом пути, но UI может показывать индикатор.
     * 
     * UNIFIED-SLACK-FIX: minChildSlack конвертируется через hoursPerDay проекта.
     * Примечание: для summary с детьми разных типов (elapsed/non-elapsed) это приближение.
     */
    private void mapSummaryFields(Project project, NormalTask nt, TaskDataDto dto, boolean isSummary) {
        if (!isSummary) {
            dto.setContainsCriticalChildren(null);
            dto.setMinChildSlack(null);
            return;
        }
        
        dto.setContainsCriticalChildren(nt.containsCriticalChildren());
        
        long minSlackMs = nt.getMinChildSlack();
        if (minSlackMs != Long.MAX_VALUE) {
            // UNIFIED-SLACK-FIX: Используем hoursPerDay из проекта вместо хардкода 8
            double hoursPerDay = project.getCalendarOption().getHoursPerDay();
            double msPerDay = 1000.0 * 60 * 60 * hoursPerDay;
            double minSlackDays = minSlackMs / msPerDay;
            dto.setMinChildSlack(minSlackDays);
        } else {
            dto.setMinChildSlack(null);
        }
    }
    
    /**
     * VB.6: Маппинг total slack из Core в DTO.
     * 
     * UNIFIED-SLACK-FIX: Slack конвертируется в дни с учётом типа задачи:
     * - Elapsed задачи: 24 часа в сутках (календарное время)
     * - Обычные задачи: hoursPerDay из настроек проекта (рабочее время)
     * 
     * Отрицательный slack (просрочка) передается без обрезания для UI индикации.
     */
    private void mapSlack(Project project, NormalTask nt, TaskDataDto dto) {
        long earlyFinish = nt.getEarlyFinish();
        long lateFinish = nt.getLateFinish();
        long slackMs = lateFinish - earlyFinish;
        log.debug("[CriticalPathTrace] task='{}' early={} late={} slack={}ms critical={}",
                nt.getName(), earlyFinish, lateFinish, slackMs, nt.isCritical());
        
        try {
            // UNIFIED-SLACK-FIX: Выбираем делитель в зависимости от типа задачи
            double hoursPerDay;
            if (nt.isElapsed()) {
                // Elapsed: календарные дни = 24 часа
                hoursPerDay = 24.0;
            } else {
                // Обычные: рабочие дни из настроек проекта
                hoursPerDay = project.getCalendarOption().getHoursPerDay();
            }
            double msPerDay = 1000.0 * 60 * 60 * hoursPerDay;
            
            double totalSlackInDays = nt.getTotalSlack() / msPerDay;
            dto.setTotalSlack(totalSlackInDays);
            
            log.debug("[UNIFIED-SLACK] taskId={} name='{}' elapsed={} slackMs={} hoursPerDay={} slackDays={}",
                    dto.getId(), nt.getName(), nt.isElapsed(), nt.getTotalSlack(), hoursPerDay, totalSlackInDays);
            
            if (totalSlackInDays < 0) {
                log.debug("[VB.6] Negative slack: taskId={} name='{}' slack={} days (overdue)",
                        dto.getId(), nt.getName(), totalSlackInDays);
            }
        } catch (Exception e) {
            log.debug("[CoreTaskConverter] getTotalSlack skip taskId={}: {}", dto.getId(), e.getMessage());
        }
    }

    /**
     * Восстанавливает список predecessors для DTO. Исключает связи родитель↔потомок по WBS
     * (summary–subtask), чтобы при экспорте в API и последующем sync не возникали ошибки Core.
     */
    private void restorePredecessors(Project project, List<TaskDataDto> dtos, Map<Long, String> taskIdMap) {
        for (TaskDataDto dto : dtos) {
            Task coreTask = hierarchyMapper.findTaskById(project, dto.getId(), taskIdMap);
            if (coreTask == null) continue;
            List<String> predecessors = new ArrayList<>();
            try {
                Collection<?> deps = coreTask.getPredecessorList();
                if (deps != null) {
                    for (Object obj : deps) {
                        com.projectlibre1.pm.dependency.Dependency dep =
                                (com.projectlibre1.pm.dependency.Dependency) obj;
                        Task pred = (Task) dep.getPredecessor();
                        if (pred == null) continue;
                        if (isSummarySubtaskLink(coreTask, pred)) continue;
                        String predId = taskIdMap.get(pred.getUniqueId());
                        if (predId != null) predecessors.add(predId);
                    }
                }
            } catch (Exception e) {
                log.debug("[CoreTaskConverter] restorePredecessors skip: {}", e.getMessage());
            }
            dto.setPredecessors(predecessors);
        }
    }

    /**
     * Связь недопустима для экспорта/sync: одна задача — предок другой по WBS (summary–subtask).
     */
    private boolean isSummarySubtaskLink(Task task, Task predecessor) {
        return predecessor.wbsDescendentOf(task) || task.wbsDescendentOf(predecessor);
    }
}
