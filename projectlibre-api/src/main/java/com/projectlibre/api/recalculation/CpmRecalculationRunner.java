package com.projectlibre.api.recalculation;

import com.projectlibre1.pm.task.Project;
import com.projectlibre1.pm.task.Task;
import com.projectlibre1.pm.task.NormalTask;
import com.projectlibre1.pm.criticalpath.CriticalPath;
import java.util.Iterator;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Выполняет подготовку проекта к перерасчёту CPM и запуск recalculate().
 * 
 * <p><b>Порядок вызовов (критичен для корректности):</b></p>
 * <ol>
 *   <li>Установка границ проекта (deadline)</li>
 *   <li>Инвалидация всех расписаний (early + late)</li>
 *   <li>Запуск recalculate() — внутри него markAllTasksAsNeedingRecalculation, reset(), calculate()</li>
 * </ol>
 * <p>Пометка задач для пересчёта выполняется только в {@link com.projectlibre1.pm.task.Project#recalculate()},
 * чтобы не ломать согласованность calculationStateCount и избежать пропуска задач в doPass().</p>
 * 
 * @author ProjectLibre Team
 * @version 2.1.0
 */
public final class CpmRecalculationRunner {

    private static final Logger log = LoggerFactory.getLogger("CriticalPathTrace");
    /** Логер для диагностики сдвига дат после save/load (включить в logback: &lt;logger name="DateShiftTrace" level="INFO"/&gt;) */
    private static final Logger dateShiftLog = LoggerFactory.getLogger("DateShiftTrace");

    /**
     * Запускает перерасчёт критического пути в ядре Core.
     * 
     * <p><b>КРИТИЧНЫЙ ПОРЯДОК ОПЕРАЦИЙ:</b></p>
     * <ol>
     *   <li>Диагностика состояния до пересчёта</li>
     *   <li>Вычисление deadline (maxFinishDate)</li>
     *   <li>Инициализация CPM (initialize) - пересоздаёт sentinels, устанавливает базовые constraints</li>
     *   <li>Установка deadline ПОСЛЕ initialize (чтобы не быть перезатёртым)</li>
     *   <li>Выполнение calculate() - forward + backward pass</li>
     *   <li>Диагностика результатов</li>
     * </ol>
     */
    public void run(Project coreProject) {
        log.info("[CriticalPathTrace] === CPM RECALCULATION START ===");
        
        // Шаг 1: Диагностика состояния ДО пересчёта
        logPreRecalculationState(coreProject);
        
        // ДИАГНОСТИКА БАГА: Логируем ВСЕ даты задач ПЕРЕД CPM для сравнения между расчётами
        logAllTaskDatesBeforeCpm(coreProject);
        
        // CPM-DEADLINE-FIX: УДАЛЁН computeDeadlineForCpm() с maxFinishDate
        // Причина: maxFinishDate использовал устаревшие task.getEnd() из предыдущего CPM
        
        // Шаг 2: Инвалидация расписаний перед initialize
        prepareTasksForRecalculation(coreProject);
        
        // Шаг 3: Полная инициализация CPM (пересоздаёт sentinels и связи)
        initializeCriticalPath(coreProject);
        
        // CPM-DEADLINE-FIX: Устанавливать deadline ТОЛЬКО если есть imposed deadline
        // Если imposed deadline не задан — Core использует finishSentinel.getEarlyFinish()
        // после forward pass, что соответствует стандарту MS Project/CPM
        if (coreProject.hasImposedFinishDate()) {
            long imposedDeadline = coreProject.getImposedFinishDate();
            setDeadlineAfterInitialize(coreProject, imposedDeadline);
            log.info("[CPM-DEADLINE-FIX] Using imposed deadline: {}", imposedDeadline);
        } else {
            log.info("[CPM-DEADLINE-FIX] No imposed deadline, Core will use earlyFinish from forward pass");
        }
        
        // Шаг 4: Выполнение полного расчёта CPM (forward + backward pass)
        executeCpmCalculation(coreProject);
        
        // Шаг 5: Синхронизация служебных полей с актуальными датами
        synchronizeTaskDatesAfterCpm(coreProject);
        
        // Шаг 6: Диагностика результатов
        logRecalculationResults(coreProject);
        
        // Диагностика сдвига дат: что Core отдаёт после CPM (getStart/getEnd) для первых задач
        logTaskDatesAfterCpmForDateShiftDiagnostics(coreProject);
        
        log.info("[CriticalPathTrace] === CPM RECALCULATION END ===");
    }
    
    /**
     * Логирует getStart()/getEnd() первых задач после CPM для диагностики сдвига дат (save → load).
     * Сравнить с логами DateShiftTrace в CoreTaskConverter (что уходит в API) и на фронте (что приходит).
     */
    private void logTaskDatesAfterCpmForDateShiftDiagnostics(Project coreProject) {
        int limit = 5;
        int index = 0;
        Iterator<Task> it = coreProject.getTaskOutlineIterator();
        while (it.hasNext() && index < limit) {
            Task t = it.next();
            if (t.isExternal()) continue;
            index++;
            long startMs = t.getStart();
            long endMs = t.getEnd();
            String taskId = getTaskIdForLog(t, index);
            dateShiftLog.info("[DateShiftTrace] CORE_AFTER_CPM taskId={} name='{}' startMs={} endMs={} startIso={} endIso={}",
                    taskId, t.getName(), startMs, endMs,
                    startMs == 0 ? "null" : java.time.Instant.ofEpochMilli(startMs).toString(),
                    endMs == 0 ? "null" : java.time.Instant.ofEpochMilli(endMs).toString());
        }
    }
    
    /**
     * Вычисляет deadline для CPM без установки.
     * VB.2: Поддержка imposed finish date — явного дедлайна от пользователя.
     */
    private long computeDeadlineForCpm(Project coreProject) {
        long maxFinishDate = computeMaxFinishDate(coreProject);
        long imposedEnd = coreProject.getImposedFinishDate();
        long projectStart = coreProject.getStartConstraint();
        
        log.info("[CriticalPathTrace] DEADLINE COMPUTATION: maxFinishDate={} imposedEnd={} projectStart={}",
                maxFinishDate, imposedEnd, projectStart);
        
        if (maxFinishDate <= 0) {
            log.warn("[CriticalPathTrace] PROBLEM: maxFinishDate=0! Using fallback.");
            // Fallback: projectStart + 1 год
            if (projectStart > 0) {
                maxFinishDate = projectStart + 365L * 24 * 60 * 60 * 1000;
            } else {
                maxFinishDate = System.currentTimeMillis() + 365L * 24 * 60 * 60 * 1000;
            }
        }

        // VB.2: Выбор режима дедлайна
        long deadline;
        String source;
        
        if (imposedEnd > 0) {
            // Явный дедлайн задан пользователем — использовать ЕГО (не расширять)
            // Это позволяет получить отрицательный резерв (slack < 0) при просрочке
            deadline = imposedEnd;
            source = "imposed";
            log.info("[VB.2] Using imposed deadline: {}", deadline);
        } else {
            // Автоматический режим — использовать maxFinishDate из расчёта задач
            deadline = maxFinishDate;
            source = "automatic";
            log.info("[VB.2] Using automatic deadline (maxFinishDate): {}", deadline);
        }
        
        log.info("[CriticalPathTrace] DEADLINE COMPUTED: {} (source={})", deadline, source);
        return deadline;
    }
    
    /**
     * Инициализирует CPM: пересоздаёт sentinels, строит граф зависимостей.
     */
    private void initializeCriticalPath(Project coreProject) {
        if (!(coreProject.getSchedulingAlgorithm() instanceof CriticalPath)) {
            log.warn("[CriticalPathTrace] SchedulingAlgorithm is not CriticalPath, skipping initialization");
            return;
        }
        
        CriticalPath cp = (CriticalPath) coreProject.getSchedulingAlgorithm();
        
        log.info("[CriticalPathTrace] Initializing CriticalPath...");
        
        // Полная реинициализация: очищает список, добавляет задачи, 
        // создаёт связи sentinels, устанавливает базовые constraints
        // НО: вызывает calculate(false) внутри, который нам не нужен сейчас
        // Поэтому делаем по частям:
        
        // 1. Пересобрать список задач и sentinels
        cp.reset();
        
        // 2. Пометить все задачи для пересчёта
        coreProject.markAllTasksAsNeedingRecalculation(true);
        cp.markSentinelsForRecalculation();
        
        log.info("[CriticalPathTrace] CriticalPath initialized (sentinels rebuilt, tasks marked)");
    }
    
    /**
     * Устанавливает deadline ПОСЛЕ initialize для корректного backward pass.
     */
    private void setDeadlineAfterInitialize(Project coreProject, long deadline) {
        if (deadline <= 0) {
            log.warn("[CriticalPathTrace] Invalid deadline={}, skipping setEndConstraint", deadline);
            return;
        }
        
        log.info("[CriticalPathTrace] Setting deadline AFTER initialize: {}", deadline);
        
        coreProject.setEnd(deadline);
        coreProject.setEndConstraint(deadline);
        
        log.info("[CriticalPathTrace] Deadline set: project.end={}", coreProject.getEnd());
    }
    
    /**
     * Выполняет расчёт CPM (forward pass + backward pass).
     */
    private void executeCpmCalculation(Project coreProject) {
        if (!(coreProject.getSchedulingAlgorithm() instanceof CriticalPath)) {
            coreProject.recalculate();
            return;
        }
        
        CriticalPath cp = (CriticalPath) coreProject.getSchedulingAlgorithm();
        
        log.info("[CriticalPathTrace] Executing CPM calculation (forward + backward pass)...");
        
        // calculate(true) выполняет:
        // 1. Forward pass - вычисляет earlyStart/earlyFinish
        // 2. Backward pass - вычисляет lateStart/lateFinish  
        // 3. fireScheduleChanged() для обновления UI
        cp.calculate(true);
        
        log.info("[CriticalPathTrace] CPM calculation completed");
    }
    
    /**
     * ДИАГНОСТИКА БАГА: Логирует ВСЕ даты задач (getStart/getEnd + early/late schedules) 
     * ПЕРЕД запуском CPM для сравнения между последовательными расчётами.
     */
    private void logAllTaskDatesBeforeCpm(Project coreProject) {
        log.info("[BUG-DIAG] ===== TASK DATES BEFORE CPM =====");
        
        Iterator<Task> it = coreProject.getTaskOutlineIterator();
        int index = 0;
        while (it.hasNext()) {
            Task t = it.next();
            if (t.isExternal()) continue;
            index++;
            
            String taskId = getTaskIdForLog(t, index);
            boolean isWbsParent = t.isWbsParent();
            
            long currentStart = t.getStart();
            long currentEnd = t.getEnd();
            
            if (t instanceof com.projectlibre1.pm.task.NormalTask) {
                com.projectlibre1.pm.task.NormalTask nt = (com.projectlibre1.pm.task.NormalTask) t;
                long earlyStart = nt.getEarlyStart();
                long earlyFinish = nt.getEarlyFinish();
                long lateStart = nt.getLateStart();
                long lateFinish = nt.getLateFinish();
                
                log.info("[BUG-DIAG] {} name='{}' isParent={} start={} end={} earlyStart={} earlyFinish={} lateStart={} lateFinish={}",
                    taskId, t.getName(), isWbsParent, 
                    currentStart, currentEnd,
                    earlyStart, earlyFinish, lateStart, lateFinish);
            } else {
                log.info("[BUG-DIAG] {} name='{}' isParent={} start={} end={} (not NormalTask)",
                    taskId, t.getName(), isWbsParent, currentStart, currentEnd);
            }
        }
        
        log.info("[BUG-DIAG] ===== END TASK DATES BEFORE CPM =====");
    }
    
    /**
     * Диагностика состояния проекта ДО пересчёта.
     * Помогает понять начальное состояние данных.
     */
    private void logPreRecalculationState(Project coreProject) {
        int taskCount = 0;
        int tasksWithDates = 0;
        int tasksWithPredecessors = 0;
        int tasksWithSuccessors = 0;
        int totalPredecessors = 0;
        int totalSuccessors = 0;
        
        Iterator<Task> it = coreProject.getTaskOutlineIterator();
        while (it.hasNext()) {
            Task t = it.next();
            if (t.isExternal()) continue;
            taskCount++;
            
            if (t.getEnd() > 0 || t.getStart() > 0) tasksWithDates++;
            
            int predCount = t.getPredecessorList() != null ? t.getPredecessorList().size() : 0;
            int succCount = t.getSuccessorList() != null ? t.getSuccessorList().size() : 0;
            
            if (predCount > 0) tasksWithPredecessors++;
            if (succCount > 0) tasksWithSuccessors++;
            totalPredecessors += predCount;
            totalSuccessors += succCount;
            
            // Детальный лог для каждой задачи
            if (t instanceof NormalTask) {
                NormalTask nt = (NormalTask) t;
                log.debug("[CriticalPathTrace] PRE-TASK: name='{}' start={} end={} preds={} succs={}",
                        nt.getName(), t.getStart(), t.getEnd(), predCount, succCount);
            }
        }
        
        log.info("[CriticalPathTrace] PRE-STATE: taskCount={} withDates={} withPredecessors={} withSuccessors={} totalPredLinks={} totalSuccLinks={}",
                taskCount, tasksWithDates, tasksWithPredecessors, tasksWithSuccessors, totalPredecessors, totalSuccessors);
        
        // ВАЖНО: Если нет связей между задачами, CPM не будет работать корректно!
        if (totalPredecessors == 0 && taskCount > 1) {
            log.warn("[CriticalPathTrace] WARNING: No predecessor links found! All tasks will be connected directly to sentinels.");
        }
    }

    /**
     * Подготавливает задачи к пересчёту: инвалидация расписаний.
     */
    private void prepareTasksForRecalculation(Project coreProject) {
        log.info("[CriticalPathTrace] Preparing tasks: invalidating schedules...");
        invalidateAllTaskSchedules(coreProject);
        coreProject.setAllDirty();
        log.info("[CriticalPathTrace] Tasks prepared");
    }

    /**
     * Инвалидирует ВСЕ расписания (early + late) для всех задач.
     * Критично для корректного расчёта критического пути после синхронизации.
     */
    private void invalidateAllTaskSchedules(Project coreProject) {
        Iterator<Task> it = coreProject.getTaskOutlineIterator();
        while (it.hasNext()) {
            Task task = it.next();
            if (!task.isExternal()) {
                task.invalidateSchedules();
            }
        }
    }

    private void logRecalculationResults(Project coreProject) {
        int[] counts = countTasksAndCritical(coreProject);
        List<String> criticalIds = collectCriticalTaskIds(coreProject);
        log.info("[CriticalPathTrace] layer=core taskCount={} criticalCount={} criticalTaskIds={}",
                counts[0], counts[1], criticalIds);
        
        // Детальная диагностика каждой задачи: early/late даты и slack
        logDetailedTaskDiagnostics(coreProject);
        
        // Диагностика sentinels
        logSentinelDiagnostics(coreProject);
    }
    
    /**
     * Детальная диагностика каждой задачи: earlyFinish, lateFinish, slack, critical.
     * Критично для понимания почему все задачи критические или все некритические.
     */
    private void logDetailedTaskDiagnostics(Project coreProject) {
        Iterator<Task> it = coreProject.getTaskOutlineIterator();
        int index = 0;
        while (it.hasNext()) {
            Task t = it.next();
            if (t.isExternal()) continue;
            index++;
            
            if (t instanceof NormalTask) {
                NormalTask nt = (NormalTask) t;
                long earlyFinish = nt.getEarlyFinish();
                long lateFinish = nt.getLateFinish();
                long earlyStart = nt.getEarlyStart();
                long lateStart = nt.getLateStart();
                long slack = lateFinish - earlyFinish;
                boolean critical = nt.isCritical();
                
                String taskId = getTaskIdForLog(t, index);
                
                // Диагностика исторических дат для отслеживания Бага #2
                long customDate1 = readCustomDateSafe(t, 1);
                long scheduleFinish = readScheduleFinishSafe(t);
                
                // CONSTRAINT-FIX: Добавлена диагностика constraint для отладки CPM
                int constraintType = nt.getConstraintType();
                long constraintDate = nt.getConstraintDate();
                
                log.info("[CriticalPathTrace] task={} name='{}' constraintType={} constraintDate={} earlyStart={} earlyFinish={} lateStart={} lateFinish={} slack={}ms critical={} customDate1={} scheduleFinish={}",
                        taskId, nt.getName(), constraintType, constraintDate, earlyStart, earlyFinish, lateStart, lateFinish, slack, critical, customDate1, scheduleFinish);
                
                // Предупреждения о нулевых датах
                if (earlyFinish == 0) {
                    log.warn("[CriticalPathTrace] PROBLEM: task={} has earlyFinish=0 - forward pass may have failed", taskId);
                }
                if (lateFinish == 0) {
                    log.warn("[CriticalPathTrace] PROBLEM: task={} has lateFinish=0 - backward pass may have failed", taskId);
                }
            }
        }
    }
    
    /**
     * Диагностика sentinels: проверка что они корректно настроены для CPM.
     */
    private void logSentinelDiagnostics(Project coreProject) {
        if (!(coreProject.getSchedulingAlgorithm() instanceof CriticalPath)) {
            log.warn("[CriticalPathTrace] SchedulingAlgorithm is not CriticalPath!");
            return;
        }
        
        CriticalPath cp = (CriticalPath) coreProject.getSchedulingAlgorithm();
        
        // Получаем информацию о границах проекта
        long projectStart = coreProject.getStartConstraint();
        long projectEnd = coreProject.getEnd();
        long projectFinishDate = coreProject.getFinishDate();
        
        log.info("[CriticalPathTrace] project: startConstraint={} end={} finishDate={} isForward={}",
                projectStart, projectEnd, projectFinishDate, cp.isForward());
        
        // Логируем earliestStart и latestFinish из CriticalPath
        log.info("[CriticalPathTrace] criticalPath: earliestStart={} latestFinish={}",
                cp.getEarliestStart(), cp.getLatestFinish());
    }

    /**
     * Подсчёт задач и критических в Core после recalculate.
     * @return int[3]: { taskCount, criticalCount, 0 }
     */
    private int[] countTasksAndCritical(Project coreProject) {
        int taskCount = 0;
        int criticalCount = 0;
        Iterator<Task> it = coreProject.getTaskOutlineIterator();
        while (it.hasNext()) {
            Task t = it.next();
            if (t.isExternal()) continue;
            taskCount++;
            if (t.isCritical()) criticalCount++;
        }
        return new int[] { taskCount, criticalCount, 0 };
    }

    /**
     * Список ID критических задач (CustomText(0) или индекс) для трассировки расхождений.
     */
    private List<String> collectCriticalTaskIds(Project coreProject) {
        List<String> ids = new ArrayList<>();
        Iterator<Task> it = coreProject.getTaskOutlineIterator();
        int index = 1;
        while (it.hasNext()) {
            Task t = it.next();
            if (t.isExternal()) continue;
            if (t.isCritical()) {
                String id = getTaskIdForLog(t, index);
                if (id != null) ids.add(id);
            }
            index++;
        }
        return ids;
    }

    private static String getTaskIdForLog(Task task, int fallbackIndex) {
        try {
            String id = task.getCustomText(0);
            if (id != null && !id.trim().isEmpty()) return id;
        } catch (Exception ignored) {}
        return String.valueOf(fallbackIndex);
    }

    /**
     * Максимальная дата окончания по всем задачам. Учитывает расчётное окончание (getEnd) и
     * запланированное из синхронизатора (getCustomDate(1)), чтобы после синка deadline был корректен.
     */
    private long computeMaxFinishDate(Project coreProject) {
        long max = 0;
        Iterator<Task> it = coreProject.getTaskOutlineIterator();
        while (it.hasNext()) {
            long end = getTaskEndForCpm(it.next());
            if (end > max) {
                max = end;
            }
        }
        // Fallback для новых проектов: если по задачам дат нет, взять дату окончания проекта или начало + 1 год
        if (max == 0) {
            long fallback = coreProject.getFinishDate();
            if (fallback > 0) {
                max = fallback;
            } else {
                long start = coreProject.getStartDate();
                if (start > 0) {
                    max = start + 365L * 24 * 60 * 60 * 1000;
                }
            }
        }
        return max;
    }

    /**
     * Эффективная дата окончания задачи для расчёта CPM с приоритетами.
     * 
     * <p><b>ИСПРАВЛЕНИЕ БАГА #2:</b> Используем приоритеты вместо максимума, чтобы избежать
     * накопления исторических "максимальных" дат при перемещении задач.</p>
     * 
     * <p><b>Приоритеты источников данных:</b></p>
     * <ol>
     *   <li><b>getEnd()</b> — самая актуальная дата после последнего CPM расчёта (высший приоритет)</li>
     *   <li><b>getCustomDate(1)</b> — дата после синхронизации с фронтом (средний приоритет)</li>
     *   <li><b>getCurrentSchedule().getFinish()</b> — дата при загрузке из .pod файла (низший приоритет)</li>
     * </ol>
     * 
     * <p>После успешного CPM расчёта все источники синхронизируются методом
     * {@link #synchronizeTaskDatesAfterCpm(Project)}, поэтому использование приоритетов
     * гарантирует что deadline всегда рассчитывается от актуальных дат.</p>
     */
    private long getTaskEndForCpm(Task task) {
        // Приоритет 1: getEnd() - самая актуальная дата после последнего CPM
        long fromEnd = task.getEnd();
        if (fromEnd > 0) {
            return fromEnd; // Если есть актуальная дата - используем её
        }
        
        // Приоритет 2: CustomDate(1) - дата после синхронизации с фронтом
        long fromCustom = readCustomDateSafe(task, 1);
        if (fromCustom > 0) {
            return fromCustom;
        }
        
        // Приоритет 3: CurrentSchedule - дата при загрузке из файла
        long fromSchedule = readScheduleFinishSafe(task);
        return fromSchedule;
    }

    private long readCustomDateSafe(Task task, int index) {
        try {
            long v = task.getCustomDate(index);
            return v > 0 ? v : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    private long readScheduleFinishSafe(Task task) {
        try {
            if (task.getCurrentSchedule() == null) return 0;
            long v = task.getCurrentSchedule().getFinish();
            return v > 0 ? v : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Синхронизирует все служебные поля задач с актуальными датами после CPM расчёта.
     * 
     * <p><b>ИСПРАВЛЕНИЕ БАГА #2:</b> Предотвращает накопление исторических максимумов
     * в CustomDate(1) и CurrentSchedule.finish после перемещения задач.</p>
     * 
     * <p>После каждого успешного CPM расчёта все служебные поля синхронизируются
     * с актуальными датами из getStart()/getEnd(), что гарантирует корректность
     * deadline при следующем пересчёте.</p>
     */
    private void synchronizeTaskDatesAfterCpm(Project coreProject) {
        Iterator<Task> it = coreProject.getTaskOutlineIterator();
        int syncedCount = 0;
        
        while (it.hasNext()) {
            Task task = it.next();
            if (task.isExternal()) continue;
            
            long actualStart = task.getStart();
            long actualEnd = task.getEnd();
            
            // Синхронизируем CustomDate(1) с актуальной датой окончания
            if (actualEnd > 0) {
                try {
                    long oldCustomDate = readCustomDateSafe(task, 1);
                    if (oldCustomDate != actualEnd) {
                        task.setCustomDate(1, actualEnd);
                        syncedCount++;
                        log.debug("[CriticalPathTrace] Synced CustomDate(1) for task '{}': {} -> {}", 
                                task.getName(), oldCustomDate, actualEnd);
                    }
                } catch (Exception e) {
                    log.warn("[CriticalPathTrace] Failed to sync CustomDate(1) for task '{}': {}", 
                            task.getName(), e.getMessage());
                }
            }
            
            // CurrentSchedule уже обновляется в calcDates, но проверим и синхронизируем при необходимости
            if (task.getCurrentSchedule() != null) {
                boolean scheduleUpdated = false;
                
                if (actualStart > 0 && task.getCurrentSchedule().getStart() != actualStart) {
                    task.getCurrentSchedule().setStart(actualStart);
                    scheduleUpdated = true;
                }
                
                if (actualEnd > 0 && task.getCurrentSchedule().getFinish() != actualEnd) {
                    task.getCurrentSchedule().setFinish(actualEnd);
                    scheduleUpdated = true;
                }
                
                if (scheduleUpdated) {
                    log.debug("[CriticalPathTrace] Synced CurrentSchedule for task '{}'", task.getName());
                }
            }
        }
        
        log.info("[CriticalPathTrace] Task dates synchronized after CPM: {} CustomDate(1) fields updated", syncedCount);
    }
}
