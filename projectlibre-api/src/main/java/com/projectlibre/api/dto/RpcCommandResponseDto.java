package com.projectlibre.api.dto;

/**
 * DTO for RPC command responses.
 * Replaces Map<String, Object> with strongly typed POJO.
 * Follows SOLID: Single Responsibility Principle.
 */
public class RpcCommandResponseDto extends BaseDto {
    
    private boolean success;
    private Object data;
    private String error;
    
    public RpcCommandResponseDto() {
    }
    
    public RpcCommandResponseDto(boolean success, Object data) {
        this.success = success;
        this.data = data;
    }
    
    public RpcCommandResponseDto(boolean success, Object data, String error) {
        this.success = success;
        this.data = data;
        this.error = error;
    }
    
    public static RpcCommandResponseDto success(Object data) {
        return new RpcCommandResponseDto(true, data);
    }
    
    public static RpcCommandResponseDto error(String message) {
        return new RpcCommandResponseDto(false, null, message);
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public Object getData() {
        return data;
    }
    
    public void setData(Object data) {
        this.data = data;
    }
    
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
}
