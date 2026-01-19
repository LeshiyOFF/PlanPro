package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

/**
 * DTO for RPC command requests from Electron bridge.
 * Replaces Map<String, Object> with strongly typed POJO.
 * Does not extend BaseDto as it represents input data without server-generated id.
 * Follows SOLID: Single Responsibility Principle.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class RpcCommandRequestDto {
    
    @NotBlank(message = "Command name is required")
    private String command;
    
    private List<Object> args;
    
    public RpcCommandRequestDto() {
    }
    
    public RpcCommandRequestDto(String command, List<Object> args) {
        this.command = command;
        this.args = args;
    }
    
    public String getCommand() {
        return command;
    }
    
    public void setCommand(String command) {
        this.command = command;
    }
    
    public List<Object> getArgs() {
        return args;
    }
    
    public void setArgs(List<Object> args) {
        this.args = args;
    }
}
