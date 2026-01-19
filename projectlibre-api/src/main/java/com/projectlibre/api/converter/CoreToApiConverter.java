package com.projectlibre.api.converter;

import com.projectlibre.api.dto.ProjectDataDto;
import com.projectlibre.api.dto.ProjectDataDto.TaskDataDto;
import com.projectlibre.api.dto.ProjectDataDto.ResourceDataDto;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.pm.task.Task;
import com.projectlibre1.pm.task.NormalTask;
import com.projectlibre1.pm.resource.Resource;
import com.projectlibre1.pm.resource.ResourcePool;
import com.projectlibre1.pm.dependency.Dependency;
import com.projectlibre1.pm.assignment.Assignment;
import com.projectlibre1.grouping.core.Node;

import java.util.*;

/**
 * Конвертер данных из Core модели ProjectLibre в API DTO для frontend.
 * Обеспечивает безопасную конвертацию с обработкой всех edge cases.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class CoreToApiConverter {
    
    // Палитра цветов для задач разных уровней
    private static final String[] LEVEL_COLORS = {
        "#4A90D9", // level 0 - синий
        "#50C878", // level 1 - зелёный
        "#FF6B6B", // level 2 - красный
        "#FFB347", // level 3 - оранжевый
        "#9B59B6", // level 4 - фиолетовый
        "#3498DB", // level 5 - голубой
        "#E74C3C", // level 6 - тёмно-красный
        "#2ECC71"  // level 7 - изумрудный
    };
    
    /**
     * Конвертирует полный Core Project в DTO для frontend
     */
    public ProjectDataDto convert(Project coreProject) {
        if (coreProject == null) {
            System.out.println("[CoreToApiConverter] ⚠️ Null project received");
            return ProjectDataDto.success(null, "Unknown", new ArrayList<>(), new ArrayList<>(), null);
        }
        
        System.out.println("[CoreToApiConverter] Converting project: " + coreProject.getName());
        
        List<TaskDataDto> tasks = convertTasks(coreProject);
        List<ResourceDataDto> resources = convertResources(coreProject);
        
        ProjectDataDto result = ProjectDataDto.success(
            coreProject.getUniqueId(),
            coreProject.getName(),
            tasks,
            resources,
            coreProject.getFileName()
        );
        
        System.out.println("[CoreToApiConverter] ✅ Converted: " + tasks.size() + " tasks, " + resources.size() + " resources");
        
        return result;
    }
    
    /**
     * Конвертирует все задачи проекта
     */
    private List<TaskDataDto> convertTasks(Project project) {
        List<TaskDataDto> result = new ArrayList<>();
        Map<Long, String> taskIdMap = new HashMap<>(); // Core ID -> String ID для frontend
        
        try {
            // Итерируем по всем задачам через TaskOutlineIterator
            Iterator<Task> iterator = project.getTaskOutlineIterator();
            int index = 1;
            
            while (iterator.hasNext()) {
                Task coreTask = iterator.next();
                
                // Пропускаем внешние задачи
                if (coreTask.isExternal()) continue;
                
                TaskDataDto dto = convertTask(coreTask, index, taskIdMap);
                if (dto != null) {
                    result.add(dto);
                    taskIdMap.put(coreTask.getUniqueId(), dto.getId());
                    index++;
                }
            }
            
            // Второй проход: установка predecessors с правильными ID
            iterator = project.getTaskOutlineIterator();
            int i = 0;
            while (iterator.hasNext()) {
                Task coreTask = iterator.next();
                if (coreTask.isExternal()) continue;
                if (i < result.size()) {
                    setPredecessors(result.get(i), coreTask, taskIdMap);
                    i++;
                }
            }
            
        } catch (Exception e) {
            System.err.println("[CoreToApiConverter] ❌ Error converting tasks: " + e.getMessage());
            e.printStackTrace();
        }
        
        return result;
    }
    
    /**
     * Конвертирует одну задачу
     */
    private TaskDataDto convertTask(Task coreTask, int index, Map<Long, String> taskIdMap) {
        try {
            TaskDataDto dto = new TaskDataDto();
            
            // ID - используем index для простоты (frontend ожидает string)
            String taskId = String.valueOf(index);
            dto.setId(taskId);
            
            // Имя задачи
            String name = coreTask.getName();
            dto.setName(name != null && !name.isEmpty() ? name : "Task " + index);
            
            // Даты (в миллисекундах)
            dto.setStartDate(coreTask.getStart());
            dto.setEndDate(coreTask.getEnd());
            
            // Duration (Stage 7.19) - вычисляем из Core API или разницы дат
            double durationDays = 0.0;
            try {
                if (coreTask instanceof NormalTask) {
                    NormalTask normalTask = (NormalTask) coreTask;
                    // Получаем duration из Core (в миллисекундах)
                    long durationMillis = normalTask.getDuration();
                    // Конвертируем в дни (учитывая 8-часовой рабочий день)
                    durationDays = durationMillis / (1000.0 * 60 * 60 * 8);
                } else {
                    // Fallback: простое вычитание дат для summary/milestone
                    long durationMillis = dto.getEndDate() - dto.getStartDate();
                    durationDays = durationMillis / (1000.0 * 60 * 60 * 24);
                }
                dto.setDuration(Math.max(0, durationDays)); // Не может быть отрицательным
            } catch (Exception e) {
                // В случае ошибки устанавливаем 0
                dto.setDuration(0.0);
            }
            
            // Прогресс (0-100)
            double progress = 0;
            if (coreTask instanceof NormalTask) {
                progress = ((NormalTask) coreTask).getPercentComplete() * 100;
            }
            dto.setProgress(Math.min(100, Math.max(0, progress)));
            
            // Уровень вложенности (WBS)
            int level = calculateLevel(coreTask);
            dto.setLevel(level);
            
            // Цвет на основе уровня
            dto.setColor(LEVEL_COLORS[level % LEVEL_COLORS.length]);
            
            // Тип задачи
            boolean isMilestone = false;
            boolean isSummary = false;
            boolean isEstimated = false;
            boolean isCritical = false;
            
            if (coreTask instanceof NormalTask) {
                NormalTask normalTask = (NormalTask) coreTask;
                isMilestone = normalTask.isMilestone();
                isSummary = normalTask.isSummary();
                isEstimated = normalTask.isEstimated();
                isCritical = normalTask.isCritical();
            }
            
            dto.setMilestone(isMilestone);
            dto.setSummary(isSummary);
            dto.setEstimated(isEstimated);
            dto.setCritical(isCritical);
            dto.setType(isMilestone ? "MILESTONE" : (isSummary ? "SUMMARY" : "TASK"));
            
            // WBS код
            String wbs = coreTask.getWbs();
            dto.setWbs(wbs != null ? wbs : String.valueOf(index));
            
            // Notes
            String notes = coreTask.getNotes();
            dto.setNotes(notes != null ? notes : "");
            
            // Children (для summary задач)
            if (isSummary) {
                List<String> children = getChildrenIds(coreTask, taskIdMap);
                dto.setChildren(children);
            }
            
            // Resource IDs (из assignments)
            List<String> resourceIds = getResourceIds(coreTask);
            dto.setResourceIds(resourceIds);
            
            return dto;
            
        } catch (Exception e) {
            System.err.println("[CoreToApiConverter] ⚠️ Error converting task: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Вычисляет уровень вложенности задачи
     */
    private int calculateLevel(Task task) {
        int level = 0;
        Task parent = task.getWbsParentTask();
        while (parent != null) {
            level++;
            parent = parent.getWbsParentTask();
        }
        return level;
    }
    
    /**
     * Получает список ID детей для summary задачи
     */
    @SuppressWarnings("unchecked")
    private List<String> getChildrenIds(Task task, Map<Long, String> taskIdMap) {
        List<String> children = new ArrayList<>();
        try {
            Collection<Node> childNodes = task.getWbsChildrenNodes();
            if (childNodes != null) {
                for (Node node : childNodes) {
                    Object impl = node.getImpl();
                    if (impl instanceof Task) {
                        Task childTask = (Task) impl;
                        String childId = taskIdMap.get(childTask.getUniqueId());
                        if (childId != null) {
                            children.add(childId);
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Ignore - empty list is fine
        }
        return children;
    }
    
    /**
     * Устанавливает predecessors для задачи
     */
    @SuppressWarnings("unchecked")
    private void setPredecessors(TaskDataDto dto, Task coreTask, Map<Long, String> taskIdMap) {
        List<String> predecessors = new ArrayList<>();
        try {
            Collection<Dependency> deps = coreTask.getPredecessorList();
            if (deps != null) {
                for (Dependency dep : deps) {
                    Task predecessor = (Task) dep.getPredecessor();
                    if (predecessor != null) {
                        String predId = taskIdMap.get(predecessor.getUniqueId());
                        if (predId != null) {
                            predecessors.add(predId);
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Ignore - empty list is fine
        }
        dto.setPredecessors(predecessors);
    }
    
    /**
     * Получает список ID ресурсов, назначенных на задачу
     */
    @SuppressWarnings("unchecked")
    private List<String> getResourceIds(Task task) {
        List<String> resourceIds = new ArrayList<>();
        try {
            if (task instanceof NormalTask) {
                NormalTask normalTask = (NormalTask) task;
                Collection<Assignment> assignments = normalTask.getAssignments();
                if (assignments != null) {
                    for (Assignment assignment : assignments) {
                        Resource resource = assignment.getResource();
                        // Пропускаем null и ресурсы с пустым именем (как правило это Unassigned)
                        if (resource != null && resource.getName() != null && !resource.getName().isEmpty()) {
                            resourceIds.add(String.valueOf(resource.getUniqueId()));
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Ignore - empty list is fine
        }
        return resourceIds;
    }
    
    /**
     * Конвертирует все ресурсы проекта
     */
    private List<ResourceDataDto> convertResources(Project project) {
        List<ResourceDataDto> result = new ArrayList<>();
        
        try {
            ResourcePool pool = project.getResourcePool();
            if (pool == null) {
                System.out.println("[CoreToApiConverter] ⚠️ No resource pool");
                return result;
            }
            
            @SuppressWarnings("unchecked")
            Collection<Resource> resources = pool.getResourceList();
            if (resources == null) {
                return result;
            }
            
            for (Resource coreResource : resources) {
                // Пропускаем ресурсы с пустым именем (Unassigned)
                String resourceName = coreResource.getName();
                if (resourceName == null || resourceName.trim().isEmpty()) continue;
                
                ResourceDataDto dto = convertResource(coreResource);
                if (dto != null) {
                    result.add(dto);
                }
            }
            
        } catch (Exception e) {
            System.err.println("[CoreToApiConverter] ❌ Error converting resources: " + e.getMessage());
            e.printStackTrace();
        }
        
        return result;
    }
    
    /**
     * Конвертирует один ресурс
     */
    private ResourceDataDto convertResource(Resource coreResource) {
        try {
            ResourceDataDto dto = new ResourceDataDto();
            
            dto.setId(String.valueOf(coreResource.getUniqueId()));
            
            String name = coreResource.getName();
            dto.setName(name != null && !name.isEmpty() ? name : "Resource");
            
            // Тип ресурса
            String type = "Work"; // Default
            try {
                // ProjectLibre использует числовой тип
                int resourceType = coreResource.getResourceType();
                if (resourceType == 1) type = "Material";
                else if (resourceType == 2) type = "Cost";
            } catch (Exception e) {
                // Use default
            }
            dto.setType(type);
            
            // Max units (обычно 1.0 = 100%)
            try {
                dto.setMaxUnits(coreResource.getMaximumUnits());
            } catch (Exception e) {
                dto.setMaxUnits(1.0);
            }
            
            // Rates
            try {
                // StandardRate возвращает Rate объект, нужно извлечь значение
                Object standardRate = coreResource.getStandardRate();
                if (standardRate != null) {
                    dto.setStandardRate(extractRateValue(standardRate));
                }
                
                Object overtimeRate = coreResource.getOvertimeRate();
                if (overtimeRate != null) {
                    dto.setOvertimeRate(extractRateValue(overtimeRate));
                }
            } catch (Exception e) {
                dto.setStandardRate(0);
                dto.setOvertimeRate(0);
            }
            
            // Group
            try {
                String group = coreResource.getGroup();
                dto.setGroup(group != null ? group : "");
            } catch (Exception e) {
                dto.setGroup("");
            }
            
            // Email
            try {
                String email = coreResource.getEmailAddress();
                dto.setEmail(email != null ? email : "");
            } catch (Exception e) {
                dto.setEmail("");
            }
            
            dto.setAvailable(true);
            
            return dto;
            
        } catch (Exception e) {
            System.err.println("[CoreToApiConverter] ⚠️ Error converting resource: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Извлекает числовое значение из Rate объекта
     */
    private double extractRateValue(Object rate) {
        if (rate == null) return 0;
        try {
            // Rate может быть объектом с методом getValue()
            java.lang.reflect.Method getValue = rate.getClass().getMethod("getValue");
            Object value = getValue.invoke(rate);
            if (value instanceof Number) {
                return ((Number) value).doubleValue();
            }
        } catch (Exception e) {
            // Try toString parsing
            try {
                String str = rate.toString();
                // Remove currency symbols and parse
                str = str.replaceAll("[^0-9.]", "");
                if (!str.isEmpty()) {
                    return Double.parseDouble(str);
                }
            } catch (Exception ex) {
                // Ignore
            }
        }
        return 0;
    }
}
