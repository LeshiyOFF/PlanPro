package com.projectlibre.api.scheduling;

/**
 * Порт для настроек планирования
 * Определяет контракт для управления schedulingRule и effortDriven
 * Следует принципам Hexagonal Architecture (Ports & Adapters)
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public interface SchedulingOptionsPort {
    
    /**
     * Получить правило планирования
     * 0 - Fixed Units, 1 - Fixed Duration, 2 - Fixed Work
     * 
     * @return правило планирования
     */
    int getSchedulingRule();
    
    /**
     * Установить правило планирования
     * 
     * @param schedulingRule правило планирования
     */
    void setSchedulingRule(int schedulingRule);
    
    /**
     * Получить флаг Effort Driven
     * 
     * @return true если планирование от объема работ
     */
    boolean isEffortDriven();
    
    /**
     * Установить флаг Effort Driven
     * 
     * @param effortDriven флаг планирования от объема работ
     */
    void setEffortDriven(boolean effortDriven);
    
    /**
     * Получить единицу ввода длительности
     * 
     * @return единица времени для длительности
     */
    int getDurationEnteredIn();
    
    /**
     * Установить единицу ввода длительности
     * 
     * @param durationEnteredIn единица времени
     */
    void setDurationEnteredIn(int durationEnteredIn);
    
    /**
     * Получить единицу работы
     * 
     * @return единица времени для работы
     */
    int getWorkUnit();
    
    /**
     * Установить единицу работы
     * 
     * @param workUnit единица времени
     */
    void setWorkUnit(int workUnit);
    
    /**
     * Получить флаг старта новых задач сегодня
     * 
     * @return true если новые задачи начинаются сегодня
     */
    boolean isNewTasksStartToday();
    
    /**
     * Установить флаг старта новых задач сегодня
     * 
     * @param newTasksStartToday флаг
     */
    void setNewTasksStartToday(boolean newTasksStartToday);
    
    /**
     * Получить флаг соблюдения обязательных дат
     * 
     * @return true если обязательные даты соблюдаются
     */
    boolean isHonorRequiredDates();
    
    /**
     * Установить флаг соблюдения обязательных дат
     * 
     * @param honorRequiredDates флаг
     */
    void setHonorRequiredDates(boolean honorRequiredDates);
    
    /**
     * Применить все настройки из DTO
     * 
     * @param schedulingRule правило планирования
     * @param effortDriven флаг effort driven
     * @param durationEnteredIn единица длительности
     * @param workUnit единица работы
     * @param newTasksStartToday флаг старта сегодня
     * @param honorRequiredDates флаг соблюдения дат
     */
    void applyAllSettings(int schedulingRule, boolean effortDriven, 
                         int durationEnteredIn, int workUnit,
                         boolean newTasksStartToday, boolean honorRequiredDates);
}
