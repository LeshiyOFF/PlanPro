package com.projectlibre.api.observability;

import java.time.LocalDateTime;

/**
 * Log entry data structure for ObservabilityLogger
 */
public class LogEntry {
    final LocalDateTime timestamp;
    final LogLevel level;
    final String category;
    final String message;
    final Throwable throwable;
    final String threadName;
    
    public LogEntry(LocalDateTime timestamp, LogLevel level, String category, String message, 
             Throwable throwable, String threadName) {
        this.timestamp = timestamp;
        this.level = level;
        this.category = category;
        this.message = message;
        this.throwable = throwable;
        this.threadName = threadName;
    }
}
