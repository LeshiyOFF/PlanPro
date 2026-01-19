package com.projectlibre.api.test;

/**
 * Interface for test scenarios that can be executed concurrently
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public interface TestScenario {
    
    String getName();
    
    boolean executeRequest(int threadId, int requestId);
    
    void setup();
    
    void cleanup();
}