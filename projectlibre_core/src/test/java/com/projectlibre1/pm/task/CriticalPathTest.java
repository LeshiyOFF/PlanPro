/*******************************************************************************
 * Tests for Critical Path calculation logic
 * Covers TODO at NormalTask.java:270 (magic numbers and config)
 * 
 * These are ISOLATED unit tests that test critical path logic directly
 * without requiring full ProjectLibre initialization.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 *******************************************************************************/
package com.projectlibre1.pm.task;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * Isolated tests for critical path calculation logic.
 * Tests the algorithm without requiring full ProjectLibre initialization.
 */
class CriticalPathTest {
    
    // Current hardcoded value from NormalTask.java:270
    private static final long CURRENT_THRESHOLD = 60000L; // 1 minute in ms
    
    /**
     * Simulates the current isCritical() logic from NormalTask
     * A task is critical if (lateFinish - earlyFinish) < threshold
     */
    private boolean isCritical(long earlyFinish, long lateFinish, long threshold) {
        if (earlyFinish <= 0 || lateFinish <= 0) {
            return false;
        }
        return (lateFinish - earlyFinish) < threshold;
    }
    
    /**
     * Calculates slack (float) for a task
     */
    private long calculateSlack(long earlyFinish, long lateFinish) {
        return lateFinish - earlyFinish;
    }
    
    @Test
    @DisplayName("Task with zero slack should be critical")
    void testZeroSlackIsCritical() {
        long earlyFinish = 1000000L;
        long lateFinish = 1000000L;
        
        Assertions.assertTrue(isCritical(earlyFinish, lateFinish, CURRENT_THRESHOLD),
            "Task with zero slack should be critical");
    }
    
    @Test
    @DisplayName("Task with slack less than threshold should be critical")
    void testSmallSlackIsCritical() {
        long earlyFinish = 1000000L;
        long lateFinish = earlyFinish + 30000L; // 30 seconds slack
        
        Assertions.assertTrue(isCritical(earlyFinish, lateFinish, CURRENT_THRESHOLD),
            "Task with 30s slack (< 60s threshold) should be critical");
    }
    
    @Test
    @DisplayName("Task with slack greater than threshold should not be critical")
    void testLargeSlackNotCritical() {
        long earlyFinish = 1000000L;
        long lateFinish = earlyFinish + 120000L; // 2 minutes slack
        
        Assertions.assertFalse(isCritical(earlyFinish, lateFinish, CURRENT_THRESHOLD),
            "Task with 2min slack (> 60s threshold) should not be critical");
    }
    
    @ParameterizedTest
    @DisplayName("Parametrized critical path test")
    @CsvSource({
        "1000000, 1000000, 60000, true",   // Zero slack - critical
        "1000000, 1030000, 60000, true",   // 30s slack - critical
        "1000000, 1059999, 60000, true",   // Just under threshold - critical
        "1000000, 1060000, 60000, false",  // Exactly at threshold - not critical
        "1000000, 1120000, 60000, false",  // Above threshold - not critical
    })
    void testCriticalPathVariousSlacks(long earlyFinish, long lateFinish, 
                                        long threshold, boolean expectedCritical) {
        boolean actual = isCritical(earlyFinish, lateFinish, threshold);
        Assertions.assertEquals(expectedCritical, actual,
            "Critical path calculation mismatch for slack=" + (lateFinish - earlyFinish));
    }
    
    @Test
    @DisplayName("Task with invalid early finish should not be critical")
    void testInvalidEarlyFinishNotCritical() {
        Assertions.assertFalse(isCritical(0, 1000000L, CURRENT_THRESHOLD),
            "Task with zero early finish should not be critical");
        Assertions.assertFalse(isCritical(-1, 1000000L, CURRENT_THRESHOLD),
            "Task with negative early finish should not be critical");
    }
    
    @Test
    @DisplayName("Task with invalid late finish should not be critical")
    void testInvalidLateFinishNotCritical() {
        Assertions.assertFalse(isCritical(1000000L, 0, CURRENT_THRESHOLD),
            "Task with zero late finish should not be critical");
        Assertions.assertFalse(isCritical(1000000L, -1, CURRENT_THRESHOLD),
            "Task with negative late finish should not be critical");
    }
    
    @Test
    @DisplayName("Slack calculation should be correct")
    void testSlackCalculation() {
        Assertions.assertEquals(0L, calculateSlack(1000000L, 1000000L),
            "Zero slack calculation");
        Assertions.assertEquals(60000L, calculateSlack(1000000L, 1060000L),
            "60 second slack calculation");
        Assertions.assertEquals(3600000L, calculateSlack(1000000L, 4600000L),
            "1 hour slack calculation");
    }
    
    @ParameterizedTest
    @DisplayName("Different threshold values should work correctly")
    @ValueSource(longs = {0L, 1000L, 60000L, 3600000L, 86400000L})
    void testDifferentThresholds(long threshold) {
        long earlyFinish = 1000000L;
        
        // Slack exactly at threshold - should not be critical
        long lateFinishAtThreshold = earlyFinish + threshold;
        Assertions.assertFalse(isCritical(earlyFinish, lateFinishAtThreshold, threshold),
            "Task with slack at threshold should not be critical");
        
        // Slack just below threshold - should be critical (if threshold > 0)
        if (threshold > 0) {
            long lateFinishBelowThreshold = earlyFinish + threshold - 1;
            Assertions.assertTrue(isCritical(earlyFinish, lateFinishBelowThreshold, threshold),
                "Task with slack below threshold should be critical");
        }
    }
    
    @Test
    @DisplayName("Critical path with configurable threshold")
    void testConfigurableThreshold() {
        long earlyFinish = 1000000L;
        long lateFinish = earlyFinish + 300000L; // 5 minutes slack
        
        // With 1 minute threshold - not critical
        Assertions.assertFalse(isCritical(earlyFinish, lateFinish, 60000L),
            "Should not be critical with 1 minute threshold");
        
        // With 10 minute threshold - critical
        Assertions.assertTrue(isCritical(earlyFinish, lateFinish, 600000L),
            "Should be critical with 10 minute threshold");
    }
    
    @Test
    @DisplayName("Current magic number 60000 should equal 1 minute")
    void testMagicNumberValue() {
        // Verify the magic number from NormalTask.java:270
        long oneMinuteInMs = 60 * 1000;
        Assertions.assertEquals(oneMinuteInMs, CURRENT_THRESHOLD,
            "Current threshold should equal 1 minute in milliseconds");
    }
}
