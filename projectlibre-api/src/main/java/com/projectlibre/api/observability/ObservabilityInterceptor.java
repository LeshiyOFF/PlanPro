package com.projectlibre.api.observability;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.UUID;

/**
 * Request tracking interceptor for correlation IDs and logging
 * Provides observability for HTTP requests
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
@Component
public class ObservabilityInterceptor implements HandlerInterceptor {
    
    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String START_TIME_ATTRIBUTE = "startTime";
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String correlationId = UUID.randomUUID().toString();
        request.setAttribute(CORRELATION_ID_HEADER, correlationId);
        request.setAttribute(START_TIME_ATTRIBUTE, System.currentTimeMillis());
        
        response.setHeader(CORRELATION_ID_HEADER, correlationId);
        
        System.out.println("[" + correlationId + "] Request: " + request.getMethod() + " " + request.getRequestURI());
        
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                           Object handler, Exception ex) {
        String correlationId = (String) request.getAttribute(CORRELATION_ID_HEADER);
        Long startTime = (Long) request.getAttribute(START_TIME_ATTRIBUTE);
        
        if (startTime != null) {
            long duration = System.currentTimeMillis() - startTime;
            System.out.println("[" + correlationId + "] Response: " + response.getStatus() + 
                             " (" + duration + "ms)");
        }
        
        if (ex != null) {
            ObservabilityManager.getInstance().trackError("HTTP_EXCEPTION", 
                "Request failed with correlation ID: " + correlationId, ex);
        }
        
        // Record request metrics
        ObservabilityManager.getInstance().recordMetric("http_requests", 1);
        ObservabilityManager.getInstance().recordMetric("http_response_time", 
            startTime != null ? System.currentTimeMillis() - startTime : 0);
    }
}