package com.projectlibre.api.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/**
 * DTO for standardized API response.
 * Ensures uniform format for all server responses.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class ApiResponseDto<T> {
    
    private boolean success;
    private String message;
    private T data;
    private List<String> errors;
    private LocalDateTime timestamp;
    private String requestId;
    
    /**
     * Default constructor for Jackson deserialization.
     */
    public ApiResponseDto() {
        this.timestamp = LocalDateTime.now();
    }
    
    public ApiResponseDto(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }
    
    public ApiResponseDto(boolean success, String message, List<String> errors) {
        this.success = success;
        this.message = message;
        this.errors = errors;
        this.timestamp = LocalDateTime.now();
    }
    
    public static <T> ApiResponseDto<T> success(String message, T data) {
        return new ApiResponseDto<>(true, message, data);
    }
    
    public static <T> ApiResponseDto<T> success(String message) {
        return new ApiResponseDto<>(true, message, null);
    }
    
    public static <T> ApiResponseDto<T> error(String message, List<String> errors) {
        return new ApiResponseDto<>(false, message, errors);
    }
    
    public static <T> ApiResponseDto<T> error(String message, String error) {
        return new ApiResponseDto<>(false, message, List.of(error));
    }
    
    public static <T> ApiResponseDto<T> error(String message) {
        return new ApiResponseDto<>(false, message, (List<String>)null);
    }
    
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
    
    public List<String> getErrors() { return errors; }
    public void setErrors(List<String> errors) { this.errors = errors; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ApiResponseDto<?> that = (ApiResponseDto<?>) o;
        return success == that.success &&
                Objects.equals(message, that.message) &&
                Objects.equals(data, that.data);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(success, message, data);
    }
}
