package com.projectlibre.api.exception;

import com.projectlibre.api.dto.ApiResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Глобальный обработчик исключений для REST API
 * Обеспечивает единообразные ответы об ошибках
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    /**
     * Обработка ошибок валидации (@Valid)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponseDto<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        String errorMessage = "Validation failed: " + errors.entrySet().stream()
            .map(e -> e.getKey() + "=" + e.getValue())
            .collect(Collectors.joining(", "));
        
        System.err.println("[GlobalExceptionHandler] Validation error: " + errorMessage);
        System.err.println("[GlobalExceptionHandler] Errors: " + errors);
        
        return ResponseEntity.badRequest()
            .body(ApiResponseDto.error(errorMessage));
    }
    
    /**
     * Обработка ошибок десериализации JSON
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponseDto<Object>> handleMessageNotReadable(
            HttpMessageNotReadableException ex) {
        
        String message = "Invalid JSON format or type mismatch: " + ex.getMessage();
        System.err.println("[GlobalExceptionHandler] JSON deserialization error: " + message);
        ex.printStackTrace();
        
        return ResponseEntity.badRequest()
            .body(ApiResponseDto.error("Invalid request format: " + ex.getMostSpecificCause().getMessage()));
    }
    
    /**
     * Обработка всех остальных исключений
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseDto<Object>> handleGenericException(Exception ex) {
        System.err.println("[GlobalExceptionHandler] Unexpected error: " + ex.getMessage());
        ex.printStackTrace();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponseDto.error("Internal server error: " + ex.getMessage()));
    }
}
