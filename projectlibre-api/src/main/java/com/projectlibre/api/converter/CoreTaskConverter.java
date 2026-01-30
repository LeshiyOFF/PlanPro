package com.projectlibre.api.converter;

import com.projectlibre.api.dto.ProjectDataDto.TaskDataDto;
import com.projectlibre.api.validator.MilestoneProgressValidator;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.pm.task.Task;
import com.projectlibre1.pm.task.NormalTask;
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
    
    private static final Logger log = LoggerFactory.getLogger(CoreTaskConverter.class);
    private final DateTimeMapper dateMapper = new DateTimeMapper();
    private final TaskHierarchyMapper hierarchyMapper = new TaskHierarchyMapper();
    
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
                result.add(convertSingleTask(coreTask, taskId, taskIdMap));
            }
            restorePredecessors(project, result, taskIdMap);
        } catch (Exception e) {
            log.error("[CoreTaskConverter] Conversion failed: {}", e.getMessage());
        }
        return result;
    }

    private String getOrGenerateId(Task task, int index) {
        String taskId = task.getCustomText(0);
        return (taskId == null || taskId.trim().isEmpty()) ? String.valueOf(index) : taskId;
    }

    private TaskDataDto convertSingleTask(Task coreTask, String taskId, Map<Long, String> taskIdMap) {
        TaskDataDto dto = new TaskDataDto();
        dto.setId(taskId);
        dto.setName(coreTask.getName() != null ? coreTask.getName() : "Unnamed Task");
        mapDates(coreTask, dto);
        mapProgress(coreTask, dto);
        mapHierarchy(coreTask, dto, taskIdMap);
        mapFlags(coreTask, dto);
        dto.setWbs(coreTask.getWbs() != null ? coreTask.getWbs() : taskId);
        dto.setNotes(coreTask.getNotes() != null ? coreTask.getNotes() : "");
        dto.setResourceIds(hierarchyMapper.getResourceIds(coreTask));
        return dto;
    }

    private void mapDates(Task coreTask, TaskDataDto dto) {
        long start = coreTask.getStart();
        long end = coreTask.getEnd();
        try {
            long savedStart = coreTask.getCustomDate(0);
            long savedEnd = coreTask.getCustomDate(1);
            if (savedStart > 0 && savedEnd > 0) {
                start = savedStart;
                end = savedEnd;
            }
        } catch (Exception e) {}
        dto.setStartDate(dateMapper.toIsoString(start));
        dto.setEndDate(dateMapper.toIsoString(end));
    }

    private void mapProgress(Task coreTask, TaskDataDto dto) {
        double progress = 0.0;
        boolean isMilestone = false;
        
        if (coreTask instanceof NormalTask) {
            NormalTask normalTask = (NormalTask) coreTask;
            progress = normalTask.getPercentComplete();
            isMilestone = normalTask.isMarkTaskAsMilestone();
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

    private void mapFlags(Task coreTask, TaskDataDto dto) {
        boolean isMilestone = false;
        boolean isSummary = false;
        if (coreTask instanceof NormalTask) {
            NormalTask nt = (NormalTask) coreTask;
            isMilestone = nt.isMarkTaskAsMilestone();
            isSummary = nt.isSummary();
            dto.setEstimated(nt.isEstimated());
            dto.setCritical(nt.isCritical());
            try {
                dto.setTotalSlack(nt.getTotalSlack() / (1000.0 * 60 * 60 * 8));
            } catch (Exception e) {}
        }
        dto.setMilestone(isMilestone);
        dto.setSummary(isSummary);
        dto.setType(isMilestone ? "MILESTONE" : (isSummary ? "SUMMARY" : "TASK"));
    }

    private void restorePredecessors(Project project, List<TaskDataDto> dtos, Map<Long, String> taskIdMap) {
        for (TaskDataDto dto : dtos) {
            Task coreTask = hierarchyMapper.findTaskById(project, dto.getId(), taskIdMap);
            if (coreTask == null) continue;
            List<String> predecessors = new ArrayList<>();
            try {
                Collection<?> deps = coreTask.getPredecessorList();
                if (deps != null) {
                    for (Object obj : deps) {
                        com.projectlibre1.pm.dependency.Dependency dep = (com.projectlibre1.pm.dependency.Dependency) obj;
                        Task pred = (Task) dep.getPredecessor();
                        if (pred != null) {
                            String predId = taskIdMap.get(pred.getUniqueId());
                            if (predId != null) predecessors.add(predId);
                        }
                    }
                }
            } catch (Exception e) {}
            dto.setPredecessors(predecessors);
        }
    }
}
