package com.projectlibre.api.converter;

import com.projectlibre.api.dto.ProjectDataDto.TaskDataDto;
import com.projectlibre1.pm.task.Task;
import com.projectlibre1.pm.task.NormalTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Маппер дат задач из Core в API DTO.
 * 
 * V2.0 HYBRID-CPM: Добавлен маппинг early/late дат для информирования пользователя.
 * 
 * Clean Architecture: Adapter (Interface Layer).
 * SOLID: Single Responsibility - только маппинг дат задач.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
public class TaskDateMapper {
    
    private static final Logger log = LoggerFactory.getLogger("CriticalPathTrace");
    private final DateTimeMapper dateMapper;
    
    public TaskDateMapper() {
        this.dateMapper = new DateTimeMapper();
    }
    
    /**
     * Маппинг CPM-рассчитанных дат из Core в DTO.
     * 
     * HYBRID-CPM: Передаём полный набор CPM-дат для информирования Frontend:
     * - startDate/endDate — текущие даты задачи
     * - calculatedStartDate/calculatedEndDate — CPM-рассчитанные даты
     * - earlyStart/earlyFinish — когда задача МОЖЕТ начаться/закончиться
     * - lateStart/lateFinish — крайние сроки без сдвига проекта
     * 
     * Frontend использует эти данные для:
     * - Отображения slack (запаса времени)
     * - Предупреждения о нарушении зависимостей
     * - Полной свободы размещения задач пользователем
     */
    public void mapDates(Task coreTask, TaskDataDto dto) {
        long start = coreTask.getStart();
        long end = coreTask.getEnd();
        
        String startIso = dateMapper.toIsoString(start);
        String endIso = dateMapper.toIsoString(end);
        
        // Стандартные поля (текущие даты задачи)
        dto.setStartDate(startIso);
        dto.setEndDate(endIso);
        
        // CORE-AUTH: CPM-рассчитанные даты (авторитетный источник)
        dto.setCalculatedStartDate(startIso);
        dto.setCalculatedEndDate(endIso);
        
        // HYBRID-CPM: Маппинг early/late дат для NormalTask
        mapCpmScheduleWindow(coreTask, dto);
        
        // Диагностика
        logDateMapping(coreTask, dto, start, end, startIso, endIso);
    }
    
    /**
     * HYBRID-CPM: Маппинг CPM schedule window (early/late даты).
     * Эти даты показывают "окно возможностей" для задачи:
     * - earlyStart/earlyFinish — самое раннее когда можно начать/закончить
     * - lateStart/lateFinish — самое позднее без сдвига проекта
     */
    private void mapCpmScheduleWindow(Task coreTask, TaskDataDto dto) {
        if (!(coreTask instanceof NormalTask)) {
            return;
        }
        
        NormalTask nt = (NormalTask) coreTask;
        
        try {
            // Early dates (Forward Pass результат)
            long earlyStart = nt.getEarlyStart();
            long earlyFinish = nt.getEarlyFinish();
            
            // Late dates (Backward Pass результат)
            long lateStart = nt.getLateStart();
            long lateFinish = nt.getLateFinish();
            
            // Конвертируем в ISO
            dto.setEarlyStart(dateMapper.toIsoString(earlyStart));
            dto.setEarlyFinish(dateMapper.toIsoString(earlyFinish));
            dto.setLateStart(dateMapper.toIsoString(lateStart));
            dto.setLateFinish(dateMapper.toIsoString(lateFinish));
            
            // HYBRID-CPM: Детальная трассировка для диагностики
            log.debug("[HYBRID-CPM] taskId={} name='{}' earlyStart={} earlyFinish={} lateStart={} lateFinish={} slack={}ms",
                    dto.getId(), nt.getName(), 
                    earlyStart, earlyFinish, lateStart, lateFinish,
                    lateFinish - earlyFinish);
                    
        } catch (Exception e) {
            log.warn("[HYBRID-CPM] Failed to map CPM window for taskId={}: {}", 
                    dto.getId(), e.getMessage());
        }
    }
    
    /**
     * Логирование маппинга дат для диагностики.
     */
    private void logDateMapping(Task coreTask, TaskDataDto dto, 
            long start, long end, String startIso, String endIso) {
        if (start == 0 || end == 0) {
            log.warn("[CriticalPathTrace] mapDates zero date taskId={} name={} start={} end={}",
                    dto.getId(), coreTask.getName(), start, end);
        } else if (start == end && 
                !(coreTask instanceof NormalTask && ((NormalTask) coreTask).isMarkTaskAsMilestone())) {
            log.warn("[CriticalPathTrace] mapDates same-day task (possible collapse) taskId={} name={} start={} end={}",
                    dto.getId(), coreTask.getName(), start, end);
        }
        log.debug("[CriticalPathTrace] mapDates taskId={} name={} start={} end={} startIso={} endIso={}",
                dto.getId(), coreTask.getName(), start, end, startIso, endIso);
    }
}
