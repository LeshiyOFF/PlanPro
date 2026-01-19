package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO для длительности
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class DurationDto {
    private double value;
    private String unit;

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    /**
     * Конвертирует длительность в миллисекунды
     */
    public long toMilliseconds() {
        if (unit == null) return (long) value;
        
        double multiplier = 1;
        switch (unit.toLowerCase()) {
            case "seconds": multiplier = 1000; break;
            case "minutes": multiplier = 1000 * 60; break;
            case "hours": multiplier = 1000 * 60 * 60; break;
            case "days": multiplier = 1000 * 60 * 60 * 8; break; // 8 рабочий часов
            case "weeks": multiplier = 1000 * 60 * 60 * 40; break; // 40 рабочих часов
            case "months": multiplier = 1000 * 60 * 60 * 160; break; // 160 рабочих часов
            default: multiplier = 1; break;
        }
        return (long) (value * multiplier);
    }
}
