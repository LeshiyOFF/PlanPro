package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO для маппинга ID ресурсов между Frontend и Java Core.
 * 
 * При синхронизации Frontend отправляет временные ID (например "RES-001"),
 * а Java Core генерирует постоянные numeric ID.
 * Этот DTO возвращает маппинг для обновления всех ссылок на ресурсы.
 * 
 * Clean Architecture: Data Transfer Object (Interface Adapters Layer).
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ResourceIdMappingDto {
    
    /** Временный ID из Frontend (например "RES-001"). */
    @JsonProperty("frontendId")
    private final String frontendId;
    
    /** Постоянный ID из Java Core (например "1739476808000"). */
    @JsonProperty("coreId")
    private final String coreId;
    
    /**
     * Создаёт маппинг ID ресурса.
     * 
     * @param frontendId временный ID из Frontend
     * @param coreId постоянный ID из Java Core
     */
    public ResourceIdMappingDto(String frontendId, String coreId) {
        this.frontendId = frontendId;
        this.coreId = coreId;
    }
    
    /**
     * Конструктор для Jackson десериализации.
     */
    @SuppressWarnings("unused")
    private ResourceIdMappingDto() {
        this.frontendId = null;
        this.coreId = null;
    }
    
    public String getFrontendId() {
        return frontendId;
    }
    
    public String getCoreId() {
        return coreId;
    }
    
    @Override
    public String toString() {
        return "ResourceIdMapping{" + frontendId + " -> " + coreId + "}";
    }
}
