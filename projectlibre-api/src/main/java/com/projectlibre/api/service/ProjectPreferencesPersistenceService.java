package com.projectlibre.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectlibre.api.dto.PreferencesDto;

/**
 * Сервис для сериализации и десериализации настроек проекта
 * Используется для сохранения настроек внутри метаданных .projectlibre файла
 */
public class ProjectPreferencesPersistenceService {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static ProjectPreferencesPersistenceService instance;

    private ProjectPreferencesPersistenceService() {}

    public static ProjectPreferencesPersistenceService getInstance() {
        if (instance == null) {
            instance = new ProjectPreferencesPersistenceService();
        }
        return instance;
    }

    /**
     * Сериализация настроек в JSON строку
     */
    public String serialize(PreferencesDto preferences) {
        if (preferences == null) return null;
        try {
            return objectMapper.writeValueAsString(preferences);
        } catch (Exception e) {
            System.err.println("Failed to serialize project preferences: " + e.getMessage());
            return null;
        }
    }

    /**
     * Десериализация настроек из JSON строки
     */
    public PreferencesDto deserialize(String json) {
        if (json == null || json.isEmpty()) return null;
        try {
            return objectMapper.readValue(json, PreferencesDto.class);
        } catch (Exception e) {
            System.err.println("Failed to deserialize project preferences: " + e.getMessage());
            return null;
        }
    }
}
