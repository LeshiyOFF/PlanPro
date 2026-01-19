package com.projectlibre.api.sync;

import com.projectlibre.api.dto.TaskSyncRequestDto.FrontendTaskDto;
import com.projectlibre1.pm.task.NormalTask;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.pm.task.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

/**
 * Синхронизатор WBS иерархии (Parent/Child) из Frontend в Core Project.
 * Устанавливает связи родитель-потомок на основе уровней вложенности задач.
 * 
 * <p>Алгоритм работы:</p>
 * <ol>
 *   <li>Инициализация проекта (postDeserialization если нужно)</li>
 *   <li>Построение карты parent-child отношений из frontend</li>
 *   <li>Валидация (циклы, уровни)</li>
 *   <li>Сортировка по уровню (родители первые)</li>
 *   <li>Применение изменений через WbsHierarchyEngine</li>
 *   <li>Финальная верификация</li>
 * </ol>
 * 
 * <p>Принцип SRP: отвечает только за координацию синхронизации WBS иерархии.</p>
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
public class WbsHierarchySynchronizer {
    private static final Logger log = LoggerFactory.getLogger(WbsHierarchySynchronizer.class);
    
    private final HierarchyValidator validator = new HierarchyValidator();
    private final WbsHierarchyEngine engine = new WbsHierarchyEngine();
    
    /**
     * Синхронизирует WBS иерархию для списка задач.
     * Использует canonical ProjectLibre API для корректной интеграции.
     * 
     * @param project Core Project (будет инициализирован если нужно)
     * @param frontendTasks Задачи из Frontend с уровнями
     * @param taskMap Карта соответствия Frontend ID -> Core Task
     */
    public void synchronize(Project project, List<FrontendTaskDto> frontendTasks, 
                           Map<String, NormalTask> taskMap) {
        if (project == null || frontendTasks == null || taskMap == null) {
            log.warn("Null parameters, skipping WBS synchronization");
            return;
        }
        
        if (frontendTasks.isEmpty()) {
            log.debug("No frontend tasks, skipping WBS synchronization");
            return;
        }
        
        log.info("=== Starting WBS Hierarchy Synchronization ===");
        log.info("Frontend tasks count: {}", frontendTasks.size());
        log.info("Backend tasks count: {}", taskMap.size());
        
        // Шаг 1: Инициализация проекта
        try {
            engine.ensureProjectInitialized(project);
        } catch (Exception e) {
            log.error("Failed to initialize project, aborting synchronization", e);
            return;
        }
        
        // Шаг 2: Построить карту parent-child отношений
        Map<String, String> parentChildMap = buildParentMap(frontendTasks);
        Map<String, FrontendTaskDto> frontendTaskMap = buildFrontendTaskMap(frontendTasks);
        
        log.debug("Parent-child relations found: {}", parentChildMap.size());
        
        // Шаг 3: Валидация ДО синхронизации
        try {
            validator.validateBeforeSync(parentChildMap, frontendTaskMap);
        } catch (Exception e) {
            log.error("Validation failed, aborting synchronization", e);
            return;
        }
        
        // Шаг 4: Сортировка по уровню (родители первые)
        List<Map.Entry<String, String>> sortedEntries = sortByLevel(
            parentChildMap, frontendTaskMap
        );
        
        log.debug("Sorted {} entries by level", sortedEntries.size());
        
        // Шаг 5: Применить изменения иерархии
        int successCount = applyHierarchyChanges(
            project, sortedEntries, taskMap, frontendTaskMap
        );
        
        log.info("=== WBS Hierarchy Synchronization Complete ===");
        log.info("Success: {}/{}", successCount, sortedEntries.size());
        
        // Шаг 6: Финальная верификация
        verifyHierarchyIntegrity(taskMap);
    }
    
    /**
     * Строит карту родителей на основе уровней задач.
     * Родитель - ближайшая предыдущая задача с уровнем на 1 меньше.
     * 
     * @param tasks список задач из frontend
     * @return карта child_id -> parent_id
     */
    private Map<String, String> buildParentMap(List<FrontendTaskDto> tasks) {
        Map<String, String> parentMap = new HashMap<>();
        Map<Integer, String> lastTaskAtLevel = new HashMap<>();
        
        for (FrontendTaskDto task : tasks) {
            int level = task.getLevel();
            
            // Если уровень > 0, ищем родителя на уровне (level - 1)
            if (level > 0) {
                String parentId = lastTaskAtLevel.get(level - 1);
                if (parentId != null) {
                    parentMap.put(task.getId(), parentId);
                }
            }
            
            // Обновляем последнюю задачу на этом уровне
            lastTaskAtLevel.put(level, task.getId());
            
            // Очищаем все уровни глубже текущего
            clearDeeperLevels(lastTaskAtLevel, level);
        }
        
        log.debug("Built parent map with {} relations", parentMap.size());
        return parentMap;
    }
    
    /**
     * Очищает записи для уровней глубже заданного.
     */
    private void clearDeeperLevels(Map<Integer, String> lastTaskAtLevel, int currentLevel) {
        for (int i = currentLevel + 1; i < 20; i++) {
            if (lastTaskAtLevel.containsKey(i)) {
                lastTaskAtLevel.remove(i);
            } else {
                break;
            }
        }
    }
    
    /**
     * Строит карту всех frontend задач для быстрого доступа.
     */
    private Map<String, FrontendTaskDto> buildFrontendTaskMap(List<FrontendTaskDto> tasks) {
        Map<String, FrontendTaskDto> map = new HashMap<>();
        for (FrontendTaskDto task : tasks) {
            map.put(task.getId(), task);
        }
        return map;
    }
    
    /**
     * Сортирует записи parent-child по уровню (родители первые).
     * Это критически важно для корректного построения иерархии.
     */
    private List<Map.Entry<String, String>> sortByLevel(
            Map<String, String> parentChildMap,
            Map<String, FrontendTaskDto> frontendTaskMap) {
        
        List<Map.Entry<String, String>> entries = new ArrayList<>(parentChildMap.entrySet());
        
        entries.sort((e1, e2) -> {
            FrontendTaskDto t1 = frontendTaskMap.get(e1.getKey());
            FrontendTaskDto t2 = frontendTaskMap.get(e2.getKey());
            
            int level1 = t1 != null ? t1.getLevel() : 0;
            int level2 = t2 != null ? t2.getLevel() : 0;
            
            return Integer.compare(level1, level2);
        });
        
        return entries;
    }
    
    /**
     * Применяет изменения иерархии через WbsHierarchyEngine.
     * 
     * @return количество успешно обработанных задач
     */
    private int applyHierarchyChanges(
            Project project,
            List<Map.Entry<String, String>> sortedEntries,
            Map<String, NormalTask> taskMap,
            Map<String, FrontendTaskDto> frontendTaskMap) {
        
        int successCount = 0;
        int failureCount = 0;
        
        for (Map.Entry<String, String> entry : sortedEntries) {
            String childId = entry.getKey();
            String parentId = entry.getValue();
            
            NormalTask child = taskMap.get(childId);
            NormalTask parent = taskMap.get(parentId);
            
            if (child == null) {
                log.warn("Child task not found for id={}", childId);
                failureCount++;
                continue;
            }
            
            if (parent == null) {
                log.warn("Parent task not found for id={} (child={})", parentId, child.getName());
                failureCount++;
                continue;
            }
            
            try {
                // Применить изменение через engine
                engine.establishHierarchy(project, child, parent);
                
                // Валидация ПОСЛЕ операции
                validator.validateAfterSync(child);
                validator.validateAfterSync(parent);
                
                successCount++;
                
                FrontendTaskDto childDto = frontendTaskMap.get(childId);
                FrontendTaskDto parentDto = frontendTaskMap.get(parentId);
                
                log.debug("Hierarchy set: '{}' (level={}) -> parent '{}' (level={})",
                    child.getName(),
                    childDto != null ? childDto.getLevel() : "?",
                    parent.getName(),
                    parentDto != null ? parentDto.getLevel() : "?");
                    
            } catch (Exception e) {
                log.error("Failed to establish hierarchy for task: " + child.getName(), e);
                failureCount++;
            }
        }
        
        if (failureCount > 0) {
            log.warn("Completed with {} failures out of {} operations",
                failureCount, sortedEntries.size());
        }
        
        return successCount;
    }
    
    /**
     * Финальная верификация целостности иерархии.
     * Проверяет, что все Summary задачи имеют детей.
     */
    private void verifyHierarchyIntegrity(Map<String, NormalTask> taskMap) {
        int summaryTasksCount = 0;
        int mismatchCount = 0;
        
        for (Map.Entry<String, NormalTask> entry : taskMap.entrySet()) {
            Task task = entry.getValue();
            
            if (task.isWbsParent()) {
                summaryTasksCount++;
                
                if (task.getWbsChildrenNodes() == null || 
                    task.getWbsChildrenNodes().isEmpty()) {
                    log.error("Summary task has no children: {}", task.getName());
                    mismatchCount++;
                }
            }
        }
        
        log.info("Verification complete: {} summary tasks found, {} mismatches",
            summaryTasksCount, mismatchCount);
    }
}
