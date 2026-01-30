package com.projectlibre.api.converter;

import com.projectlibre1.pm.task.Task;
import com.projectlibre1.pm.task.NormalTask;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.pm.assignment.Assignment;
import com.projectlibre1.pm.resource.Resource;
import com.projectlibre1.grouping.core.Node;
import java.util.*;

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
