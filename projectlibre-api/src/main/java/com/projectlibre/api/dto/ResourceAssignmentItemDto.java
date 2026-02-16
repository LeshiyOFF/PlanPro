package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Элемент назначения ресурса на задачу (Frontend → API).
 * Используется для извлечения resourceIds при отсутствии поля resourceIds в задаче.
 *
 * @author ProjectLibre Team
 * @version 1.0.0
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResourceAssignmentItemDto {

    private String resourceId;
    private Double units;

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public Double getUnits() { return units; }
    public void setUnits(Double units) { this.units = units; }
}
