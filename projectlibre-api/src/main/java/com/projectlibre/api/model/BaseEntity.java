package com.projectlibre.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Базовая модель для всех сущностей
 * Содержит общие поля и методы
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public abstract class BaseEntity {
    
    protected Long id;
    protected String name;
    protected String description;
    protected LocalDateTime createdAt;
    protected LocalDateTime updatedAt;
    protected String createdBy;
    protected String modifiedBy;

    /**
     * Конструктор по умолчанию
     */
    protected BaseEntity() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Получить ID
     */
    public Long getId() {
        return id;
    }

    /**
     * Установить ID
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Получить название
     */
    public String getName() {
        return name;
    }

    /**
     * Установить название
     */
    public void setName(String name) {
        this.name = name;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Получить описание
     */
    public String getDescription() {
        return description;
    }

    /**
     * Установить описание
     */
    public void setDescription(String description) {
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Получить дату создания
     */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * Установить дату создания
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Получить дату обновления
     */
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    /**
     * Установить дату обновления
     */
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * Получить автора создания
     */
    public String getCreatedBy() {
        return createdBy;
    }

    /**
     * Установить автора создания
     */
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    /**
     * Получить автора последнего изменения
     */
    public String getModifiedBy() {
        return modifiedBy;
    }

    /**
     * Установить автора последнего изменения
     */
    public void setModifiedBy(String modifiedBy) {
        this.modifiedBy = modifiedBy;
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BaseEntity that = (BaseEntity) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "{" +
               "id=" + id +
               ", name='" + name + '\'' +
               ", description='" + description + '\'' +
               ", createdAt=" + createdAt +
               ", updatedAt=" + updatedAt +
               '}';
    }
}