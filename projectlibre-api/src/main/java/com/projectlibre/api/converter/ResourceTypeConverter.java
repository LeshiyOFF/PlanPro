package com.projectlibre.api.converter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Конвертер типов ресурсов между Frontend и Core форматами.
 * 
 * ProjectLibre Core константы (ResourceType.java):
 * - MATERIAL = 0
 * - WORK = 1
 * - LOCATION/MACHINE/OTHER = 2/3/4
 * 
 * Frontend типы: "Work", "Material", "Cost"
 * 
 * SOLID: Single Responsibility - только конвертация типов ресурсов.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ResourceTypeConverter {
    
    private static final Logger log = LoggerFactory.getLogger(ResourceTypeConverter.class);
    
    /**
     * Конвертирует тип ресурса из Frontend формата в Core формат.
     * 
     * @param frontendType тип из Frontend ("Work", "Material", "Cost")
     * @return Core константа типа ресурса (0-4)
     */
    public int toCore(String frontendType) {
        if (frontendType == null || frontendType.isEmpty()) {
            return 1;
        }
        
        switch (frontendType) {
            case "Work":
                return 1;
            case "Material":
                return 0;
            case "Cost":
                return 2;
            default:
                log.warn("[TypeConverter] Unknown type '{}', defaulting to WORK", frontendType);
                return 1;
        }
    }
    
    /**
     * Конвертирует тип ресурса из Core формата в Frontend формат.
     * 
     * @param coreType Core константа типа (0-4)
     * @return Frontend тип ("Work", "Material", "Cost")
     */
    public String toFrontend(int coreType) {
        switch (coreType) {
            case 0:
                return "Material";
            case 1:
                return "Work";
            case 2:
            case 3:
            case 4:
                return "Cost";
            default:
                log.warn("[TypeConverter] Unknown core type {}, defaulting to Work", coreType);
                return "Work";
        }
    }
}
