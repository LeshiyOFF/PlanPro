package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Базовый DTO класс для всех объектов API
 * Обеспечивает единый формат для всех DTO и следование принципу DRY
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class BaseDto {
    
    private Long id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    /**
     * Конструктор по умолчанию
     */
    public BaseDto() {
        super();
    }
    
    /**
     * Конструктор с основными полями
     */
    public BaseDto(Long id, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    /**
     * Геттер для ID
     */
    public Long getId() {
        return id;
    }
    
    /**
     * Сеттер для ID
     */
    public void setId(Long id) {
        this.id = id;
    }
    
    /**
     * Геттер для даты создания
     */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    /**
     * Сеттер для даты создания
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    /**
     * Геттер для даты обновления
     */
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    /**
     * Сеттер для даты обновления
     */
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BaseDto baseDto = (BaseDto) o;
        return Objects.equals(id, baseDto.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    
    @Override
    public String toString() {
        return "BaseDto{" +
                "id=" + id +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}