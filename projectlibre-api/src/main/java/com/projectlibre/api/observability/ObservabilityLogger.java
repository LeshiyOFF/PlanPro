package com.projectlibre.api.observability;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Advanced logging service with structured output and performance optimization
 * Provides production-ready logging with correlation IDs
 */
@Service
public class ObservabilityLogger {
    
    private static final DateTimeFormatter TIMESTAMP_FORMAT = 
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
    private static final String LOG_FORMAT = "[%s] [%s] [%s] %s";
    
    private final ConcurrentLinkedQueue<LogEntry> logQueue = new ConcurrentLinkedQueue<>();
    private final ExecutorService logWriter = Executors.newSingleThreadExecutor();
    private final ObservabilityManager observabilityManager;
    private volatile boolean isShutdown = false;
    
    private OutputStreamWriter fileWriter;
    private PrintWriter printWriter;
    
    @Autowired
    public ObservabilityLogger(ObservabilityManager observabilityManager) {
        this.observabilityManager = observabilityManager;
        initializeFileLogging();
        startLogProcessor();
    }
    
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        logInfo("OBSERVABILITY", "ПланПро API logging system initialized");
        logInfo("SYSTEM", "OS: " + System.getProperty("os.name"));
        logInfo("SYSTEM", "Java version: " + System.getProperty("java.version"));
    }
    
    public void logInfo(String category, String message) {
        log(LogLevel.INFO, category, message, null);
    }
    
    public void logWarning(String category, String message) {
        log(LogLevel.WARNING, category, message, null);
    }
    
    public void logError(String category, String message, Throwable throwable) {
        log(LogLevel.ERROR, category, message, throwable);
        observabilityManager.trackError(category, message, throwable);
    }
    
    public void logRequest(String correlationId, String method, String path, int statusCode, long duration) {
        String message = String.format("%s %s -> %d (%dms)", method, path, statusCode, duration);
        log(LogLevel.INFO, "HTTP_REQUEST", "[" + correlationId + "] " + message, null);
        observabilityManager.recordMetric("http_requests_total", 1);
        observabilityManager.recordMetric("http_request_duration_ms", duration);
    }
    
    public void logApiCall(String correlationId, String operation, String result, long duration) {
        String message = String.format("%s -> %s (%dms)", operation, result, duration);
        log(LogLevel.INFO, "API_CALL", "[" + correlationId + "] " + message, null);
        observabilityManager.recordMetric("api_calls_total", 1);
        observabilityManager.recordMetric("api_call_duration_ms", duration);
    }
    
    private void log(LogLevel level, String category, String message, Throwable throwable) {
        LogEntry entry = new LogEntry(LocalDateTime.now(), level, category, message, throwable, Thread.currentThread().getName());
        logQueue.offer(entry);
        System.out.println(formatLogEntry(entry));
    }
    
    private void startLogProcessor() {
        logWriter.submit(() -> {
            while (!isShutdown || !logQueue.isEmpty()) {
                try {
                    LogEntry entry = logQueue.poll();
                    if (entry != null) writeToFile(entry);
                    Thread.sleep(10);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
    }
    
    private void initializeFileLogging() {
        try {
            String logFileName = "projectlibre-api-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + ".log";
            fileWriter = new OutputStreamWriter(new FileOutputStream(logFileName, true), StandardCharsets.UTF_8);
            printWriter = new PrintWriter(fileWriter);
        } catch (IOException e) {
            System.err.println("Failed to initialize file logging: " + e.getMessage());
        }
    }
    
    private void writeToFile(LogEntry entry) {
        if (printWriter != null) {
            try {
                printWriter.println(formatLogEntry(entry));
                printWriter.flush();
            } catch (Exception e) {
                System.err.println("Failed to write to log file: " + e.getMessage());
            }
        }
    }
    
    private String formatLogEntry(LogEntry entry) {
        String timestamp = entry.timestamp.format(TIMESTAMP_FORMAT);
        String message = entry.message;
        if (entry.throwable != null) {
            message += " - " + entry.throwable.getMessage();
            for (StackTraceElement element : entry.throwable.getStackTrace()) {
                message += "\n    at " + element.toString();
            }
        }
        return String.format(LOG_FORMAT, timestamp, entry.level.name(), entry.category, message);
    }
    
    public void shutdown() {
        isShutdown = true;
        logInfo("OBSERVABILITY", "Shutting down logging system");
        while (!logQueue.isEmpty()) {
            LogEntry entry = logQueue.poll();
            if (entry != null) writeToFile(entry);
        }
        logWriter.shutdown();
        try {
            if (printWriter != null) printWriter.close();
            if (fileWriter != null) fileWriter.close();
        } catch (IOException e) {
            System.err.println("Error closing log files: " + e.getMessage());
        }
    }
}
