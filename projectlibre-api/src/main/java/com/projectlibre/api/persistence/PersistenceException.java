package com.projectlibre.api.persistence;

/**
 * Исключение для операций персистентности
 * Используется для обработки ошибок сохранения/загрузки
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class PersistenceException extends RuntimeException {
    
    public PersistenceException(String message) {
        super(message);
    }
    
    public PersistenceException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public PersistenceException(Throwable cause) {
        super(cause);
    }
}
