package com.projectlibre.api.converter;

import com.projectlibre1.pm.task.Task;
import com.projectlibre1.pm.task.NormalTask;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.pm.assignment.Assignment;
import com.projectlibre1.pm.resource.Resource;
import com.projectlibre1.grouping.core.Node;
import java.util.*;
import java.util.HashMap;

/**
 * Утилита для маппинга иерархии и связей задач.
 * 
 * SOLID: Single Responsibility - только работа со структурой задач.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class TaskHierarchyMapper {
    
    public int calculateLevel(Task task) {
        int level = 0;
        Task current = task.getWbsParentTask();
        while (current != null) {
            level++;
            current = current.getWbsParentTask();
        }
        return level;
    }
    
    @SuppressWarnings("unchecked")
    public List<String> getChildren(Task task, Map<Long, String> taskIdMap) {
        List<String> children = new ArrayList<>();
        try {
            Collection<Node> childNodes = task.getWbsChildrenNodes();
            if (childNodes != null) {
                for (Node node : childNodes) {
                    Object impl = node.getImpl();
                    if (impl instanceof Task) {
                        String childId = taskIdMap.get(((Task) impl).getUniqueId());
                        if (childId != null) children.add(childId);
                    }
                }
            }
        } catch (Exception e) {}
        return children;
    }
    
    @SuppressWarnings("unchecked")
    public List<String> getResourceIds(Task task) {
        List<String> resourceIds = new ArrayList<>();
        if (!(task instanceof NormalTask)) return resourceIds;
        try {
            Collection<Assignment> assignments = ((NormalTask) task).getAssignments();
            if (assignments != null) {
                for (Assignment assignment : assignments) {
                    Resource resource = assignment.getResource();
                    if (resource != null && resource.getName() != null && !resource.getName().isEmpty()) {
                        resourceIds.add(String.valueOf(resource.getUniqueId()));
                    }
                }
            }
        } catch (Exception e) {}
        return resourceIds;
    }
    
    /**
     * Возвращает полные данные о назначениях задачи, включая units.
     * UNITS-FIX: Критично для корректной работы EffortDriven и гистограммы ресурсов.
     * 
     * @param task Задача
     * @return Список Map с resourceId и units для каждого назначения
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getResourceAssignments(Task task) {
        List<Map<String, Object>> result = new ArrayList<>();
        if (!(task instanceof NormalTask)) return result;
        try {
            Collection<Assignment> assignments = ((NormalTask) task).getAssignments();
            if (assignments != null) {
                for (Assignment assignment : assignments) {
                    Resource resource = assignment.getResource();
                    // Пропускаем default/unassigned ресурсы
                    if (resource != null && resource.getName() != null && !resource.getName().isEmpty()) {
                        Map<String, Object> assignmentData = new HashMap<>();
                        assignmentData.put("resourceId", String.valueOf(resource.getUniqueId()));
                        // Получаем реальные units из assignment (не из resource!)
                        double units = assignment.getUnits(); // 1.0 = 100%, 2.0 = 200%, etc.
                        assignmentData.put("units", units);
                        result.add(assignmentData);
                    }
                }
            }
            if (result.size() > 0) {
                System.out.println("[TaskHierarchyMapper.getResourceAssignments] taskId=" + task.getUniqueId() + " count=" + result.size());
            }
        } catch (Exception e) {
            System.err.println("[TaskHierarchyMapper] Error getting resource assignments: " + e.getMessage());
        }
        return result;
    }
    
    public Task findTaskById(Project project, String taskId, Map<Long, String> taskIdMap) {
        try {
            Iterator<Task> iterator = project.getTaskOutlineIterator();
            while (iterator.hasNext()) {
                Task task = iterator.next();
                if (taskId.equals(taskIdMap.get(task.getUniqueId()))) return task;
            }
        } catch (Exception e) {}
        return null;
    }
}
