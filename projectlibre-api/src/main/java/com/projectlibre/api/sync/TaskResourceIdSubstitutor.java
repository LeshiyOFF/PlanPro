package com.projectlibre.api.sync;

import com.projectlibre.api.dto.TaskSyncRequestDto.FrontendTaskDto;
import com.projectlibre.api.dto.ResourceAssignmentItemDto;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Подставляет Core ID ресурсов в задачи по маппингу временных ID → Core ID.
 * Используется после синка ресурсов, чтобы задачи получили числовые ID для назначений.
 * Поддерживает оба формата временного ID: RES-001 (фронт) и RES001 (на случай расхождения в маппинге).
 *
 * @author ProjectLibre Team
 * @version 1.1.0
 */
public final class TaskResourceIdSubstitutor {

    private TaskResourceIdSubstitutor() {}

    /**
     * Возвращает список задач с подставленными resourceIds по mapping.
     * Эффективные ID берутся из resourceIds или из resourceAssignments.
     */
    public static List<FrontendTaskDto> substitute(List<FrontendTaskDto> tasks,
                                                   Map<String, String> mapping) {
        if (tasks == null) return new ArrayList<>();
        Map<String, String> safeMapping = (mapping != null && !mapping.isEmpty()) ? mapping : java.util.Collections.emptyMap();

        List<FrontendTaskDto> result = new ArrayList<>(tasks.size());
        for (FrontendTaskDto task : tasks) {
            List<String> effectiveIds = getEffectiveResourceIds(task);
            List<String> substituted = new ArrayList<>(effectiveIds.size());
            for (String id : effectiveIds) {
                substituted.add(resolveMappedId(id, safeMapping));
            }
            List<ResourceAssignmentItemDto> substitutedAssignments = substituteResourceAssignments(task.getResourceAssignments(), safeMapping);
            FrontendTaskDto copy = new FrontendTaskDto(task);
            copy.setResourceIds(substituted);
            copy.setResourceAssignments(substitutedAssignments);
            result.add(copy);
        }
        return result;
    }

    /**
     * Ищет Core ID в маппинге по фронтовому id с учётом двух форматов: RES-001 и RES001.
     * Устраняет расхождение ключей между фронтом и бэкендом.
     */
    private static String resolveMappedId(String frontendId, Map<String, String> mapping) {
        if (frontendId == null || frontendId.isEmpty() || mapping.isEmpty()) return frontendId;
        String mapped = mapping.get(frontendId);
        if (mapped != null) return mapped;
        String alt = toAlternateResourceIdFormat(frontendId);
        if (alt != null) mapped = mapping.get(alt);
        return mapped != null ? mapped : frontendId;
    }

    /**
     * Возвращает альтернативный формат ID: RES-001 ↔ RES001.
     */
    private static String toAlternateResourceIdFormat(String id) {
        if (id == null || id.isEmpty()) return null;
        if (id.startsWith("RES-") && id.length() > 4) return "RES" + id.substring(4);
        if (id.startsWith("RES") && id.length() > 3 && id.charAt(3) != '-') return "RES-" + id.substring(3);
        return null;
    }

    /**
     * Подставляет Core ID в каждом элементе resourceAssignments по mapping.
     * ResSync использует уже подставленные ID и units из этого списка.
     */
    private static List<ResourceAssignmentItemDto> substituteResourceAssignments(
            List<ResourceAssignmentItemDto> assignments, Map<String, String> mapping) {
        if (assignments == null || assignments.isEmpty()) return new ArrayList<>();
        List<ResourceAssignmentItemDto> result = new ArrayList<>(assignments.size());
        for (ResourceAssignmentItemDto a : assignments) {
            if (a == null) continue;
            String origId = a.getResourceId();
            if (origId == null || origId.isEmpty()) continue;
            ResourceAssignmentItemDto copy = new ResourceAssignmentItemDto();
            copy.setResourceId(resolveMappedId(origId, mapping));
            copy.setUnits(a.getUnits() != null ? a.getUnits() : 1.0);
            result.add(copy);
        }
        return result;
    }

    private static List<String> getEffectiveResourceIds(FrontendTaskDto task) {
        if (task.getResourceIds() != null && !task.getResourceIds().isEmpty()) {
            return task.getResourceIds();
        }
        if (task.getResourceAssignments() != null) {
            return task.getResourceAssignments().stream()
                .map(ResourceAssignmentItemDto::getResourceId)
                .filter(id -> id != null && !id.isEmpty())
                .collect(Collectors.toList());
        }
        return new ArrayList<>();
    }
}
