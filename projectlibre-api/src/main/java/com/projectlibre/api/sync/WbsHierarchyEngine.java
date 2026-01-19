package com.projectlibre.api.sync;

import com.projectlibre1.grouping.core.Node;
import com.projectlibre1.grouping.core.model.NodeModel;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.pm.task.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;

/**
 * Низкоуровневый движок для операций с иерархией WBS.
 * Инкапсулирует работу с NodeModel, Hierarchy, indent/outdent операциями.
 * 
 * <p>Использует canonical ProjectLibre API:</p>
 * <ul>
 *   <li>{@code NodeModel.getHierarchy().indent()} - корректная интеграция в дерево</li>
 *   <li>{@code HierarchyOperationGuard} - защита от side-effects</li>
 *   <li>{@code NodeModel.SILENT} - производительность (без событий)</li>
 * </ul>
 * 
 * <p>Гарантирует:</p>
 * <ul>
 *   <li>Корректное обновление wbsChildrenNodes у родителя</li>
 *   <li>Интеграцию в Project.Hierarchy</li>
 *   <li>Сохранение дат и прогресса задач</li>
 * </ul>
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class WbsHierarchyEngine {
    private static final Logger log = LoggerFactory.getLogger(WbsHierarchyEngine.class);
    
    /**
     * Устанавливает иерархическую связь между задачами через canonical метод indent().
     * Защищает от изменения дат и других side-effects.
     * 
     * @param project проект (должен быть инициализирован)
     * @param child дочерняя задача
     * @param parent родительская задача (null = корневая задача)
     */
    public void establishHierarchy(Project project, Task child, Task parent) {
        if (child == null) {
            log.warn("Child task is null, skipping hierarchy establishment");
            return;
        }
        
        // Если родителя нет → задача должна быть корневой
        if (parent == null) {
            child.setWbsParent(null);
            log.debug("Set task '{}' as root (no parent)", child.getName());
            return;
        }
        
        // Проверка инициализации проекта
        if (project.getTaskOutlines() == null) {
            log.error("Project.taskOutlines is null, cannot establish hierarchy");
            useFallback(child, parent);
            return;
        }
        
        NodeModel taskModel = project.getTaskOutlines().getDefaultOutline();
        if (taskModel == null) {
            log.error("TaskModel not initialized, using fallback for task: {}", child.getName());
            useFallback(child, parent);
            return;
        }
        
        // Найти узлы в дереве
        Node childNode = taskModel.search(child);
        Node parentNode = taskModel.search(parent);
        
        if (childNode == null) {
            log.error("Child node not found in NodeModel for task: {}", child.getName());
            useFallback(child, parent);
            return;
        }
        
        if (parentNode == null) {
            log.error("Parent node not found in NodeModel for task: {}", parent.getName());
            useFallback(child, parent);
            return;
        }
        
        // Применить операцию с защитой от side-effects
        try (HierarchyOperationGuard childGuard = new HierarchyOperationGuard(child);
             HierarchyOperationGuard parentGuard = new HierarchyOperationGuard(parent)) {
            
            // Вычислить требуемое изменение уровня
            int currentLevel = taskModel.getHierarchy().getLevel(childNode);
            int targetLevel = taskModel.getHierarchy().getLevel(parentNode) + 1;
            int deltaLevel = targetLevel - currentLevel;
            
            log.debug("Hierarchy operation: task='{}', currentLevel={}, targetLevel={}, delta={}",
                child.getName(), currentLevel, targetLevel, deltaLevel);
            
            if (deltaLevel == 0) {
                // Уже на правильном уровне, просто установить родителя
                child.setWbsParent(parent);
                log.debug("Task '{}' already at correct level, parent set directly", child.getName());
            } else {
                // Применить indent через canonical ProjectLibre API
                taskModel.getHierarchy().indent(
                    Collections.singletonList(childNode),
                    deltaLevel,
                    taskModel,
                    NodeModel.SILENT // Без событий для производительности
                );
                
                log.debug("Indent applied successfully for task: {}", child.getName());
            }
            
            // Guard автоматически восстановит даты при выходе из try-with-resources
            
        } catch (Exception e) {
            log.error("Failed to establish hierarchy for task: " + child.getName(), e);
            useFallback(child, parent);
        }
    }
    
    /**
     * Fallback метод - простое присваивание без интеграции в Hierarchy.
     * Используется когда canonical метод недоступен.
     * 
     * @param child дочерняя задача
     * @param parent родительская задача
     */
    private void useFallback(Task child, Task parent) {
        log.warn("Using fallback method (simple setWbsParent) for task: {}", child.getName());
        child.setWbsParent(parent);
    }
    
    /**
     * Проверяет и инициализирует transient поля проекта.
     * Вызывает postDeserialization() если необходимо.
     * 
     * @param project проект для инициализации
     * @throws IllegalArgumentException если project == null
     * @throws IllegalStateException если проект не может быть инициализирован
     */
    public void ensureProjectInitialized(Project project) {
        if (project == null) {
            throw new IllegalArgumentException("Project cannot be null");
        }
        
        // Проверка инициализации TaskOutlines
        if (project.getTaskOutlines() == null) {
            log.warn("TaskOutlines is null, invoking postDeserialization()");
            
            try {
                project.postDeserialization();
                log.info("postDeserialization() completed successfully");
            } catch (Exception e) {
                log.error("postDeserialization() failed", e);
                throw new IllegalStateException(
                    "Failed to initialize project via postDeserialization()", e
                );
            }
        }
        
        // Финальная проверка
        if (project.getTaskOutlines() == null) {
            throw new IllegalStateException(
                "Project cannot be initialized: TaskOutlines is still null after postDeserialization()"
            );
        }
        
        log.debug("Project initialization verified successfully");
    }
}
