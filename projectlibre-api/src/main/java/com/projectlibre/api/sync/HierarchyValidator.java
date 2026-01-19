package com.projectlibre.api.sync;

import com.projectlibre.api.dto.TaskSyncRequestDto.FrontendTaskDto;
import com.projectlibre1.pm.task.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

/**
 * Валидирует корректность иерархии WBS.
 * Проверяет отсутствие циклов, корректность уровней, целостность данных.
 * 
 * <p>Выполняет проверки:</p>
 * <ul>
 *   <li>Отсутствие циклических зависимостей (task не может быть предком самого себя)</li>
 *   <li>Корректность уровней (child.level > parent.level)</li>
 *   <li>Целостность ссылок (parent существует для child)</li>
 *   <li>Консистентность состояния (isSummary = hasChildren)</li>
 * </ul>
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class HierarchyValidator {
    private static final Logger log = LoggerFactory.getLogger(HierarchyValidator.class);
    
    /**
     * Валидирует данные ПЕРЕД синхронизацией.
     * 
     * @param parentChildMap карта отношений child_id -> parent_id
     * @param frontendTaskMap карта всех задач frontend
     * @throws IllegalStateException если обнаружены критические ошибки
     */
    public void validateBeforeSync(
            Map<String, String> parentChildMap,
            Map<String, FrontendTaskDto> frontendTaskMap) {
        
        log.debug("Validating hierarchy before sync (relations: {})", parentChildMap.size());
        
        int cyclesFound = 0;
        int levelMismatches = 0;
        
        // Проверка на циклические зависимости
        for (Map.Entry<String, String> entry : parentChildMap.entrySet()) {
            String childId = entry.getKey();
            String parentId = entry.getValue();
            
            if (hasCycle(childId, parentId, parentChildMap)) {
                log.error("Circular dependency detected: child={}, parent={}", childId, parentId);
                cyclesFound++;
            }
        }
        
        if (cyclesFound > 0) {
            throw new IllegalStateException(
                String.format("Found %d circular dependencies in hierarchy", cyclesFound)
            );
        }
        
        // Проверка корректности уровней
        for (Map.Entry<String, String> entry : parentChildMap.entrySet()) {
            FrontendTaskDto child = frontendTaskMap.get(entry.getKey());
            FrontendTaskDto parent = frontendTaskMap.get(entry.getValue());
            
            if (child != null && parent != null) {
                if (child.getLevel() <= parent.getLevel()) {
                    log.warn("Invalid level relationship: child='{}' (level={}) <= parent='{}' (level={})",
                        child.getName(), child.getLevel(),
                        parent.getName(), parent.getLevel());
                    levelMismatches++;
                }
            }
        }
        
        if (levelMismatches > 0) {
            log.warn("Found {} level mismatches (non-critical, will be corrected)", levelMismatches);
        }
        
        log.debug("Validation completed: {} cycles, {} level mismatches", 
            cyclesFound, levelMismatches);
    }
    
    /**
     * Проверяет наличие циклов в графе зависимостей.
     * 
     * @param taskId ID текущей задачи
     * @param parentId ID родительской задачи
     * @param parentChildMap полная карта отношений
     * @return true если обнаружен цикл
     */
    private boolean hasCycle(String taskId, String parentId, Map<String, String> parentChildMap) {
        if (parentId == null) {
            return false;
        }
        
        Set<String> visited = new HashSet<>();
        String current = parentId;
        
        while (current != null) {
            // Если текущий узел = исходная задача → цикл
            if (current.equals(taskId)) {
                return true;
            }
            
            // Если уже посещали этот узел → цикл в другой части графа
            if (visited.contains(current)) {
                return true;
            }
            
            visited.add(current);
            current = parentChildMap.get(current);
            
            // Защита от бесконечного цикла
            if (visited.size() > 1000) {
                log.error("Cycle detection exceeded 1000 iterations");
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Валидирует состояние задачи ПОСЛЕ синхронизации.
     * Проверяет консистентность isWbsParent() и wbsChildrenNodes.
     * 
     * @param task задача для валидации
     */
    public void validateAfterSync(Task task) {
        if (task == null) {
            return;
        }
        
        boolean hasChildren = task.getWbsChildrenNodes() != null && 
                             !task.getWbsChildrenNodes().isEmpty();
        boolean isParent = task.isWbsParent();
        
        // Консистентность: если есть дети, должен быть parent
        if (hasChildren && !isParent) {
            log.error("Inconsistency detected: task '{}' has {} children but isWbsParent()=false",
                task.getName(), task.getWbsChildrenNodes().size());
        }
        
        // Консистентность: если parent, должны быть дети
        if (isParent && !hasChildren) {
            log.warn("Task '{}' marked as parent but has no children", task.getName());
        }
    }
    
    /**
     * Проверяет доступность родительской задачи.
     * 
     * @param parentId ID родителя
     * @param availableTasks доступные задачи
     * @return true если родитель существует
     */
    public boolean isParentAvailable(String parentId, Map<String, ?> availableTasks) {
        return parentId != null && availableTasks.containsKey(parentId);
    }
}
