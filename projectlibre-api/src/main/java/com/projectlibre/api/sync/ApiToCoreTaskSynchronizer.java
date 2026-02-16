package com.projectlibre.api.sync;

import com.projectlibre.api.dto.TaskSyncRequestDto;
import com.projectlibre.api.dto.TaskSyncRequestDto.FrontendTaskDto;
import com.projectlibre.api.converter.DateTimeMapper;
import com.projectlibre.api.validator.MilestoneProgressValidator;
import com.projectlibre1.datatype.Duration;
import com.projectlibre1.pm.scheduling.ConstraintType;
import com.projectlibre1.pm.scheduling.SchedulingType;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.pm.task.NormalTask;
import com.projectlibre1.pm.task.Task;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Синхронизатор задач из Frontend (Zustand) в Core Project.
 * Обеспечивает перенос свойств задач, WBS иерархии, зависимостей и назначений.
 * 
 * Принцип SRP: координирует работу специализированных синхронизаторов.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
public class ApiToCoreTaskSynchronizer {
    
    private int syncedCount;
    private int skippedCount;
    
    private final WbsHierarchySynchronizer wbsSynchronizer;
    private final DependencySynchronizer dependencySynchronizer;
    private final ResourceAssignmentSynchronizer resourceSynchronizer;
    private final DateTimeMapper dateMapper = new DateTimeMapper();
    
    /** PERSISTENT-CONFLICT: ObjectMapper для сериализации acknowledgedConflicts в JSON */
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public ApiToCoreTaskSynchronizer() {
        this.wbsSynchronizer = new WbsHierarchySynchronizer();
        this.dependencySynchronizer = new DependencySynchronizer();
        this.resourceSynchronizer = new ResourceAssignmentSynchronizer();
    }
    
    /**
     * Синхронизирует задачи из Frontend в Core Project.
     * 
     * @param project Core Project для синхронизации
     * @param request Запрос с задачами из Frontend
     * @return SyncResult с результатами синхронизации
     */
    public SyncResult synchronize(Project project, TaskSyncRequestDto request) {
        if (project == null) {
            return SyncResult.error("Project is null");
        }
        
        if (request == null || request.getTasks() == null) {
            return SyncResult.error("Request or tasks is null");
        }
        
        syncedCount = 0;
        skippedCount = 0;
        
        // Приостанавливаем внутренние calculate() в CriticalPath до конца синхронизации,
        // чтобы избежать частичных пересчётов по каждому ObjectEvent (гонка с CpmRecalculationRunner).
        int transactionId = project.fireMultipleTransaction(0, true);
        
        try {
            List<FrontendTaskDto> frontendTasks = request.getTasks();
            
            // ФАЗА 1: Структурная синхронизация (Discovery, WBS, Links)
            
            // 1.1 Собираем карту существующих задач в Core
            Map<String, NormalTask> existingTasks = new HashMap<>();
            Iterator<Task> iterator = project.getTaskOutlineIterator();
            while (iterator.hasNext()) {
                Task t = iterator.next();
                if (t instanceof NormalTask && !t.isExternal()) {
                    existingTasks.put(t.getName(), (NormalTask) t);
                }
            }
            
            // 1.2 Находим или создаем все задачи
            Map<String, NormalTask> taskMap = new HashMap<>();
            for (FrontendTaskDto frontendTask : frontendTasks) {
                NormalTask coreTask = existingTasks.get(frontendTask.getName());
                if (coreTask == null) {
                    coreTask = project.createScriptedTask();
                    coreTask.setName(frontendTask.getName());
                }
                taskMap.put(frontendTask.getId(), coreTask);
            }
            
            // 1.3 Удаляем лишние задачи
            removeObsoleteTasks(project, frontendTasks);
            
            // 1.4 Восстанавливаем иерархию (WBS)
            // Это ДОЛЖНО быть до обновления свойств, чтобы Core знал структуру
            wbsSynchronizer.synchronize(project, frontendTasks, taskMap);
            
            // 1.5 Восстанавливаем зависимости (Links)
            dependencySynchronizer.synchronize(frontendTasks, taskMap);
            
            // ФАЗА 2: Информационная синхронизация (Dates, Progress, Notes)
            for (FrontendTaskDto frontendTask : frontendTasks) {
                NormalTask coreTask = taskMap.get(frontendTask.getId());
                if (coreTask != null) {
                    updateTaskProperties(project, coreTask, frontendTask);
                    syncedCount++;
                }
            }

            // ФАЗА 3: Назначения ресурсов (resourceIds уже подставлены контроллером по mapping)
            resourceSynchronizer.synchronize(project, frontendTasks, taskMap);

            return SyncResult.success(syncedCount, skippedCount);
            
        } catch (Exception e) {
            System.err.println("[ApiToCoreSync] ❌ FATAL SYNC ERROR");
            System.err.println("[ApiToCoreSync] Error: " + e.getClass().getName() + ": " + e.getMessage());
            System.err.println("[ApiToCoreSync] Stack trace:");
            e.printStackTrace();
            
            if (e.getCause() != null) {
                System.err.println("[ApiToCoreSync] Caused by: " + e.getCause().getMessage());
                e.getCause().printStackTrace();
            }
            
            return SyncResult.error(e.getClass().getSimpleName() + ": " + e.getMessage());
        } finally {
            project.fireMultipleTransaction(transactionId, false);
        }
    }
    
    /** Логгер для детальной диагностики синхронизации дат */
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger("DateSyncDiag");
    
    /**
     * Обновляет свойства задачи: даты, длительность, прогресс, заметки.
     * Использует рабочий календарь проекта для профессиональной конвертации длительности.
     * Синхронизация выполняется по схеме Start + Duration (без явного setFinish).
     * 
     * @param project проект для доступа к рабочему календарю
     * @param coreTask задача Core для обновления
     * @param frontendTask данные из Frontend
     */
    private void updateTaskProperties(Project project, NormalTask coreTask, FrontendTaskDto frontendTask) {
        String taskId = frontendTask.getId();
        String taskName = frontendTask.getName();
        
        // ДИАГНОСТИКА: Логируем состояние Core ДО синхронизации
        long coreStartBefore = coreTask.getStart();
        long coreEndBefore = coreTask.getEnd();
        long coreDurationBefore = coreTask.getDuration();
        
        log.info("[DATE-SYNC-DIAG] === SYNC START for {} '{}' ===", taskId, taskName);
        log.info("[DATE-SYNC-DIAG] CORE_BEFORE: start={} end={} duration={} isSummary={}",
            coreStartBefore, coreEndBefore, coreDurationBefore, coreTask.isSummary());
        
        coreTask.setName(frontendTask.getName());
        coreTask.setCustomText(0, frontendTask.getId());
        
        long start = dateMapper.toMillis(frontendTask.getStartDate());
        long end = dateMapper.toMillis(frontendTask.getEndDate());
        
        // ДИАГНОСТИКА: Логируем данные из Frontend
        log.info("[DATE-SYNC-DIAG] FRONTEND_INPUT: startDate='{}' endDate='{}' duration={} startMs={} endMs={}",
            frontendTask.getStartDate(), frontendTask.getEndDate(), 
            frontendTask.getDuration(), start, end);
        
        if (start > 0) {
            // Сохраняем "желаемые" даты с фронтенда в кастомные поля для диагностики
            try {
                coreTask.setCustomDate(0, start);
                if (end > 0) coreTask.setCustomDate(1, end);
            } catch (Exception e) {}
            
            // Устанавливаем начало задачи
            coreTask.getCurrentSchedule().setStart(start);
            log.info("[DATE-SYNC-DIAG] SET_START: {} (schedule.setStart)", start);
            
            // Синхронизация Start + Duration (без явного setFinish)
            if (!coreTask.isSummary()) {
                long durationMillis = calculateDurationMillis(frontendTask, start, end, taskId);
                log.info("[DATE-SYNC-DIAG] DURATION_CALCULATED: raw={} isElapsed={}", 
                    Duration.millis(durationMillis), Duration.isElapsed(durationMillis));
                
                if (durationMillis > 0) {
                    // DURATION-SYNC-FIX: duration уже содержит ELAPSED флаг из calculateDurationMillis
                    // НЕ применяем setAsEstimated поверх, чтобы не потерять elapsed
                    coreTask.setDuration(durationMillis);
                    log.info("[DATE-SYNC-DIAG] SET_DURATION: {} ms", durationMillis);
                }
                
                // CONSTRAINT-FIX: Применяем constraint по стандарту MS Project
                applyStartDateConstraint(coreTask, start, frontendTask);
            }
            
            updateTaskProgress(coreTask, frontendTask);
        }
        
        coreTask.setMarkTaskAsMilestone(frontendTask.isMilestone());
        if (frontendTask.getNotes() != null) {
            coreTask.setNotes(frontendTask.getNotes());
        }
        
        // PERSISTENT-CONFLICT: Сохраняем acknowledgedConflicts в customText(1) как JSON
        Map<String, Boolean> conflicts = frontendTask.getAcknowledgedConflicts();
        if (conflicts != null && !conflicts.isEmpty()) {
            try {
                String conflictsJson = objectMapper.writeValueAsString(conflicts);
                coreTask.setCustomText(1, conflictsJson);
                log.info("[PERSISTENT-CONFLICT] Saved acknowledgedConflicts for task '{}': {}", 
                    taskName, conflictsJson);
            } catch (JsonProcessingException e) {
                log.warn("[PERSISTENT-CONFLICT] Failed to serialize acknowledgedConflicts for task '{}': {}", 
                    taskName, e.getMessage());
            }
        } else {
            // Очищаем customText(1) если конфликтов нет
            coreTask.setCustomText(1, null);
        }
        
        // A.2: Тип планирования (fixed_units / fixed_duration / fixed_work) из Frontend
        int schedulingType = schedulingTypeFromString(frontendTask.getType());
        if (schedulingType >= 0) {
            coreTask.setSchedulingType(schedulingType);
        }
        
        // ДИАГНОСТИКА: Логируем состояние Core ПОСЛЕ синхронизации
        long coreStartAfter = coreTask.getStart();
        long coreEndAfter = coreTask.getEnd();
        long coreDurationAfter = coreTask.getDuration();
        
        log.info("[DATE-SYNC-DIAG] CORE_AFTER: start={} end={} duration={}", 
            coreStartAfter, coreEndAfter, coreDurationAfter);
        log.info("[DATE-SYNC-DIAG] DELTA: startDiff={} endDiff={} durationDiff={}",
            coreStartAfter - coreStartBefore, coreEndAfter - coreEndBefore, 
            coreDurationAfter - coreDurationBefore);
        log.info("[DATE-SYNC-DIAG] === SYNC END for {} '{}' ===", taskId, taskName);
    }
    
    /** A.2: Маппинг строки типа планирования из Frontend в константу SchedulingType. Возвращает -1 если не распознано. */
    private static int schedulingTypeFromString(String typeStr) {
        if (typeStr == null || typeStr.isEmpty()) {
            return -1;
        }
        String normalized = typeStr.trim().toLowerCase();
        switch (normalized) {
            case "fixed_units":
                return SchedulingType.FIXED_UNITS;
            case "fixed_duration":
                return SchedulingType.FIXED_DURATION;
            case "fixed_work":
                return SchedulingType.FIXED_WORK;
            default:
                return -1;
        }
    }
    
    /** Миллисекунд в одном календарном дне (24 часа) */
    private static final long MS_PER_CALENDAR_DAY = 24L * 60 * 60 * 1000;
    
    /**
     * Вычисляет длительность задачи как ELAPSED (календарное время).
     * 
     * DURATION-PRIORITY-FIX: ПРИОРИТЕТ точным датам (end - start) над округлённым durationDays!
     * 
     * Проблема до фикса:
     *   - Frontend отправлял endMs = 15.02 23:59:59.999 (ТОЧНО)
     *   - Frontend отправлял durationDays = 9.0 (ОКРУГЛЕНО до целого)
     *   - Java использовала durationDays → start + 9 дней = 16.02 00:00:00 ❌
     *   - Результат: дата "плавала" на +1 день при каждом Pulse
     * 
     * Решение:
     *   - ПРИОРИТЕТ 1: (end - start) — точное значение от пользователя
     *   - ПРИОРИТЕТ 2: durationDays — только как fallback если нет точных дат
     * 
     * @param frontendTask данные задачи из Frontend
     * @param start дата начала в миллисекундах
     * @param end дата окончания в миллисекундах
     * @param taskId идентификатор задачи для логирования
     * @return encoded duration с флагом ELAPSED
     */
    private long calculateDurationMillis(FrontendTaskDto frontendTask, long start, long end, String taskId) {
        Double durationDays = frontendTask.getDuration();
        
        log.info("[DATE-SYNC-DIAG] {} CALC_DURATION: frontendDays={} start={} end={} diff={}ms diffDays={}",
            taskId, durationDays, start, end, (end - start), 
            (end - start) / (double) MS_PER_CALENDAR_DAY);
        
        // DURATION-PRIORITY-FIX: ПРИОРИТЕТ точным датам над округлённым duration!
        // Frontend присылает endMs = 15.02 23:59:59.999 (точно) и duration = 9.0 (округлено).
        // Используем (end - start) для сохранения точности до миллисекунды.
        
        if (end > start) {
            // ПРИОРИТЕТ 1: Точный расчёт из дат (end - start)
            // Это гарантирует что Core вычислит new_end = start + (end - start) = end (точно!)
            long durationMillis = end - start;
            
            log.info("[DATE-SYNC-DIAG] {} USING_EXACT_DATE_DIFF: (end-start)={}ms ({}days)", 
                taskId, durationMillis, durationMillis / (double) MS_PER_CALENDAR_DAY);
            
            // Устанавливаем флаг ELAPSED — Core сделает start + duration без пропуска выходных
            return Duration.setAsElapsed(durationMillis);
        } else if (durationDays != null && durationDays > 0) {
            // ПРИОРИТЕТ 2: Fallback на durationDays (только если end <= start или нет точных дат)
            // Это может произойти для новых задач где end ещё не установлен
            long durationMillis = (long) (durationDays * MS_PER_CALENDAR_DAY);
            
            log.info("[DATE-SYNC-DIAG] {} FALLBACK_DURATION_DAYS: {}days -> {}ms (end<=start, using frontend duration)", 
                taskId, durationDays, durationMillis);
            
            return Duration.setAsElapsed(durationMillis);
        }
        
        log.warn("[DATE-SYNC-DIAG] {} NO_DURATION: end<=start ({}<={}) and durationDays={}", 
            taskId, end, start, durationDays);
        return 0;
    }
    
    /**
     * Обновляет прогресс задачи с учётом типа (веха vs обычная задача).
     * 
     * <p><b>Бизнес-правила:</b></p>
     * <ul>
     *   <li>Вехи: прогресс нормализуется до 0.0 или 1.0</li>
     *   <li>Обычные задачи: прогресс округляется до 2 знаков</li>
     *   <li>Summary tasks: прогресс игнорируется (вычисляется Core автоматически)</li>
     * </ul>
     * 
     * @param coreTask задача в ProjectLibre Core
     * @param frontendTask задача из Frontend
     */
    private void updateTaskProgress(NormalTask coreTask, FrontendTaskDto frontendTask) {
        if (coreTask.isSummary()) {
            return;
        }
        
        double rawProgress = frontendTask.getProgress();
        boolean isMilestone = frontendTask.isMilestone();
        
        double normalizedProgress = MilestoneProgressValidator.normalizeProgress(
            rawProgress, 
            isMilestone
        );
        
        coreTask.setPercentComplete(normalizedProgress);
    }
    
    /**
     * Применяет constraint для даты начала задачи по стандарту MS Project.
     * 
     * <p>Правило MS Project: когда пользователь явно задаёт дату начала для
     * auto-scheduled задачи, применяется SNET (Start No Earlier Than).</p>
     * 
     * <p>Исключение: если у задачи есть predecessors — ASAP, чтобы CPM
     * рассчитал earlyStart от predecessors.</p>
     * 
     * @param coreTask задача в Core
     * @param startDate дата начала в миллисекундах
     * @param frontendTask данные из Frontend для проверки predecessors
     */
    private void applyStartDateConstraint(NormalTask coreTask, long startDate, 
                                          FrontendTaskDto frontendTask) {
        String taskId = frontendTask.getId();
        try {
            boolean hasPredecessors = frontendTask.getPredecessors() != null 
                                    && !frontendTask.getPredecessors().isEmpty();
            
            // ДИАГНОСТИКА БАГА КРИТИЧЕСКОГО ПУТИ: Логируем установку constraint
            log.info("[CONSTRAINT-DIAG] taskId={} hasPredecessors={} frontendPreds={} startDateMs={} setting={}",
                taskId,
                hasPredecessors,
                frontendTask.getPredecessors(),
                startDate,
                hasPredecessors ? "ASAP" : "SNET=" + startDate);
            
            if (hasPredecessors) {
                // Есть predecessors — ASAP: CPM рассчитает дату от predecessors
                coreTask.setScheduleConstraint(ConstraintType.ASAP, 0);
            } else {
                // Нет predecessors — SNET: задача не может начаться раньше указанной даты
                coreTask.setScheduleConstraint(ConstraintType.SNET, startDate);
            }
            
            // ДИАГНОСТИКА: Проверяем что constraint установился
            long windowEarlyStartAfter = coreTask.getWindowEarlyStart();
            int constraintTypeAfter = coreTask.getConstraintType();
            log.info("[CONSTRAINT-DIAG] taskId={} AFTER_SET: constraintType={} windowEarlyStart={}",
                taskId, constraintTypeAfter, windowEarlyStartAfter);
                
        } catch (Exception e) {
            log.error("[CONSTRAINT-DIAG] taskId={} EXCEPTION: {}", taskId, e.getMessage());
            // Fallback: ASAP при ошибке
            try {
                coreTask.setConstraintType(ConstraintType.ASAP);
            } catch (Exception ignored) {
                // Игнорируем вложенную ошибку
            }
        }
    }

    /**
     * Удаляет задачи, которых нет в списке фронтенда.
     */
    private void removeObsoleteTasks(Project project, List<FrontendTaskDto> frontendTasks) {
        List<String> frontendNames = new ArrayList<>();
        for (FrontendTaskDto dto : frontendTasks) {
            frontendNames.add(dto.getName());
        }

        List<Task> toRemove = new ArrayList<>();
        Iterator<Task> iterator = project.getTaskOutlineIterator();
        while (iterator.hasNext()) {
            Task t = iterator.next();
            if (!t.isExternal() && !frontendNames.contains(t.getName())) {
                toRemove.add(t);
            }
        }

        for (Task t : toRemove) {
            try {
                project.remove(t, null, true, false, true);
            } catch (Exception e) {
                System.err.println("[ApiToCoreSync] Failed to remove task: " + t.getName());
            }
        }
    }

}
